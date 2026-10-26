# BarePico Light percentage and thresholds — API Reference

> Source candidate: v0.1.0-rc6; BarePico Pico / Pico W / Pico 2 W; High-Level MicroPython. Source review does not claim Windows or physical-device acceptance in this update.

## Setup, targets and mode

Enable `enabled_modules.light_sensor` and set `light_sensor_pin` explicitly to GP26/27/28. Calibration requires `0 <= light_raw_bright < light_raw_dark <= 65535`; `light_sample_count` is 1–32. BarePico uses one configured light input and does not accept carrier-only named/change-event extensions.

## Methods, exact signatures and returns

Defaults are exactly those in the signatures below. Import with `from mangobox import Mango` and construct `m = Mango()`.

| Signature | Meaning | Returns |
| --- | --- | --- |
| `m.light()` | Read calibrated brightness percentage. | `int` 0–100 |
| `m.on_light_above(threshold, callback, hysteresis=5, period=100)` | Register a crossing toward the bright side. | `None` |
| `m.on_light_below(threshold, callback, hysteresis=5, period=100)` | Register a crossing toward the dark side. | `None` |
| `m.stop_light()` | Stop light threshold watching. | `None` |

## Parameter types, ranges and defaults

| Parameter | Type and rules |
| --- | --- |
| `threshold` | A numeric threshold 0–100 in the same calibrated percentage scale as light(). |
| `hysteresis` | 0–100, default 5; prevents repeated triggering near a boundary. |
| `period` | Integer 20–10000 ms; both directions share a sensor task. |
| `callback` | A zero-argument callable; pass the function itself. |

## Events and lifecycle

`light()` returns an int from 0=dark to 100=bright, not lux. The source averages sample_count ADC reads, maps them inversely through raw_bright/raw_dark, clamps to 0–100 and rounds. It takes a new sample and needs no active watcher.

Above/below callbacks take no arguments. Each registration configures both directional trackers again and reads an immediate baseline without an initial crossing event. **The last registration's period controls the shared task**, not separate per-direction schedules. Above notifies when an inactive condition reaches `value >= threshold`, then clears at `value <= threshold - hysteresis`. Below notifies at `<= threshold` and clears at `>= threshold + hysteresis`. With hysteresis=0, clearing requires the strict opposite side; equality does not repeatedly clear it.

`stop_light()` returns None and stops the task/trackers, retaining callbacks, threshold settings and the ADC object. Registering again establishes a fresh baseline. Close at overall shutdown. BarePico has no `on_light_change()` / `stop_light_change()`; do not copy carrier-only signatures.

## Errors and diagnostic order

Disabled/closed state or configuration changes after use raise `RuntimeError`. Invalid ADC pins, calibration, sample count, thresholds or timing raise `ValueError`; a non-callable handler raises `TypeError`. Check scope/enablement, ADC pin and DM calibration, then sensor orientation and actual light conditions.

## Complete minimal example

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("light_sensor", False):
        raise RuntimeError("Enable light_sensor in Device Manager")
    pin_no = m.config.get("light_sensor_pin")
    if type(pin_no) is not int:
        raise ValueError("Configure light_sensor_pin in Device Manager")

    print("Light GPIO:", pin_no)
    print("Relative brightness:", m.light())
finally:
    m.close()
```

## Related reading

[Guide](../guides/light.md) · [Lifecycle](../../../shared/en/guides/lifecycle.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md)

## Reviewed source and validation

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangolite-pico2w/firmware/mangolite/devices/light.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/devices/light.py)
- [runtime/mangolite-pico2w/firmware/mangolite/sensor_core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/sensor_core.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

Reviewed source SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`. Examples received syntax and source-contract checks only; this update makes no hardware PASS claim.
