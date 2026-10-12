# MangoBox Scheduler — Creating Cooperative Periodic Tasks

Applicable to High-Level MicroPython on MangoLite/MangoX2. The Runtime exposes `m.scheduler`; this low-level scheduling object is available in current implementations but is **not a separately version-guaranteed high-level Student API**. Do not use these methods in Host Python.

A cooperative scheduler calls short callbacks when due. `m.run_forever()` keeps it running. The period is a requested interval in milliseconds, not an accurate hardware timer or an animation's full cycle.

```python
from mangobox import Mango
m = Mango()
phase = 0
STRIP = "strip1"
COUNT = 8

def custom_frame():
    global phase
    for i in range(COUNT):
        # Hand-built LED pattern: one rotating cyan dot and dim blue backdrop.
        m.led(i, "#00ffff" if i == phase % COUNT else "#000014",
              strip=STRIP)
    phase += 1

m.brightness(50, strip=STRIP)
task_id = m.scheduler.add_task(custom_frame, period=120)
m.run_forever()
```

The animation uses basic `led()` instead of built-in `rainbow()`, `breath()`, or `led_start_meteor()`. Ensure the strip name and LED count match Device Manager.

To stop this task from another callback:

```python
m.scheduler.remove_task(task_id)
m.led_off(strip=STRIP)
```

You may schedule `once=True` callbacks, but do not call `m.scheduler.clear()` merely to stop your animation: it would also clear other registered Runtime tasks. Avoid long sleeps or blocking loops within callbacks. The scheduler is cooperative, not preemptive. For long LED strips increase the period or use only batch APIs actually documented for the installed Runtime.

See [Scheduler reference](reference/scheduler.md) and [LED guide](guides/led.md).

## Deferred actions from Button/Sensor callbacks — tested pattern

**Validated hardware case (MangoBox acrylic music lamp v2.2.2):** Performing an effect switch, `led_off()` and other hardware operations directly inside a button-release polling callback produced `[Scheduler] task error: maximum recursion depth exceeded`. The traceback showed nested synchronous calls from `digital_input._step()` to the user's `button_released()`, `apply_mode()`, `MangoEffects.stop()` and `led_off()`. Moving complex switching operations into the top-level main loop resolved the observed error during device testing. This does **not** prove an infinite recursive loop, nor implicate the buzzer.

**Pattern:** Have Button/Sensor callbacks only record a request or desired state; handle complex device operations and multi-effect transitions after `m.run_once()` returns. Small, safe callbacks need not always be deferred.

```python
from mangobox import Mango

m = Mango()
STRIP = "strip1"   # Must exist and be enabled in Device Manager
COLORS = ("red", "blue", "green")
mode = 0
pending_mode_change = False

def button_released():
    global pending_mode_change
    pending_mode_change = True

def apply_mode():
    m.led_off(strip=STRIP)
    m.led_all(COLORS[mode], strip=STRIP)

m.on_released("button8", button_released)
m.start_sensor("button8", period=50)
apply_mode()

try:
    while True:
        m.run_once()
        if pending_mode_change:
            pending_mode_change = False
            mode = (mode + 1) % len(COLORS)
            apply_mode()
except KeyboardInterrupt:
    m.led_off(strip=STRIP)
```

When using this custom main loop, **do not also call `m.run_forever()`**: that would prevent the code after it from servicing pending actions. Keep long-press checks, song replay and other foreground application logic in the same loop. A single flag coalesces rapid events; use a bounded queue if every event matters. Remove individual effect tasks with `m.scheduler.remove_task(task_id)`, not shared `scheduler.clear()`.
