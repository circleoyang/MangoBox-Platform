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

## New: Change callback

```python
from mangobox import Mango
m = Mango()
def changed(value):
    print('light:', value)
m.on_light_change(changed, threshold=2, period=100)
m.run_forever()
```

A callback fires on the first valid observation, then only after at least `threshold` 0–100 relative light points of change from the last delivered reading. `period` is the requested interval in milliseconds; real timing depends on the device. Use `m.stop_light_change()` to stop the watcher. See [API Reference](../reference/light.md).

> **Version note:** Change APIs require a Runtime / Host package that integrates Sensor Change v1. Older versions may not include them. Check the Host package actually bundled with MangoThonny.
