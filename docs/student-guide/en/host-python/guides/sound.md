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
