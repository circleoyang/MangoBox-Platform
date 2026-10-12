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


## Hardware-tested callback stack safety

A music-lamp application (v2.2.2) encountered `maximum recursion depth exceeded` when a button polling callback synchronously stopped and restarted LED effects. The validated fix is for the callback to set `pending_mode_change = True`, then service the request in an application loop *after* `m.run_once()`. See the [complete example](guides/scheduler.md). Do not also call `m.run_forever()` in that same program.
