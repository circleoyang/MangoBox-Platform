# Host Python Sound API Reference

## `sound_level()`

Synchronously returns integer relative sound intensity `0..100`. It is not SPL/dB.

## `on_sound_above(threshold, callback, hysteresis=5, period=100)`

Calls the callback when sound enters the above-threshold region.

## `on_sound_below(threshold, callback, hysteresis=5, period=100)`

Calls the callback when sound enters the below-threshold region.

`threshold` and `hysteresis` must be `0..100`; `period` is clamped to at least 20 ms.

Runtime raw sound represents short-window peak-to-peak amplitude. Host Python does not reimplement P90/P98 calibration math.

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
