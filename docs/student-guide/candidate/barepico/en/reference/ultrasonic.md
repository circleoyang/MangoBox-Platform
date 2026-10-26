# BarePico Ultrasonic distance and proximity states — API Reference

> Source candidate: v0.1.0-rc6; BarePico Pico / Pico W / Pico 2 W; High-Level MicroPython. Source review does not claim Windows or physical-device acceptance in this update.

## Setup, targets and mode

Enable `enabled_modules.ultrasonic_sensor` and configure named, enabled `ultrasonic_sensors` entries with Trigger/Echo. Both `trigger_pin/echo_pin` and DM's short keys `trigger/echo` are supported; if both forms exist they must agree. Integer samples is 1–5, default 3; timeout_us is 1000–100000, default 30000. A sole sensor can be resolved when current_ultrasonic_setting is unset. With multiple sensors, pass a name or select one in DM.

BarePico does not fall back to GP14/15. Echo voltage must suit Pico inputs; a 5V Echo module requires appropriate level conversion.

## Methods, exact signatures and returns

Defaults are exactly those in the signatures below. Import with `from mangobox import Mango` and construct `m = Mango()`.

| Signature | Meaning | Returns |
| --- | --- | --- |
| `m.distance(sensor=None)` | Read distance once and handle None explicitly. | `float` cm or `None` |
| `m.is_near(distance_cm, sensor=None)` | Check whether a valid reading is at or below the threshold. | `bool` |
| `m.on_distance_change(callback, threshold=2.0, period=150, sensor=None)` | Watch distance changes of sufficient magnitude. | `None` |
| `m.on_far(distance_cm, callback, period=100, sensor=None)` | Notify upon entering the far state. | `None` |
| `m.on_near(distance_cm, callback, period=100, sensor=None)` | Notify upon entering the near state. | `None` |
| `m.stop_distance_change(sensor=None)` | Stop only the distance change watcher. | `None` |

## Parameter types, ranges and defaults

| Parameter | Type and rules |
| --- | --- |
| `sensor` | Configured name str or None; choose explicitly with multiple devices. |
| `distance_cm` | is_near/near/far converts with float and checks >0; use a finite positive value. Registering both directions requires near < far; centimeters. |
| `threshold` | Change requires finite positive int/float, rejecting bool and strings, with no additional numeric upper limit; default 2.0 cm, compared with the last delivered median. |
| `period` (change) | Strict integer 100–60000 ms, excluding bool; default 150. ChangeTracker also maps None to its default, but examples pass an integer. |
| `period` (near/far) | Converted int, minimum 60 ms; this path lacks change's 60000 upper-bound check. The sensor retains the faster registered period. |
| `callback` | Change receives one float distance; near/far take no arguments; all require a callable. |

## Events and lifecycle

`distance()` samples using configured samples and returns a float rounded to 0.1 cm or None. The driver retains only distances from 2.0 to 300.0 cm; no valid echo does not mean 0 cm. `is_near()` always uses 3 raw measurements and returns bool. Invalid readings return False, which does not prove a clear path.

Near/far takes one raw sample per poll and uses a median window of three valid samples to make state transitions. The initial matching median can notify. The region between thresholds retains the current near/far state. Invalid readings clear the three-sample window without implying far.

Change has two stages: each read first uses the driver's configured sample median, then ChangeTracker collects three valid results. **The first three-result median is delivered once**. Later medians notify when their delta from the last delivered value is >= threshold. None clears the window but retains the last delivered value, so recovery does not necessarily produce another initial event. Re-registering change for a sensor cancels its old watcher and resets its baseline.

Registration/`stop_distance_change()` returns None. Stop only removes change, not near/far; close at overall shutdown. Polls can block for acoustic 60 ms spacing, samples and timeout, so period is not a promised completion rate. Avoid extra blocking reads inside callbacks.

## Errors and diagnostic order

Disabled/closed state raises RuntimeError; invalid names, GPIO, threshold ordering or configuration are rejected. Non-callable callbacks raise TypeError. ChangeTracker rejects nonnumeric/bool threshold and non-integer period with TypeError; non-finite/non-positive threshold or out-of-range period raises ValueError. Near/far/is_near float conversion and comparisons are not the same strict validation; pass finite positive values.

Ordinary timeout/out-of-range distance gives None, but hardware operations can also raise OSError or other exceptions. Change watchers skip read errors and reset their sample window; explicit distance() can propagate them. Check profile, enablement, names and DM pins, then a single-sensor test, voltage, power, target angle and interference.

## Complete minimal example

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("ultrasonic_sensor", False):
        raise RuntimeError("Enable ultrasonic_sensor in Device Manager")
    group = m.config.get("ultrasonic_sensors", {})
    if not isinstance(group, dict):
        raise ValueError("Check the configured ultrasonic_sensors table")
    items = {key: value for key, value in group.items()
             if isinstance(value, dict) and value.get("enabled", False)}
    name = m.config.get("current_ultrasonic_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled ultrasonic_sensors entry in Device Manager")
        name = next(iter(items))
    spec = items[name]

    trigger = spec.get("trigger_pin", spec.get("trigger"))
    echo = spec.get("echo_pin", spec.get("echo"))
    print("Sensor:", name, "Trigger:", trigger, "Echo:", echo)
    for _ in range(4):
        value = m.distance(sensor=name)
        print("No valid echo" if value is None else str(value) + " cm")
        time.sleep_ms(250)
finally:
    m.close()
```

## Related reading

[Guide](../guides/ultrasonic.md) · [Lifecycle](../../../shared/en/guides/lifecycle.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md)

## Reviewed source and validation

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/ultrasonic.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/ultrasonic.py)
- [runtime/mangox2-pico/firmware/mangox2/student_api_change_rules_v1.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/student_api_change_rules_v1.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

Reviewed source SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`. Examples received syntax and source-contract checks only; this update makes no hardware PASS claim.
