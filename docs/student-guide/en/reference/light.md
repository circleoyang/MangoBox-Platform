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
on_light_above(threshold, callback, hysteresis=5, period=100) -> None
```

Runs the callback when the value crosses upward through `threshold`.

## `on_light_below()`

```python
on_light_below(threshold, callback, hysteresis=5, period=100) -> None
```

Runs the callback when the value crosses downward through `threshold`.

Threshold and hysteresis use the 0–100 semantic range. `period` is the watcher update interval in milliseconds.

Raises `ValueError` for threshold/hysteresis values outside 0–100.

## Execution lifecycle

| API | High Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `light()` | Immediate synchronous calibrated-value read | not required |
| `on_light_above()` / `on_light_below()` | create a threshold watcher and start sensor updates; later work is Scheduler-driven | required |

Light callbacks start their own watcher, so no separate `start_sensor()` call is required. If `light()` reads correctly but callbacks do not fire, inspect the event loop, threshold, hysteresis, and period first.

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

## `on_light_change()` — Change callback

```python
m.on_light_change(callback, threshold=2, period=100)
m.stop_light_change()
```

Samples the existing `m.light()` method and dispatches only when a valid reading differs from the **last delivered callback value** by at least `threshold`. The first valid observation is delivered once. The default threshold is 2 0–100 relative light points; the default requested sampling period is 100 ms. Actual sampling timing depends on device and transport latency. The callback receives `value`.  

```python
from mangobox import Mango
m = Mango()
def changed(value):
    print('light:', value)
m.on_light_change(changed, threshold=2)
m.run_forever()
```

Use `m.stop_light_change()` to stop this watcher or `m.close()` to close all. Change events are logged as `sensor_event / change`, while technical polling logs are suppressed. Existing threshold events remain independent.

> **Version note:** Change APIs require a Runtime / Host package that integrates Sensor Change v1. Older versions may not include them. Check the Host package actually bundled with MangoThonny.
