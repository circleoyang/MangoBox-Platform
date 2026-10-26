# Lifecycle guide: create, process events and close

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Use the Host profile documentation for Host Python interfaces and execution behavior.

## 1. What can you build?

A responsive project creates one `Mango()`, prepares its devices and callbacks, keeps the event loop moving, and closes the object when finished. Registering a task does not start an independent background thread. Buttons, sensors, animations and audio services need regular opportunities to run.

This page applies to eight candidate HLMP targets: MangoX2 with Pico, Pico W or Pico 2 W; MangoLite with Pico W or Pico 2 W; and BarePico with Pico, Pico W or Pico 2 W. The common import is `from mangobox import Mango`. BarePico has no carrier peripherals to assume; configure and enable external devices explicitly in Device Manager (DM).

## 2. A 30-second test: create once and finish cleanly

```python
from mangobox import Mango

m = Mango()
try:
    info = m.capabilities()
    if isinstance(info, dict):
        print("target:", info.get("target"))
        print("wireless hardware:", info.get("wireless_capable"))
    elif isinstance(info, list):
        print("configured capabilities:", ", ".join(info))
    else:
        raise RuntimeError("Check the selected firmware profile")
    m.run_once()
    print("One event-loop pass completed")
finally:
    m.close()
```

This test reads capability information and advances the event loop once. It registers no new hardware task and does not prove that a sensor, network or speaker is connected. `finally` gives cleanup an opportunity to run after normal completion or an error in the body.

## 3. What should you observe?

| Family | Actual `capabilities()` shape | What it tells you |
|---|---|---|
| MangoX2 / MangoLite | `list[str]` | Entries in the capability catalog that are enabled and have their required methods |
| BarePico | `dict` | Target identity, MCU family, wireless hardware and carrier flags |

BarePico's `wireless_capable=True` identifies hardware in the selected board profile. It does not confirm a Wi-Fi connection or installation of every wireless facade. A carrier capability list is also not a complete vNext method inventory. Use the selected profile's API Reference to decide whether a new method is available.

The test should finish with `One event-loop pass completed`. Runtime configuration messages may also appear during startup. An ordinary `print()` line is not a hardware acceptance record.

## 4. Common use: choose one main-loop pattern

| Project requirement | Choose | Who controls the next step? |
|---|---|---|
| All work is registered and callbacks are brief | `m.run_forever()` | Mango checks due tasks until interrupted or closed |
| Foreground flags, deadlines or changes across devices | A loop calling `m.run_once()` | Your program decides what to do after each pass |

Choose one driver for a main flow. Do not call `run_forever()` inside a `run_once()` loop or call either event-loop method from a callback. MangoX2 also drains its callback queue inside `run_once()`, so directly calling `m.scheduler.run()` is not an equivalent replacement.

Carrier `run_forever()` closes the object when it exits; BarePico leaves cleanup to its caller. A common program still uses `try/finally: m.close()`. If shutdown needs to send a stop request and advance an audio queue before releasing services, use a foreground `run_once()` loop and perform that sequence before `close()`.

## 5. Complete interactive example: choose the number of updates

Enter a number from 1 to 10 in the Shell before scheduling starts. The callback only sets a flag; counting and display happen after `run_once()` returns.

```python
from mangobox import Mango
import time

m = Mango()
task_id = None
state = {"pending": False, "count": 0}

def request_update():
    state["pending"] = True

try:
    limit = int(input("How many updates (1..10)? "))
    if not 1 <= limit <= 10:
        raise ValueError("Choose an integer from 1 to 10")
    task_id = m.scheduler.add_task(request_update, period=1000)
    while state["count"] < limit:
        m.run_once()
        if state["pending"]:
            state["pending"] = False
            state["count"] += 1
            print("Update", state["count"], "of", limit)
        time.sleep_ms(10)
finally:
    if task_id is not None:
        m.scheduler.remove_task(task_id)
    m.close()
```

Entering 3 should produce three updates about one second apart, then finish. `input()` runs before the task is registered: waiting for typing inside an active cooperative loop would pause its other work. The 10 ms pause avoids busy spinning; it does not provide a precise real-time guarantee.

A flag merges repeated requests that have not yet been handled. This suits work where one pending update is enough. If every event matters, use a bounded queue and define what happens when it is full.

## 6. Modes, versions and troubleshooting

Check the execution mode and profile first, then enabled modules, names and GPIO settings. Use DM and a minimal program before inspecting wiring and power. Host Python is a separate computer-side mode; sharing the Mango name does not give it this page's board-side config, Scheduler or `time.sleep_ms()` behavior.

The source SHA, board firmware version and MangoThonny application version identify different things. Selecting candidate source or updating the IDE does not establish that every board was flashed or tested. Check audio overlays separately. To start again after closing, create a new `Mango()` instead of relying on differences in how closed objects happen to behave.

The Runtime's structured-event marker is `@@MANGO_EVENT@@`. Students should not print that marker, construct event JSON or invent canonical IDs. Observe meaningful changes briefly; avoid per-frame or per-poll output and never print credentials from configuration. A Scheduler may catch and print callback `Exception` values. That is not a promise that every Python failure becomes a complete `run_error` record.

## 7. Small challenge

Change the counter so it stops accepting new updates after five seconds and exits after the current work finishes. Keep one Mango and one main loop. Check that Ctrl+C still reaches `finally`. Before adding devices, explain each callback's inputs, which code owns its task ID and what must be released at shutdown.

[Lifecycle API Reference](../reference/lifecycle.md) · [Scheduler](scheduler.md) · [Runtime Config](runtime-config.md)

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
