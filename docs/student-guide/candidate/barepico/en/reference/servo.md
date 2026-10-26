# BarePico Named servos and commanded angles — API Reference

> Source candidate: v0.1.0-rc6; BarePico Pico / Pico W / Pico 2 W; High-Level MicroPython. Source review does not claim Windows or physical-device acceptance in this update.

## Setup, targets and mode

Enable `enabled_modules.servo` and configure named, enabled external `servos` entries. Integer calibration requires `0 <= min_angle < max_angle <= 180` and `100 <= min_us < max_us <= 3000`. Default pulse widths are 500/2500 µs and the driver uses 50 Hz PWM. Calibrate for the actual servo and mechanism; these bounds do not establish a safe motion range for every device.

Choose with `select_servo(name)`, a valid current_servo_setting or the sole enabled entry. Selection claims no PWM. `servo_get_angle()` also goes through device acquisition and can initialize PWM on its first call, initially at duty 0. BarePico motion methods do not accept the carrier `name=` argument.

## Methods, exact signatures and returns

Defaults are exactly those in the signatures below. Import with `from mangobox import Mango` and construct `m = Mango()`.

| Signature | Meaning | Returns |
| --- | --- | --- |
| `m.select_servo(name)` | Select the named servo for subsequent actions. | `str` name |
| `m.servo(angle)` | Set the commanded angle directly. | `None` |
| `m.servo_get_angle()` | Read the software angle, not physical feedback. | `int` angle or `None` |
| `m.servo_move_to(angle, step=5, period=60)` | Step toward a target angle using step and period. | `None` |
| `m.servo_release()` | Stop sweep and set PWM duty=0; does not cancel unfinished move_to. | `None` |
| `m.servo_set_angle(angle)` | Explicit-name angle-setting method. | `None` |
| `m.servo_stop()` | Stop sweep; does not cancel unfinished move_to. | `None` |
| `m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)` | Sweep repeatedly between the bounds. | `None` |

## Parameter types, ranges and defaults

| Parameter | Type and rules |
| --- | --- |
| `name` | A DM servo name used by select_servo, not a GPIO number. |
| `angle` | Converted integer 0–180 degrees; actual output is additionally constrained by DM angle and pulse calibration. |
| `min_angle / max_angle` | Integers 0–180 with min_angle < max_angle. Start with a narrow range that does not hit mechanical stops. |
| `step` | Step per update, 1–180 degrees; the facade may coerce/clamp the lower bound, but supply valid inputs. |
| `period` | Update interval 10–10000 ms; move_to defaults to 60 and sweep to 50. |

## Events and lifecycle

`select_servo()` returns a str name; `servo_get_angle()` returns an int commanded angle or None; other wrappers return None. The driver further clamps valid 0–180 requests to DM min/max. The stored result is software state, not measured position or proof of physical arrival. If no angle has been stored, the first `servo_move_to()` writes the target directly instead of moving smoothly from an unknown position.

**This candidate has a cancellation limitation:** canonical `BoardServo.move_to()` keeps its task ID in a local closure instead of sweep_task_id. `servo_stop()` only stops sweeping. `servo_release()` stops sweeping and sets PWM duty to zero; it neither cancels an unfinished move_to nor deinitializes PWM. A later move_to tick can write output again. Immediate `servo()` positioning also does not cancel the old move task.

Do not overlap move_to requests or treat stop/release as cancellation/completion acknowledgments. End the whole project with `close()`: BarePico's shutdown releases output, deinitializes PWM and clears Scheduler work. Create a new Mango for a later run. To wait for one software move target, keep driving the loop, then advance at least one more period after the stored angle reaches the target so its task can retire. This still does not establish physical arrival.

Move/sweep need the event loop. Stop/release do not allocate an unused servo, but their None result is not hardware feedback. The minimal example uses one direct position command and final close, rather than releasing an unfinished move_to.

## Errors and diagnostic order

Unknown/disabled names and invalid GPIO, angles or timing are rejected. Disabled/closed state, unavailable or failed hardware PWM, or changed pins/limits after use raise `RuntimeError`. Check profile, module and entry enablement, pin/calibration, suitable power/common ground, then a small-angle test.

## Complete minimal example

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("servo", False):
        raise RuntimeError("Enable servo in Device Manager")
    group = m.config.get("servos", {})
    if not isinstance(group, dict):
        raise ValueError("Check the configured servos table")
    items = {key: value for key, value in group.items()
             if isinstance(value, dict) and value.get("enabled", False)}
    name = m.config.get("current_servo_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled servos entry in Device Manager")
        name = next(iter(items))
    spec = items[name]

    low = spec.get("min_angle", 0)
    high = spec.get("max_angle", 180)
    if type(low) is not int or type(high) is not int or not 0 <= low < high <= 180:
        raise ValueError("Check the configured Servo angle limits")
    center = (low + high) // 2
    m.select_servo(name)
    m.servo(center)
    print("Requested:", center, "Stored command:", m.servo_get_angle())
    time.sleep_ms(500)
finally:
    m.close()
```

## Related reading

[Guide](../guides/servo.md) · [Lifecycle](../../../shared/en/guides/lifecycle.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md)

## Reviewed source and validation

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/servo.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/servo.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

Reviewed source SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`. Examples received syntax and source-contract checks only; this update makes no hardware PASS claim.
