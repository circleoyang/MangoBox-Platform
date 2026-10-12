# Sound Sensor — Host Python Guide

`sound_level()` returns relative sound intensity `0..100`; it is **not dB**. The current Runtime samples short-window peak-to-peak amplitude and normalizes it with firmware-owned quiet/reference calibration.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.sound_level())
    time.sleep(0.2)
```

## Threshold events

```python
from mangobox import Mango

m = Mango()
m.on_sound_above(70, lambda: print('LOUD'))
m.on_sound_below(30, lambda: print('QUIET'))
m.run_forever()
```

You can also set `hysteresis` and `period`.

## Calibration ownership

Host Python does not calculate quiet P90, reference P98, or raw span. Those belong to firmware/runtime. If values stay near 0/100 or respond poorly, use Device Manager quiet/reference calibration first.

## More

- [Host Python Sound API Reference](../reference/sound.md)

## Sensor Change Callback: `on_sound_change()`

```python
m.on_sound_change(callback, threshold=5, period=100)
m.stop_sound_change()
```

Changes are compared to the last delivered callback value. Default threshold: 5 (相對音量值（非 dB）). The first valid observation generates a callback. `period` is a requested interval in milliseconds; sampling and transport can delay execution.

```python
from mangobox import Mango
m = Mango()
def changed(value):
    print(value)
m.on_sound_change(changed, threshold=5)
m.run_forever()
```

Version note: requires a Runtime/Host package with Sensor Change v1; an updated firmware does not imply the installed MangoThonny Host package supports it.
