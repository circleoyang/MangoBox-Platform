# Host Python Motor / Drive API Reference

Host and High-Level MicroPython share these method names:

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

`drive_tank` and `motor_run` signed speeds are clamped to `-100..100`; chassis speed arguments use magnitude `0..100`.

Motor names use `M1/M2` with compatibility aliases `A/B` and `left/right`.
