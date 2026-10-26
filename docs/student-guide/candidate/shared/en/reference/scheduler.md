# Scheduler API Reference: register and cancel your own tasks

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Use the Host profile documentation for Host Python interfaces and execution behavior.

## Availability and role

All eight candidate HLMP targets expose `m.scheduler`, but carrier and BarePico do not use the same Scheduler class. This is an accessible Runtime interface in the current source, not a claim of identical behavior across every past or future version. Host Python does not use this contract. No peripheral or wireless hardware is required; see [Lifecycle Reference](lifecycle.md) for target IDs.

## `add_task` signatures and differences

| Item | MangoX2 / MangoLite | BarePico |
|---|---|---|
| Signature | `m.scheduler.add_task(callback, period, once=False)` | `m.scheduler.add_task(callback, period=50, once=False)` |
| `callback` | Source does not validate callability before registration; calls it when due | Must be callable or raises `TypeError` |
| Callback arguments / return | No arguments; return value ignored | No arguments; return value ignored |
| `period` | Required; source applies `max(0, int(period))`; milliseconds | Default 50 ms; requires `type(period) is int` and at least 10 |
| `once` | Default False; converted with `bool` | Default False; requires `bool` |
| Return | `int` task ID; first ID can be 0 | `int` task ID, increasing from 1 |

**Shared rule: pass a callable, an explicit integer `period >= 10`, and a bool for `once`.** Carrier acceptance of negative values, strings or 0 ms is not a cross-board feature. Do not omit the period and rely on BarePico's default.

The first run becomes due one period after registration and still needs the event loop to advance. A `once=True` task is removed after that execution; a caught ordinary callback `Exception` does not turn it into an automatically retried one-shot. Each pass handles due work without replaying every missed time slot. There is no hard real-time guarantee.

## `remove_task` signatures and returns

| Item | MangoX2 / MangoLite | BarePico |
|---|---|---|
| Signature | `m.scheduler.remove_task(task_id)` | `m.scheduler.remove_task(ident)` |
| Argument | Your saved integer ID; `None` is ignored | Your saved integer ID |
| Task found | Removes it; returns `None` | Removes it; returns `True` |
| Missing / already cancelled | An unused valid integer ID does nothing; returns `None` | Returns `False` |

An ID belongs to the Scheduler/Mango instance that created it. Do not reuse it across new objects or guess IDs. Zero is valid. Shared code ignores the cancellation return and manages ownership using its saved state.

Cancellation cannot preempt a running Python callback or undo hardware commands it already sent. Use the device's formal stop operation for outputs. For multi-task changes, set a flag, then cancel/register your own work after `run_once()` returns instead of changing the current pass's task collection inside a callback.

## Execution, exceptions and shortcuts to avoid

- Drive work through `m.run_once()` or `m.run_forever()`. Use the former for foreground flags and the latter for already registered, brief callbacks.
- `m.scheduler.run()` is an internal Runtime driver. It does not replace the Mango entry point, especially on X2 where a callback queue must also be handled.
- `m.scheduler.clear()` removes shared tasks. Students must not use it to cancel one effect. Runtime performing its own final cleanup is a separate responsibility.
- Do not re-enter the Scheduler/event loop from a callback, recurse to wait for work or sleep for long intervals. Slow callbacks delay other work.
- A repeating task normally remains registered after an ordinary callback `Exception` is printed. Exception handling is not proof of success or a complete canonical logging guarantee.

BarePico has a Scheduler re-entry guard; that does not make a recursive event loop a supported pattern. Carrier provides no equivalent guard contract. Both families run callbacks cooperatively on one thread, with no automatic parallelism, hard deadlines or preemptive cancellation.

## Parameter errors and diagnosis

| Case | Source behavior / response |
|---|---|
| Carrier omits `period` | Python `TypeError` |
| Carrier period cannot be converted to an integer | Ordinary conversion `TypeError`/`ValueError` |
| BarePico period is bool, non-integer or below 10 | `ValueError` |
| BarePico callback is not callable | `TypeError` |
| BarePico `once` is not bool | `TypeError` |
| Carrier callback is not callable | Registration may succeed; Scheduler prints a call error when due |
| Wrong ID type for cancellation | Comparison, indexing or hashing can raise `TypeError`; use actual returned IDs |
| Long work or blocking input | Other callbacks are delayed; split work into small steps and foreground flags |

Scheduler registration and every tick do not promise a Student API structured event. Do not print `@@MANGO_EVENT@@` yourself or log every pass as an observation strategy. The Guide's output limit is an example design choice, not automatic Runtime throttling of arbitrary `print()` calls.

## Minimal complete example: one delayed request, foreground finish

```python
from mangobox import Mango
import time

m = Mango()
task_id = None
state = {"due": False}

def request_finish():
    state["due"] = True

try:
    task_id = m.scheduler.add_task(request_finish, period=1000, once=True)
    while not state["due"]:
        m.run_once()
        time.sleep_ms(10)
    print("The one-shot request was handled")
finally:
    if task_id is not None:
        m.scheduler.remove_task(task_id)
    m.close()
```

This normally finishes after about a second. Cancelling the completed one-shot again has different family return values; the program does not depend on them. `finally` cleans up its own ID and closes the object. Do not advance work after close.

## Related interfaces

[Scheduler Guide](../guides/scheduler.md) · [Lifecycle](lifecycle.md) · [Runtime Config](runtime-config.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/runtime/scheduler.py`
- `runtime/mangolite-pico2w/firmware/mangolite/runtime/scheduler.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_callback_queue.py`
- `runtime/barepico/firmware/barepico/core.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
