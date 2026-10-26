# MangoLite Servo — API Reference

> Source candidate Runtime 0.6.5-rc2; MangoLite + Pico W / Pico 2 W; High-Level MicroPython. Source review is separate from hardware acceptance and does not change the existing Host Python contract.

## Setup and supported scope

The Lite facade uses one DM Servo configuration: `enabled_modules.servo`, `servo_pin`, `servo_min_angle`, `servo_max_angle`, `servo_min_us` and `servo_max_us`. Verify suitable mechanical angle/PWM ranges, power and common ground. This family has no `name=` argument and no `select_servo()` method.

## Methods, exact signatures and returns

| Signature | Behavior | Returns |
| --- | --- | --- |
| `m.servo(angle)` | Request immediate positioning through servo_set_angle | `None` |
| `m.servo_set_angle(angle)` | Compatibility/low-level immediate angle command | `None` |
| `m.servo_move_to(angle, step=5, period=60)` | Request gradual movement toward a target | `None` |
| `m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)` | Request continuous sweeping | `None` |
| `m.servo_stop()` | Send stop_sweep | `None` |
| `m.servo_get_angle()` | Request the angle and return the latest retained value | `int` or `None` |
| `m.servo_release()` | Release the PWM holding signal | `None` |

`servo_get_angle()` is software feedback, with no measured physical position or completion guarantee. Action methods return `None`, not a movement-completed boolean.

## Parameters, defaults and errors

| Parameter | Type and rules |
| --- | --- |
| `angle` | Required; converted to `int`, then checked against 0–180; further constrain use to the configured and mechanically safe range |
| `min_angle` / `max_angle` | Converted to `int`, each 0–180; defaults 0 / 180; minimum must be below maximum |
| `step` | Converted to an integer and bounded below by 1; default 5 for both gradual methods |
| move_to `period` | Integer conversion, milliseconds, at least 1; default 60 |
| sweep `period` | Integer conversion, milliseconds, at least 1; default 50 |

Out-of-range angles and invalid sweep endpoints raise `ValueError`. Values that cannot be converted to integers fail during conversion. Passing `name=` raises `TypeError`. These methods do not return torque, stall or measured-angle feedback.

## Lifecycle

Immediate positioning needs no persistent event loop. Runtime Scheduler advances move_to/sweep, so keep servicing `run_once()` or use `run_forever()`. The source command for `servo_stop()` is `stop_sweep`; do not treat it as a generic cancellation method for every servo state. Use `servo_release()` to release the holding signal; external forces may then move the shaft.

Record pending requests in callbacks and perform actions in the foreground after `run_once()` returns. Release an activated servo and call `close()` when finishing. Stop continuous sweeping before entering blocking input.

## Complete minimal example

```python
from mangobox import Mango
import time

m = Mango()
active = False
try:
    if not m.config.get("enabled_modules", {}).get("servo", False):
        raise RuntimeError("Enable Servo in Device Manager")
    low = int(m.config.get("servo_min_angle", 0))
    high = int(m.config.get("servo_max_angle", 180))
    if not 0 <= low < high <= 180:
        raise ValueError("Check the Servo angle range")
    angle = (low + high) // 2
    print("Verify a clear mechanism, power and GPIO:", m.config.get("servo_pin"))
    if input("Type RUN to request the configured midpoint: ").strip() == "RUN":
        active = True
        m.servo(angle)
        time.sleep_ms(800)
        print("Software angle:", m.servo_get_angle())
finally:
    try:
        if active:
            m.servo_release()
    finally:
        m.close()
```

## Diagnosis, related reading and source

Check profile/runtime, DM enablement/GPIO/angle/PWM, immediate positioning and Scheduler service, then power, ground, wiring and mechanics. Never interpret an unknown `None` angle as zero degrees or a successful command as physical acceptance.

[Complete Guide](../guides/servo.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md) · [Scheduler](../../../shared/en/reference/scheduler.md)

Source: [Lite student_api.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api.py), lines 1244–1301, and [Runtime Config](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/runtime/config.py).
