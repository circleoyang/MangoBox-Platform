# Servo API Reference

Engineering-oriented reference. Servo availability is still resolved by target / mode / version. Named Servo is part of the current MangoX2 contract; MangoLite currently keeps its existing single/default Servo learner path.

## Compatible core syntax

Use these forms for a single/default Servo:

```python
servo(angle) -> None
servo_set_angle(angle) -> None
servo_move_to(angle, step=5, period=60) -> None
servo_sweep(min_angle=0, max_angle=180, step=5, period=50) -> None
servo_stop() -> None
servo_get_angle()
servo_release() -> None
```

Angles are validated by the Student API. Invalid values raise `ValueError`, and `servo_sweep()` requires `min_angle < max_angle`.

## MangoX2 named Servo

The current MangoX2 named-device contract adds an optional `name` to the same semantic methods:

```python
servo(angle, name=None) -> None
servo_set_angle(angle, name=None) -> None
servo_move_to(angle, step=5, period=60, name=None) -> None
servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None) -> None
servo_stop(name=None) -> None
servo_get_angle(name=None)
servo_release(name=None) -> None
```

Example:

```python
from mangobox import Mango

m = Mango()
m.servo(30, name="arm")
m.servo_move_to(150, step=5, period=60, name="arm")
print(m.servo_get_angle(name="arm"))
m.servo_release(name="arm")
```

`name=None` uses the current/default Servo, preserving existing programs. A named instance must exist in the current Runtime Servo configuration and be available.

> In a MangoLite current profile, use the common syntax without `name`. Do not assume MangoLite has completed the same named-device contract just because MangoX2 supports it.

## Execution lifecycle

| API | High-Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `servo()` / `servo_set_angle()` | Immediate local Runtime position command | not required |
| `servo_get_angle()` | local Runtime reply path | not required |
| `servo_release()` | Immediate | not required |
| `servo_move_to()` | later steps are owned by Runtime / Scheduler | required to keep Scheduler service active |
| `servo_sweep()` | continuous Runtime / Scheduler sweep | required |
| `servo_stop()` | stops sweep for the selected/current Servo | not required |

Keep `m.run_forever()` active in High-Level MicroPython when you need gradual motion or continuous sweep to continue.

## Configuration

Current MangoX2 named-device configuration primarily uses:

```text
enabled_modules.servo
servos
current_servo_setting
```

Each named Servo may have its own `pin`, `min_angle`, `max_angle`, `min_us`, `max_us`, and Enabled/Locked state. Legacy scalar Servo keys remain for compatibility.

MangoLite currently keeps its existing single-Servo configuration path. Use Device Manager / Runtime config as the source for the active pin and angle/PWM range.

## Availability

Check:

```python
m.supports("servo")
```

`True` means the current learner API / target / config can provide Servo semantics. It does not prove that a physical Servo is correctly wired or adequately powered.

## Related

`servo()`, `servo_set_angle()`, `servo_move_to()`, `servo_sweep()`, `servo_stop()`, `servo_get_angle()`, `servo_release()`, `supports()`, `run_forever()`
