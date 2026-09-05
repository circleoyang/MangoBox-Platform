# Servo API Reference — Host Python

Applies to Host package `0.4.6` with a compatible Runtime.

## Compatible single/default Servo syntax

```python
servo(angle) -> None
servo_set_angle(angle) -> None
servo_move_to(angle, step=5, period=60) -> None
servo_sweep(min_angle=0, max_angle=180, step=5, period=50) -> None
servo_stop() -> None
servo_get_angle() -> int | float | None
servo_release() -> None
```

The Student API validates angles. Invalid angles or sweep ranges raise `ValueError`.

## MangoX2 named Servo

Host 0.4.6 supports the current MangoX2 named-Servo contract with an optional `name`:

```python
servo(angle, name=None) -> None
servo_set_angle(angle, name=None) -> None
servo_move_to(angle, step=5, period=60, name=None) -> None
servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None) -> None
servo_stop(name=None) -> None
servo_get_angle(name=None) -> int | float | None
servo_release(name=None) -> None
```

`name=None` uses the default/current Servo. When a name is provided, the Host includes that name in the Servo Runtime command.

```python
from mangobox import Mango

m = Mango()
m.servo(90, name="arm")
print(m.servo_get_angle(name="arm"))
m.servo_release(name="arm")
```

MangoLite currently keeps its existing single/default Servo learner path. Use the common syntax without `name` in a MangoLite profile.

## `servo_get_angle()` reply path

Host 0.4.6 sends `get_angle` and waits for a Runtime `SERVO_ANGLE` reply. MangoX2 named Servo uses a reply key associated with the selected name. If no fresh valid reply arrives, the result is `None`.

## Execution lifecycle

`servo()`, `servo_move_to()`, and `servo_sweep()` are Host commands. Later gradual-move/sweep steps are owned by the Runtime, so Host `m.run_forever()` is not the Servo motion engine.

`servo_get_angle()` is a synchronous reply path with a bounded timeout.

## Availability / configuration

Check:

```python
m.supports("servo")
```

Current MangoX2 named-device configuration primarily uses `servos` and `current_servo_setting`; each instance may have its own pin, angle range, and PWM range. MangoLite currently keeps its existing single-Servo configuration path.

`supports("servo") == True` means the learner path is available. It does not prove that a physical Servo is correctly wired or adequately powered.
