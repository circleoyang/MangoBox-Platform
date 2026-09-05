# Servo guide

A positional servo can move to a requested angle for pointers, doors, and interactive mechanisms.

## 30-second test

```python
from mangobox import Mango

m = Mango()
m.servo(90)
```

`servo(90)` moves the current default Servo immediately, so it does not require `m.run_forever()`.

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

## MangoX2: select a named Servo

The current MangoX2 Student API supports named servos. When multiple enabled Servo instances are configured in Device Manager / Runtime, select one with `name=`:

```python
m.servo(90, name="arm")
m.servo_move_to(150, step=5, period=60, name="arm")
m.servo_sweep(20, 160, step=5, period=50, name="camera")
print(m.servo_get_angle(name="arm"))
m.servo_stop(name="camera")
m.servo_release(name="arm")
```

Omitting `name` keeps the default/current Servo behavior, so existing single-servo programs remain valid.

> MangoLite currently keeps its existing single/default Servo learner path. Omit `name=` in a MangoLite profile. Named Servo is part of the current MangoX2 contract and should not be assumed to have identical semantics on every board.

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

In High-Level MicroPython, later motion steps are owned by the device Runtime / Scheduler. Keep the event loop running so scheduled work can continue.

### Sweep continuously

```python
from mangobox import Mango

m = Mango()
m.servo_sweep(30, 150, step=5, period=50)
m.run_forever()
```

`servo_sweep()` is continuous and requires `m.run_forever()`.

## If the servo does not move

Start by checking the semantic capability:

```python
from mangobox import Mango

m = Mango()
print("Servo supported:", m.supports("servo"))
```

Then use Device Manager to verify the current Servo enablement, pin assignment, angle limits, and PWM range. Current MangoX2 named-device configuration uses the `servos` collection as the primary source; legacy scalar keys remain for compatibility. MangoLite currently keeps its existing single-servo configuration path.

Verify physical wiring:

```text
Power / V+ → suitable power source
GND        → common ground with MangoBox
Signal     → Servo pin shown by Device Manager
```

Power is a common failure point. If the board resets or the servo jitters, check power capacity and common ground as well as the signal pin.

If `m.servo(90)` works but `servo_move_to()` or `servo_sweep()` appears inactive in High-Level MicroPython, confirm the program reaches `m.run_forever()`.

## Challenge

First test 30, 90, and 150 degrees with `m.servo()`. After all three positions work, try `servo_move_to()` for smoother motion. On MangoX2, configure a second Servo and use `name=` to address each instance independently.

## More

- [Servo API Reference](../reference/servo.md)
- [Device Manager](../tools/device-manager.md)
- [Hardware Lab](../tools/hardware-lab.md)
