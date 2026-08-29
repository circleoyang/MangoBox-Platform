# Sound Sensor API Reference

> Show this page only when the selected target/mode/version provides the `sound_level` capability.

## `sound_level()`

```python
sound_level() -> int
```

Returns a relative sound level from 0 to 100. It is not dB.

The current semantic value is normalized from peak-to-peak ADC amplitude inside a sampling window.

Raises `RuntimeError` when the module is disabled.

## `on_sound_above()`

```python
on_sound_above(threshold, callback, hysteresis=5) -> None
```

Runs a callback when sound crosses upward through the threshold.

## `on_sound_below()`

```python
on_sound_below(threshold, callback, hysteresis=5) -> None
```

Runs a callback when sound crosses downward through the threshold.

Raises `ValueError` for threshold/hysteresis outside 0–100.

## Execution lifecycle

| API | High Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `sound_level()` | Immediate synchronous current sound-level read | not required |
| `on_sound_above()` / `on_sound_below()` | create a threshold watcher and start periodic sampling; later work is Scheduler-driven | required |

Sound callbacks start their own watcher, so no separate `start_sensor()` call is required. If direct values change but callbacks never fire, inspect the event loop, threshold, hysteresis, and sampling window first.

## Configuration

```text
enabled_modules.sound_sensor
sound_sensor_pin
sound_noise_floor
sound_reference_level
sound_window_ms
sound_period_ms
sound_hysteresis
```

Quiet/reference calibration belongs to Device Manager/Runtime maintenance.

## Example

```python
from mangobox import Mango

m = Mango()

def loud():
    print("loud")

m.on_sound_above(60, loud)
m.run_forever()
```

## Related

`sound_level()`, `on_sound_above()`, `on_sound_below()`, `run_forever()`
