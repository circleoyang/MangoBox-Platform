# Joystick — Host Python Guide

The Joystick API returns normalized X/Y values in `-100..100` and also exposes the push-button state. Center, deadzone, axis swap and inversion belong to Runtime configuration.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    x, y = m.joystick()
    print(x, y, m.is_joystick_pressed())
    time.sleep(0.2)
```

## Button events

```python
from mangobox import Mango

m = Mango()
m.on_joystick_pressed(lambda: print('PRESS'))
m.on_joystick_released(lambda: print('RELEASE'))
m.run_forever()
```

## Center calibration

Leave the stick released at center, then run:

```python
center_x, center_y = m.calibrate_joystick(samples=16)
print(center_x, center_y)
```

Calibration executes in Runtime. Host Python does not access ADC directly.

If center is still biased, verify VRX/VRY/SW pins, Swap X/Y, Invert X/Y, and deadzone before applying manual offsets in student code.

## More

- [Host Python Joystick API Reference](../reference/joystick.md)
