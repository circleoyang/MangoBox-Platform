# Host Python Light API Reference

## `light()`

Synchronously returns integer `0..100`:

- `0`: calibrated dark endpoint
- `100`: calibrated bright endpoint

This is not lux.

## `on_light_above(threshold, callback, hysteresis=5, period=100)`

Calls the callback when normalized light enters the above-threshold region.

## `on_light_below(threshold, callback, hysteresis=5, period=100)`

Calls the callback when normalized light enters the below-threshold region.

`threshold` and `hysteresis` must be `0..100`; `period` is clamped to at least 20 ms.

Host Python does not own Bright/Dark raw endpoint calibration or persistence.

## `on_light_change()` — Change callback

```python
m.on_light_change(callback, threshold=2, period=100)
m.stop_light_change()
```

Samples the existing `m.light()` method and dispatches only when a valid reading differs from the **last delivered callback value** by at least `threshold`. The first valid observation is delivered once. The default threshold is 2 0–100 relative light points; the default requested sampling period is 100 ms. Actual sampling timing depends on device and transport latency. The callback receives `value`.  

```python
from mangobox import Mango
m = Mango()
def changed(value):
    print('light:', value)
m.on_light_change(changed, threshold=2)
m.run_forever()
```

Use `m.stop_light_change()` to stop this watcher or `m.close()` to close all. Change events are logged as `sensor_event / change`, while technical polling logs are suppressed. Existing threshold events remain independent.

> **Version note:** Change APIs require a Runtime / Host package that integrates Sensor Change v1. Older versions may not include them. Check the Host package actually bundled with MangoThonny.
