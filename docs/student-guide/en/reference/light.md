# Light Sensor API Reference

> Show this page only when the selected target/mode/version provides the `light` capability.

## `light()`

```python
light() -> int
```

Returns a calibrated relative light level from 0 to 100. It is not lux.

Raises `RuntimeError` when the module is disabled.

## `on_light_above()`

```python
on_light_above(threshold, callback, hysteresis=5) -> None
```

Runs the callback when the value crosses upward through `threshold`.

## `on_light_below()`

```python
on_light_below(threshold, callback, hysteresis=5) -> None
```

Runs the callback when the value crosses downward through `threshold`.

Threshold and hysteresis use the 0–100 semantic range.

Raises `ValueError` for values outside 0–100.

## Execution lifecycle

| API | High Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `light()` | Immediate synchronous calibrated-value read | not required |
| `on_light_above()` / `on_light_below()` | create a threshold watcher and start sensor updates; later work is Scheduler-driven | required |

Light callbacks start their own watcher, so no separate `start_sensor()` call is required. If `light()` reads correctly but callbacks do not fire, inspect the event loop, threshold, and hysteresis first.

## Configuration

```text
enabled_modules.light_sensor
light_sensor_pin
light_raw_bright
light_raw_dark
light_sample_count
light_period_ms
light_hysteresis
```

Bright/dark calibration belongs to Device Manager/Runtime maintenance, not the learner API.

## Example

```python
from mangobox import Mango

m = Mango()

def dark():
    print("dark")

m.on_light_below(30, dark)
m.run_forever()
```

## Related

`light()`, `on_light_above()`, `on_light_below()`, `run_forever()`
