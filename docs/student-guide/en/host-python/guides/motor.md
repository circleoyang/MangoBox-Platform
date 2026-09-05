# Motor / Drive — Host Python Guide

Host Python and High-Level MicroPython share the same Drive learner semantics. Host sends semantic commands while PWM, direction mapping, and drivetrain assist run in Runtime.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
print(m.supports('drive'), m.supports('motor'))
m.forward(20)
time.sleep(0.5)
m.stop()
```

Use low speed and lift the wheels for the first test.

## Common API

```python
m.forward(60)
m.backward(60)
m.pivot_left(50)
m.pivot_right(50)
m.spin_left(50)
m.spin_right(50)
m.arc_left(80, 50)
m.arc_right(80, 50)
m.drive_tank(60, 40)
m.stop()
```

Individual motors:

```python
m.motor_run('M1', 40)
m.motor_brake('M1')
m.motor_coast('M2')
```

Current MangoLite Runtime also implements the shared drive-assist-v1 command contract, so Host capability discovery may advertise `drive` / `motor` when Motor is enabled.

Fix direction in Device Manager / Runtime configuration rather than hard-coding inverted signs in every student program.

## More

- [Host Python Motor / Drive API Reference](../reference/motor.md)
