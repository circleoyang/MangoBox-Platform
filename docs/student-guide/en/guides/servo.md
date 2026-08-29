# Servo guide

A positional servo can move to a requested angle for pointers, doors, and interactive mechanisms.

## 30-second test

```python
from mangobox import Mango

m = Mango()
m.servo(90)
```

`servo(90)` writes the requested position immediately, so it does not require `m.run_forever()`.

## Common API

```python
m.servo(angle)
m.servo_move_to(angle, step=5, period=60)
m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)
m.servo_stop()
m.servo_get_angle()
m.servo_release()
```

`servo_stop()` stops sweep motion. `servo_release()` disables PWM output.

## Immediate position vs scheduled motion

### Move immediately to one angle

```python
from mangobox import Mango

m = Mango()
m.servo(30)
```

This is an immediate control and does not need the event loop.

### Move gradually

```python
from mangobox import Mango

m = Mango()
m.servo(30)
m.servo_move_to(150, step=5, period=60)
m.run_forever()
```

Once a current position exists, `servo_move_to()` uses Scheduler steps to reach the target gradually. Keep the event loop running.

### Sweep continuously

```python
from mangobox import Mango

m = Mango()
m.servo_sweep(30, 150, step=5, period=50)
m.run_forever()
```

`servo_sweep()` is continuous and requires `m.run_forever()`.

## If the servo does not move

```python
from mangobox import Mango

m = Mango()
print("Servo supported:", m.supports("servo"))
print("Servo enabled:", m.config.get("enabled_modules", {}).get("servo"))
print("Servo pin:", m.config.get("servo_pin"))
print("Minimum angle:", m.config.get("servo_min_angle"))
print("Maximum angle:", m.config.get("servo_max_angle"))
```

Verify physical wiring:

```text
Power / V+ → suitable power source
GND        → common ground with MangoBox
Signal     → servo_pin
```

Power is a common failure point. If the board resets or the servo jitters, check power capacity and common ground as well as the signal pin.

If `m.servo(90)` works but `servo_move_to()` or `servo_sweep()` appears inactive, first confirm the program reaches `m.run_forever()`.

## Challenge

First test 30, 90, and 150 degrees with `m.servo()`. After all three positions work, try `servo_move_to()` for smoother motion.

## More

- [Servo API Reference](../reference/servo.md)
- [Device Manager](../tools/device-manager.md)
- [Hardware Lab](../tools/hardware-lab.md)
