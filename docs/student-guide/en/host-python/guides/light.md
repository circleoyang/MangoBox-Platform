# Light Sensor — Host Python Guide

`light()` returns the Runtime-calibrated relative brightness value `0..100`: `0=dark`, `100=bright`. Host Python does not calculate ADC endpoints itself.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.light())
    time.sleep(0.5)
```

## Threshold events

```python
from mangobox import Mango

m = Mango()
m.on_light_below(30, lambda: print('DARK'))
m.on_light_above(70, lambda: print('BRIGHT'))
m.run_forever()
```

Optional hysteresis prevents repeated toggling near a threshold:

```python
m.on_light_below(30, dark, hysteresis=5, period=100)
```

## Calibration ownership

Bright/Dark raw endpoints belong to firmware/runtime Sensor Calibration Contract v1. If normalized values are unreasonable, recalibrate with Device Manager instead of adding a second conversion formula in Host code.

## More

- [Host Python Light API Reference](../reference/light.md)
