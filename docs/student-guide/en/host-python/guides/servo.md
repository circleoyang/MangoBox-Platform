# Servo — Host Python Guide

Host Python sends Servo commands to the MangoBox Runtime. Positioning, gradual movement, and sweep motion are executed by the Runtime.

## 30-second test

```python
from mangobox import Mango

m = Mango()
m.servo(90)
```

## Gradual movement and sweep

```python
m.servo_move_to(150, step=5, period=60)
m.servo_sweep(0, 180, step=5, period=50)
```

The Host does not need `m.run_forever()` to step the angle. It sends the command and the Runtime performs later motion updates.

## Read the current angle

```python
angle = m.servo_get_angle()
print(angle)
```

Host 0.4.6 waits for the Runtime `SERVO_ANGLE` reply. If no valid reply arrives, the truthful result may be `None`.

## Common API

```python
m.servo(angle)
m.servo_move_to(angle, step=5, period=60)
m.servo_sweep(0, 180, step=5, period=50)
m.servo_stop()
m.servo_get_angle()
m.servo_release()
```

`servo_stop()` stops sweep motion. `servo_release()` disables PWM output.

## If the servo does not move

Check `m.supports("servo")`, then verify Servo enablement, `servo_pin`, configured angle limits, power, common ground, and Signal wiring in Device Manager.

Servo power problems are common: a correct Host program does not guarantee adequate current delivery.

See [Host Python Servo API Reference](../reference/servo.md).
