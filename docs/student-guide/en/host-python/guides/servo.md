# Servo — Host Python Guide

Host Python sends Servo commands to the MangoBox Runtime. Positioning, gradual movement, and sweep motion are executed by the Runtime.

## 30-second test

```python
from mangobox import Mango

m = Mango()
print("Servo supported =", m.supports("servo"))
m.servo(90)
```

The Host does not need `m.run_forever()` to step the angle; the Runtime owns later motion updates.

## MangoX2: select a named Servo

Host 0.4.6 supports the current MangoX2 named-Servo contract. If multiple Servo instances are configured and enabled in Device Manager / Runtime:

```python
m.servo(90, name="arm")
m.servo_move_to(150, step=5, period=60, name="arm")
m.servo_sweep(20, 160, step=5, period=50, name="camera")
print(m.servo_get_angle(name="arm"))
m.servo_stop(name="camera")
m.servo_release(name="arm")
```

Omitting `name` uses the default/current Servo and preserves existing single-servo programs.

> MangoLite currently keeps its existing single/default Servo learner path. Omit `name=` in a MangoLite profile; do not apply the MangoX2 named-device contract to MangoLite yet.

## Gradual movement and sweep

```python
m.servo_move_to(150, step=5, period=60)
m.servo_sweep(0, 180, step=5, period=50)
```

These methods do not require Host `m.run_forever()` to perform later angle steps. The Host sends the command and the Runtime performs the motion.

## Read the current angle

```python
angle = m.servo_get_angle()
print(angle)
```

For a MangoX2 named Servo:

```python
angle = m.servo_get_angle(name="arm")
```

Host 0.4.6 sends `get_angle` and waits for a Runtime `SERVO_ANGLE` reply. If no fresh valid reply arrives, the truthful result is `None`.

## Common API

Compatible single/default Servo forms:

```python
m.servo(angle)
m.servo_set_angle(angle)
m.servo_move_to(angle, step=5, period=60)
m.servo_sweep(0, 180, step=5, period=50)
m.servo_stop()
m.servo_get_angle()
m.servo_release()
```

MangoX2 may add `name="..."` to the same semantic methods.

`servo_stop()` stops sweep motion. `servo_release()` disables PWM output.

## If the servo does not move

Check `m.supports("servo")`, then use Device Manager to verify Servo enablement, the current/named Servo, pin assignment, angle/PWM limits, power, common ground, and Signal wiring.

Servo power problems are common: a correct Host program does not guarantee adequate current delivery.

See [Host Python Servo API Reference](../reference/servo.md).
