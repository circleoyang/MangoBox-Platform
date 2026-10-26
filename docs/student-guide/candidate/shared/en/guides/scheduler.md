# Scheduler guide: brief callbacks, explicit periods and foreground work

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Use the Host profile documentation for Host Python interfaces and execution behavior.

## 1. What can you build?

The Scheduler supports periodic frames, input observation and requests to handle work later. It is cooperative: another task gets its turn after the current callback returns. It is not a separate thread or a millisecond-accurate hardware interrupt.

`m.scheduler` is an existing Runtime object on all eight candidate HLMP targets. The family implementations still differ, so this page is tied to its source snapshot. Host Python does not use this nested scheduling contract.

## 2. A 30-second test: count five updates and finish

This example needs no peripherals and takes about five seconds. The callback increments a counter; the foreground shows changed values after `run_once()` returns.

```python
from mangobox import Mango
import time

m = Mango()
task_id = None
state = {"ticks": 0}

def tick():
    state["ticks"] += 1

try:
    task_id = m.scheduler.add_task(tick, period=1000)
    shown = 0
    while shown < 5:
        m.run_once()
        if state["ticks"] != shown:
            shown = state["ticks"]
            print("tick:", shown)
        time.sleep_ms(10)
finally:
    if task_id is not None:
        m.scheduler.remove_task(task_id)
    m.close()
```

Pass `tick` without parentheses to hand the function to the Scheduler. Writing `tick()` executes it during registration and passes its result instead of the callback you intended to run later.

## 3. What should you observe?

Expect values 1 through 5, about one second apart. `period=1000` is the due-check interval, not the callback's total duration or a precise clock. Other slow work can delay updates. The Scheduler does not replay every missed period for you.

`add_task()` returns an integer task ID. The first carrier ID can be **0**, so cleanup checks `is not None`, not `if task_id`. Removing a task cancels that task; it does not mean LEDs are off, motors have stopped or queued audio has been cleared.

## 4. Common use: periodic work, one-shot work and the event loop

| Need | Form / rule |
|---|---|
| Repeating work | `add_task(callback, period=1000)`; callback takes no arguments and its return value is ignored |
| One delayed request | Add `once=True`; keep driving the loop until due |
| Cancel your work | Save the returned ID and use `remove_task(id)` |
| No foreground work | Call `run_forever()` once after registration, with `finally: close()` |
| Mode changes or multiple devices | Set a flag in the callback and handle it after `run_once()` returns |

Shared programs explicitly pass an integer `period >= 10`. BarePico defaults to 50 ms when omitted and rejects values below 10. Carrier requires a period, converts it and clamps negatives to zero. The teaching examples do not exploit these differences to create a busy loop.

Do not use `m.scheduler.clear()` to stop one effect: it removes shared work and can disrupt sensors, buttons, audio and time services. Students also should not call `scheduler.run()` directly. MangoX2's `run_once()` performs additional callback-queue processing.

## 5. Complete interactive example: change speed after three seconds

Enter 500–2000 ms before scheduling starts. After three seconds, a one-shot callback merely requests a speed change. The foreground cancels its own counter task and registers a shorter period. Observe for about eight seconds, with output limited to one summary per second and a single speed-change message.

```python
from mangobox import Mango
import time

m = Mango()
tick_id = None
change_id = None
state = {"ticks": 0, "change_requested": False}

def tick():
    state["ticks"] += 1

def request_change():
    state["change_requested"] = True

try:
    period = int(input("Initial period in ms (500..2000): "))
    if not 500 <= period <= 2000:
        raise ValueError("Choose 500..2000 ms")
    tick_id = m.scheduler.add_task(tick, period=period)
    change_id = m.scheduler.add_task(request_change, period=3000, once=True)
    start = time.ticks_ms()
    last_second = -1
    while time.ticks_diff(time.ticks_ms(), start) < 8000:
        m.run_once()
        if state["change_requested"]:
            state["change_requested"] = False
            m.scheduler.remove_task(tick_id)
            tick_id = None
            period = max(100, period // 2)
            tick_id = m.scheduler.add_task(tick, period=period)
            print("New period:", period)
        second = time.ticks_diff(time.ticks_ms(), start) // 1000
        if second != last_second:
            last_second = second
            print("elapsed:", second, "ticks:", state["ticks"])
        time.sleep_ms(10)
finally:
    if tick_id is not None:
        m.scheduler.remove_task(tick_id)
    if change_id is not None:
        m.scheduler.remove_task(change_id)
    m.close()
```

The `once=True` request removes itself after execution; using its ID again during final cleanup is acceptable. Shared code does not depend on the removal return value: carrier returns `None`, while BarePico returns a `bool` indicating whether a task was found.

When extending this flag pattern to lighting, sound or display changes, keep complex operations in the foreground. A flag merges repeated unhandled requests. If every request must be preserved, design a bounded queue instead.

## 6. Modes, latency and troubleshooting

First check that the selected firmware provides this Runtime object and that the main loop keeps running. If a task does not fire, check that you passed a function, that the period is in milliseconds, and that another long callback, sleep or `input()` is not blocking it. Then inspect the device's enabled flag, name and GPIO.

Do not call `run_once()` or `run_forever()` from a callback, or recurse into the callback to wait for work. MicroPython has a limited stack; several nested synchronous hardware changes can trigger a recursion-depth error without a logically infinite loop. Foreground flag handling keeps the call stack shallower.

The Scheduler catches ordinary callback `Exception` values and prints a message. A repeating task may remain scheduled; that does not fix the error or guarantee a canonical event for every failure. Runtime owns the `@@MANGO_EVENT@@` marker. Students should not construct event lines. Observe meaningful changes instead of printing every poll, LED update or frame.

## 7. Small challenge

Add a second independent counter with a different period. Cancel only the first after three seconds and check that the second continues. Keep both IDs and explain why a global clear is unnecessary. If you add a custom LED animation, read the named strip's `leds` from DM, compute one frame per update and begin with a slower period that is easy to observe.

[Scheduler API Reference](../reference/scheduler.md) · [Runtime Config](runtime-config.md) · [Lifecycle](lifecycle.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/runtime/scheduler.py`
- `runtime/mangolite-pico2w/firmware/mangolite/runtime/scheduler.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_callback_queue.py`
- `runtime/barepico/firmware/barepico/core.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
