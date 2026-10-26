# BarePico Potentiometers, raw values and change events — API Reference

> Source candidate: v0.1.0-rc6; BarePico Pico / Pico W / Pico 2 W; High-Level MicroPython. Source review does not claim Windows or physical-device acceptance in this update.

## Setup, targets and mode

Enable `enabled_modules.potentiometer` and configure named, enabled ADC entries in `potentiometers`. `pin` is GP26/27/28; calibration requires `0 <= raw_min < raw_max <= 65535`, `sample_count` 1–32 and bool `invert`. `supply_voltage` is a calculation reference, default 3.3, with finite range `0 < supply_voltage <= 60`. This does not authorize applying that voltage to a Pico ADC input.

Passing an explicit `name` is most predictable. Omission uses `current_pot_setting`; the source falls back to `pot1` only when that key is **missing**. A present None value does not select the sole device automatically. Examples resolve configuration first and pass the name explicitly.

## Methods, exact signatures and returns

Defaults are exactly those in the signatures below. Import with `from mangobox import Mango` and construct `m = Mango()`.

| Signature | Meaning | Returns |
| --- | --- | --- |
| `m.on_pot_above(threshold, callback, hysteresis=2, period=100, name=None, invert=None)` | Watch upward threshold crossings. | `None` |
| `m.on_pot_below(threshold, callback, hysteresis=2, period=100, name=None, invert=None)` | Watch downward threshold crossings. | `None` |
| `m.on_pot_change(callback, threshold=2, period=100, name=None, invert=None)` | Watch changes of the selected delta, including the initial valid value. | `None` |
| `m.pot(name=None, invert=None)` | Read the calibrated percentage. | `int` 0–100 |
| `m.pot_raw(name=None)` | Read the raw ADC value. | `int` 0–65535 |
| `m.pot_voltage(name=None, supply=None)` | Convert a reading to voltage. | `float` volts |
| `m.stop_pot(name=None)` | Cancel all watchers for the selected pot. | `None` |

## Parameter types, ranges and defaults

| Parameter | Type and rules |
| --- | --- |
| `name` | Configured entry `str` or None; the resolved entry must exist and be enabled. |
| `invert` | Use bool or None. `pot()` validates that type; None uses DM. Watcher registration currently lacks the same strict check, so do not rely on comparisons with other values. |
| `supply` | None uses DM; otherwise converted float must be finite and `0 < supply <= 60` V, for estimation only. |
| `threshold` | Change converts to int 1–100; above/below to int 0–100; percentage points. |
| `hysteresis` | Converted int 0–100 percentage points, default 2. |
| `period` | Strict integer 20–10000 ms, excluding bool; one task per pot, with the last registration setting its period. |
| `callback` | Change receives one int percentage; above/below take no arguments; must be callable. |

## Events and lifecycle

`pot()` returns a calibrated, clamped and rounded int from 0 to 100. `pot_raw()` returns the rounded average of sample_count ADC reads, 0–65535; this does not mean 16-bit physical ADC precision. `pot_voltage()` uses the calibrated raw_min/raw_max fraction, clamps it to 0–1, multiplies by supply and rounds to four decimals. It ignores invert and does not measure the supply itself. These methods sample separately, not atomically.

Change delivers its first valid scheduled value, then compares against the **last delivered value**, notifying when the delta is `>= threshold`. Above initially arms only if `< threshold`; an armed value `>= threshold` notifies, and `<= threshold - hysteresis` rearms it. Below is symmetric: initial `> threshold`, notification at `<= threshold`, rearm at `>= threshold + hysteresis`. There is no initial above/below notification. With zero hysteresis, equality can repeatedly rearm the watcher; begin with the default 2.

Re-registering a direction replaces its handler and resets its baseline; other directions share the updated period. `stop_pot(name)` removes all watchers for that name and returns None; it does not release the ADC. Reads/watchers retain their initial hardware calibration, so close and recreate after configuration changes.

## Errors and diagnostic order

Disabled/closed state raises `RuntimeError`. Unknown/disabled names, non-ADC pins and invalid thresholds/timing are rejected; non-callable handlers raise `TypeError`. Changing pins or calibration after use requires closing and recreating Mango, otherwise `RuntimeError` prevents silently reusing stale ADC configuration.

## Complete minimal example

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("potentiometer", False):
        raise RuntimeError("Enable potentiometer in Device Manager")
    group = m.config.get("potentiometers", {})
    if not isinstance(group, dict):
        raise ValueError("Check the configured potentiometers table")
    items = {key: value for key, value in group.items()
             if isinstance(value, dict) and value.get("enabled", False)}
    name = m.config.get("current_pot_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled potentiometers entry in Device Manager")
        name = next(iter(items))
    spec = items[name]

    print("Pot:", name, "GPIO:", spec["pin"])
    print("Percent:", m.pot(name))
    print("Raw average:", m.pot_raw(name))
    print("Voltage estimate:", m.pot_voltage(name))
finally:
    m.close()
```

## Related reading

[Guide](../guides/pot.md) · [Lifecycle](../../../shared/en/guides/lifecycle.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md)

## Reviewed source and validation

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/pot.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/pot.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

Reviewed source SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`. Examples received syntax and source-contract checks only; this update makes no hardware PASS claim.
