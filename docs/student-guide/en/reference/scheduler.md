# MangoBox Scheduler Reference (Runtime scheduling object)

Supported in High-Level MicroPython on MangoLite and MangoX2 through `m.scheduler`. This is a currently accessible low-level Runtime interface, not a separately version-guaranteed high-level Student API. Not available through Host Python.

## `m.scheduler.add_task(callback, period, once=False)`

Register a zero-argument callback. `period` is an interval in milliseconds; `once=True` schedules one execution only. Returns a task ID. Pass `update`, not `update()`.

## `m.scheduler.remove_task(task_id)`

Cancel a task using the ID returned by `add_task`. It does not turn off LEDs; call `m.led_off()` separately.

## `m.scheduler.clear()`

Clears **all shared scheduled tasks**, possibly including internal polling tasks. Normally avoid this in student code.

## `m.run_once()` / `m.run_forever(sleep_ms=10)`

`run_once()` checks currently due tasks; `run_forever()` continuously drives the scheduler. Without the event loop, periodic callbacks do not continue.

```python
from mangobox import Mango
m = Mango()

def tick():
    print("tick")

task_id = m.scheduler.add_task(tick, period=500)
m.run_forever()
```

Callbacks must be short and non-blocking; scheduling is cooperative, not a precise timer. LED effects should be hand-written with documented basic LED methods rather than guessed APIs.

See [full Scheduler tutorial](../scheduler.md).


## Callback stack safety (validated v2.2.2 hardware case)

Performing a full LED/music effect transition (`apply_mode()` → effect `stop()` → `m.led_off()`) inside a button polling callback resulted in `maximum recursion depth exceeded` on MicroPython. Defer complex operations: the callback sets `pending_mode_change = True`; the application's `while True` loop calls `m.run_once()` and then handles the pending request. **Do not combine that custom main loop with `m.run_forever()`**. Remove only the owned animation task, never `scheduler.clear()`. See the [Scheduler tutorial](../guides/scheduler.md).
