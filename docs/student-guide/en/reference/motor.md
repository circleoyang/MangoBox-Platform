# Motor / Drive API Reference

## Chassis movement

| API | Meaning |
| --- | --- |
| `forward(speed=70)` | Move forward |
| `backward(speed=70)` | Move backward |
| `pivot_left(speed=70)` | Pivot left |
| `pivot_right(speed=70)` | Pivot right |
| `spin_left(speed=70)` | Spin left in place |
| `spin_right(speed=70)` | Spin right in place |
| `arc_left(outer_speed=80, inner_speed=60)` | Left arc |
| `arc_right(outer_speed=80, inner_speed=60)` | Right arc |
| `drive_tank(left, right, assist=False)` | Independent `-100..100` left/right control |
| `stop()` | Active stop/brake |
| `coast()` | Free coast |

Regular speed arguments are clamped to `0..100` by magnitude.

## Individual motors

```python
motor_run(motor, speed)
motor_brake(motor)
motor_coast(motor)
```

`motor` accepts `M1`, `M2`, plus compatibility aliases `A/B` and `left/right`. `speed` is `-100..100`.

## Capability

Use `m.supports('drive')` and `m.supports('motor')` to query the semantic API path. This does not prove mechanical wiring or motor power is correct.
