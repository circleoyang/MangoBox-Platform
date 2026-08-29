# PIR Motion API Reference

> Expose this page only when the documentation resolver confirms the `motion` capability. A `pir_sensor_pin` configuration key alone does not establish API availability.

## `is_motion_detected()`

```python
is_motion_detected() -> bool
```

Returns the current semantic PIR state.

Raises `RuntimeError` when the PIR module is disabled.

## `on_motion_detected()`

```python
on_motion_detected(callback) -> None
```

Runs `callback` when motion becomes active.

## `on_motion_cleared()`

```python
on_motion_cleared(callback) -> None
```

Runs `callback` when motion returns inactive.

## Execution lifecycle

| API | High Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `is_motion_detected()` | Immediate synchronous current-state read | not required |
| `on_motion_detected()` / `on_motion_cleared()` | automatically start the PIR watcher; later sensor updates are Scheduler-driven | required |

PIR callbacks start their own watcher, so no separate `start_sensor()` call is required. If direct reads work but callbacks do not, first confirm the event loop remains active.

## Configuration

```text
enabled_modules.pir_sensor
pir_sensor_pin
```

## Troubleshooting contract

```text
supports("motion")
→ module enablement
→ pir_sensor_pin
→ Device Manager (when the selected version provides the relevant Live Read)
→ minimal machine.Pin raw diagnostic
→ physical Signal / VCC / GND wiring
```

Use Hardware Lab when the issue is firmware, execution mode, Recovery, Clean Flash, or another device-lifecycle problem. The current Hardware Lab is not a general PIR digital-input tester.

## Example

```python
from mangobox import Mango

m = Mango()

def detected():
    print("motion")

m.on_motion_detected(detected)
m.run_forever()
```

## Related

`is_motion_detected()`, `on_motion_detected()`, `on_motion_cleared()`, `run_forever()`
