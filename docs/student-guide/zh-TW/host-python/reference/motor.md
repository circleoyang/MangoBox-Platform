# Host Python Motor / Drive API Reference

Host 與 High-Level MicroPython method names 一致：

```python
forward(speed=70)
backward(speed=70)
pivot_left(speed=70)
pivot_right(speed=70)
spin_left(speed=70)
spin_right(speed=70)
arc_left(outer_speed=80, inner_speed=60)
arc_right(outer_speed=80, inner_speed=60)
drive_tank(left, right, assist=False)
stop()
coast()
motor_run(motor, speed)
motor_brake(motor)
motor_coast(motor)
```

`drive_tank` 與 `motor_run` 的 signed speed 會限制在 `-100..100`。其他車體 speed 使用 magnitude `0..100`。

Motor name 使用 `M1/M2`，並接受 `A/B`、`left/right` aliases。
