# Motor / Drive Guide

The Motor / Drive API controls a two-motor chassis. MangoX2 and the current MangoLite Runtime use the same high-level drive semantics; wheel orientation and drivetrain compensation belong to Runtime configuration.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
print('Drive supported =', m.supports('drive'))
m.forward(20)
time.sleep(0.5)
m.stop()
```

For the first test, use a low speed and lift the wheels off the table. Confirm direction before driving on the floor.

## Common movement

```python
m.forward(60)
m.backward(60)
m.pivot_left(50)
m.pivot_right(50)
m.spin_left(50)
m.spin_right(50)
m.arc_left(80, 50)
m.arc_right(80, 50)
m.stop()
```

## Tank drive

```python
m.drive_tank(left=60, right=40)
```

Left/right values are `-100..100`; negative values reverse a side. Use `assist=True` only when the Runtime drivetrain configuration has been calibrated for the chassis.

## Individual motors

```python
m.motor_run('M1', 40)
m.motor_run('M2', -40)
m.motor_brake('M1')
m.motor_coast('M2')
```

`M1/M2` are canonical names; `A/B` and `left/right` remain accepted aliases.

## Direction problems

Do not scatter sign inversions through student code. Fix wheel mapping, direction, and calibration in Device Manager so the hardware configuration matches the physical chassis.

## More

- [Motor / Drive API Reference](../reference/motor.md)
