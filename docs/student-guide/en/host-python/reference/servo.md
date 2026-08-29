# Servo API Reference — Host Python

Applies to Host package `0.4.6` with a compatible Runtime.

## `servo()`

```python
servo(angle) -> None
```

Angles must be in the 0–180 range. Invalid values raise `ValueError`.

## `servo_move_to()`

```python
servo_move_to(angle, step=5, period=60) -> None
```

## `servo_sweep()`

```python
servo_sweep(min_angle=0, max_angle=180, step=5, period=50) -> None
```

Invalid ranges raise `ValueError`.

## `servo_stop()` / `servo_release()`

```python
servo_stop() -> None
servo_release() -> None
```

`servo_stop()` stops sweep motion; `servo_release()` disables PWM output.

## `servo_get_angle()`

```python
servo_get_angle() -> int | float | None
```

Host 0.4.6 sends `get_angle` and waits for a Runtime `SERVO_ANGLE` reply. If no fresh valid reply arrives, the result is `None`.

## Execution lifecycle

`servo()`, `servo_move_to()`, and `servo_sweep()` are Host commands. Later gradual-move/sweep steps are owned by the Runtime, so Host `m.run_forever()` is not the motion engine.

`servo_get_angle()` is a synchronous reply path with a bounded Host parity-layer timeout.

## Availability

Servo is configurable. Use `m.supports("servo")` and inspect module enablement, `servo_pin`, and angle/PWM configuration in Device Manager.
