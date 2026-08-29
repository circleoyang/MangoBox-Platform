# Servo API Reference

## `servo()`

```python
servo(angle) -> None
```

Moves a positional servo to the requested angle.

Raises `ValueError` for an invalid angle.

## `servo_move_to()`

```python
servo_move_to(angle, step=5, period=60) -> None
```

Moves gradually toward a target angle.

## `servo_sweep()`

```python
servo_sweep(min_angle=0, max_angle=180, step=5, period=50) -> None
```

Starts repeated sweep motion.

Raises `ValueError` for invalid ranges.

## `servo_stop()`

```python
servo_stop() -> None
```

Stops sweep motion.

## `servo_get_angle()`

```python
servo_get_angle()
```

Returns the angle currently known by the Runtime/Student API. Reply timing differs by programming mode and version.

## `servo_release()`

```python
servo_release() -> None
```

Disables servo PWM output.

## Execution lifecycle

| API | High Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `servo(angle)` / `servo_set_angle()` | Immediate PWM position write | not required |
| `servo_get_angle()` | synchronous local Runtime reply path | not required |
| `servo_release()` | Immediate | not required |
| `servo_move_to()` | once a current angle exists, movement is stepped by Scheduler | required for predictable gradual completion |
| `servo_sweep()` | continuous Scheduler-driven sweep | required |
| `servo_stop()` | removes the sweep task immediately | not required |

If the servo has no current angle yet, `servo_move_to()` may write the target position immediately. To test gradual movement reliably, first establish a starting position with `servo()` and then call `servo_move_to()`.

## Availability

Servo is configurable. Show this API only when the selected compatibility profile advertises the `servo` capability.

## Configuration

```text
enabled_modules.servo
servo_pin
servo_min_angle
servo_max_angle
servo_min_us
servo_max_us
```

## Example

```python
from mangobox import Mango

m = Mango()
m.servo(30)
m.servo_move_to(150, step=5, period=60)
m.run_forever()
```

## Related

`servo()`, `servo_move_to()`, `servo_sweep()`, `servo_stop()`, `servo_get_angle()`, `servo_release()`, `run_forever()`
