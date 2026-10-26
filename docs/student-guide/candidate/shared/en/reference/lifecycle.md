# Lifecycle and capability discovery API Reference

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Use the Host profile documentation for Host Python interfaces and execution behavior.

## Scope and common entry point

These are the lifecycle interfaces for eight candidate **High-Level MicroPython** targets. This table advertises only the interfaces on this page, not all peripherals or wireless services.

| Target ID | Family | Common interfaces on this page |
|---|---|---|
| `mangox2-pico` | MangoX2 | Available |
| `mangox2-picow` | MangoX2 | Available |
| `mangox2-pico2w` | MangoX2 | Available |
| `mangolite-picow` | MangoLite | Available |
| `mangolite-pico2w` | MangoLite | Available |
| `barepico-pico` | BarePico | Available |
| `barepico-picow` | BarePico | Available |
| `barepico-pico2w` | BarePico | Available |

The common construction form is `from mangobox import Mango` followed by `Mango()`. Additional family-specific constructor options are not combined into a cross-board contract here. Use Host documentation for Host Python 0.4.6 construction and lifecycle; the nested config/Scheduler contract here does not apply to Host.

## Signatures, parameters and returns

| Method | MangoX2 / MangoLite | BarePico |
|---|---|---|
| `Mango()` | Creates a board-side Mango object | Creates an independent BarePico object; construction starts no external GPIO, UART, I²C or radio |
| `m.capabilities()` | `list[str]`, derived from the capability catalog, enabled configuration and installed methods | `dict`, with the exact fields listed below |
| `m.run_once()` | No arguments; one pass; returns `None` | No arguments; returns the `int` number of Scheduler callbacks executed this pass, not a sensor-event count |
| `m.run_forever(sleep_ms=10)` | `sleep_ms` is the pause between iterations in milliseconds; common examples use its default; closes on exit; returns `None` | This parameterized signature is unavailable |
| `m.run_forever()` | Common form using the default pause | No parameters; approximately 10 ms pause per iteration; returns `None` on normal termination; caller must arrange `finally: close()` |
| `m.close()` | No parameters; cleans up services and requests Runtime reset; returns `None` | No parameters; releases active services/resources and Scheduler work; returns `None` |

Carrier interval handling is not identical: X2's callback-queue wrapper converts with `int()` and clamps negative values to zero; Lite uses its own `_sleep_ms()` helper. Do not rely on conversions of invalid values as a common validation interface. Use parameterless `run_forever()` for shared programs.

`run_once()` does not wait for the next deadline and does not guarantee that every registered callback runs. `run_forever()` blocks the main flow until it exits. Neither return value proves a physical action succeeded.

## Exact `capabilities()` differences

BarePico returns these fields:

| Field | Type / current meaning |
|---|---|
| `carrier_board` | `None` |
| `target` | `str`, current target ID |
| `mcu_family` | `str`, MCU family from the profile |
| `wireless_capable` | `bool`, wireless hardware in that target; not a connection state |
| `has_carrier_led` | `False` |
| `has_carrier_button` | `False` |
| `has_carrier_motor` | `False` |
| `has_carrier_buzzer` | `False` |

The carrier `list[str]` contains matching entries in its existing capability catalog, including installed source extensions where applicable. It is not a complete method listing or a physical peripheral self-test. BarePico dictionary keys must not be interpreted as carrier capability names.

**`supports(capability)` is carrier-only**: it normalizes a capability name using existing source aliases and returns `bool`. A name outside the capability catalog may return False even when another independent facade exists. BarePico has no `supports` method; shared eight-target examples must not call or invent it.

## Event processing and resource lifecycle

After construction, configure and register devices according to their own contracts. Choose either `run_forever()` or a foreground `run_once()` loop. MangoX2 also drains its managed callback queue after the Scheduler returns, so invoking the Scheduler directly is not an equivalent pass.

Callback arguments depend on the module; only custom Scheduler callbacks are uniformly parameterless. Return promptly. Do not re-enter the event loop, sleep for long periods or switch several complex services on the callback stack. Record a flag and handle the work in the foreground.

Arrange `close()` on normal and exceptional exits. Repeated cleanup is a useful safeguard, but its `None` result is not an acknowledgment that every physical device stopped: some cleanup errors are printed or ignored. If audio needs a stop command and a queue-draining interval, do that in the foreground before closing. Do not continue using the object after `close()`.

## Errors and logging

- BarePico `run_once()` after close raises `RuntimeError("Mango is closed")`. Carrier has no equivalent post-close validation contract.
- Carrier `run_forever()` catches Ctrl+C and performs cleanup. BarePico lets Ctrl+C reach its caller. Shared examples use `finally`.
- Ordinary callback `Exception` values are generally caught and printed by the Scheduler. This does not repair a task; a periodic task can fail again on its next run. Initialization, foreground or other errors may still propagate.
- The structured-event marker is `@@MANGO_EVENT@@`, emitted by Runtime. Students should not create event lines, dump configuration, expose Wi-Fi passwords or print private data. Per-frame/per-poll output is not meaningful acceptance evidence.
- There is no promise that every unhandled exception is captured, or that each ordinary error line is a canonical `run_error` event.

## Minimal complete example

This example uses `run_forever()` with one brief callback per second. Press Ctrl+C to stop. For foreground flags, use the Guide's `run_once()` example.

```python
from mangobox import Mango

m = Mango()
task_id = None

def tick():
    print("One scheduled update")

try:
    task_id = m.scheduler.add_task(tick, period=1000)
    m.run_forever()
finally:
    if task_id is not None:
        m.scheduler.remove_task(task_id)
    m.close()
```

## Version evidence and related interfaces

| Evidence | What it establishes |
|---|---|
| Source SHA on this page | Which implementation the text was checked against |
| Candidate profile firmware/overlay information | Which board-side implementation generation expects |
| MangoThonny application version | Computer-side tool version; not a substitute for board firmware identity |
| Test record for a particular board | Physical results under those test conditions; syntax checking does not establish this |

[Lifecycle Guide](../guides/lifecycle.md) · [Scheduler Reference](scheduler.md) · [Runtime Config Reference](runtime-config.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/student_api.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_callback_queue.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_capabilities.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_pot.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api_ble_control.py`
- `runtime/barepico/firmware/barepico/student_ble_control_vnext.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
