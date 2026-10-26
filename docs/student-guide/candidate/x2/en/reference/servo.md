# MangoX2 named Servo — API Reference

> Source candidate Runtime 0.2.10-rc2 · MangoX2 + Pico / Pico W / Pico 2 W · High-Level MicroPython. Source review does not establish released firmware or hardware acceptance.

## Availability and configuration

Enable Servo in DM and enable the selected servos entry. Verify each pin, angle limits, pulse widths, power and common ground. current_servo_setting supplies the default selection. The example requires enabled=True and a selected current entry when several devices are enabled.

Runtime's compatibility resolution is broader: a nonempty servos collection takes precedence; otherwise it synthesizes servo1 from legacy servo_* scalar keys. name=None prefers the current entry, then an available entry. An explicit name is converted to a string. The driver can be created lazily even by get_angle, stop or release, so those calls are not guaranteed to have no hardware side effects. Recreate Mango after changing an instantiated device's configuration.

## Methods, complete signatures and returns

| Signature | Behavior | Return |
| --- | --- | --- |
| `m.servo(angle, name=None)` | Calls servo_set_angle to write an angle command immediately | `None` |
| `m.servo_set_angle(angle, name=None)` | Immediate angle command | `None` |
| `m.servo_move_to(angle, step=5, period=60, name=None)` | Scheduler advances the command; writes target immediately if angle=None initially | `None` |
| `m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None)` | Continuous sweep task | `None` |
| `m.servo_stop(name=None)` | Sends stop_sweep; removes the sweep task only | `None` |
| `m.servo_get_angle(name=None)` | Retrieves the selected/default servo's stored command | `int` or `None` from the normal BoardServo |
| `m.servo_release(name=None)` | Stops sweep and immediately sets PWM duty to zero; does not cancel pending move_to or deinitialize PWM | `None` |

None does not mean that a command did nothing, nor does it acknowledge arrival or cancellation. The named reply parser can retain a nonintegral number, but the current BoardServo itself stores integer commanded angles. This is not a physical measurement and cannot detect a stall or actual shaft position.

## Parameters, defaults and errors

| Parameter/setting | Actual source rule |
| --- | --- |
| `angle` | Required; int() conversion, then 0..180 or ValueError; driver further clamps to DM limits |
| `min_angle`, `max_angle` | Sweep defaults 0/180; each integer-converted and checked within 0..180; min must be below max or ValueError; device limits are also applied |
| `step` | Default 5; max(1, int(step)); no BarePico-style upper bound of 180 |
| `period` | move_to default 60, sweep default 50; milliseconds, max(1, int(period)); no BarePico-style 10..10000 validation |
| `name` | Default None; explicit values converted with str(); unknown or enabled=False entries raise ValueError in the named handler |
| Named angle limits | Entry values first, legacy scalar values otherwise; final defaults 0/180. The example additionally checks 0 <= low < high <= 180 |
| `min_us`, `max_us` | Entry values first, legacy scalars otherwise; final defaults 500/2500 μs. BoardServo uses 50 Hz. The named config extension does not comprehensively bound each pulse value; accepting a setting is not proof it suits the servo |

Values that cannot be converted fail at int(); these are not strict native-int-only guards. GPIO/PWM initialization errors may propagate, while an unavailable driver can sometimes only print a message. Not every failure has a uniform exception or event. DM pin-conflict validation cannot establish appropriate mechanical limits, pulse widths or power.

## Events, scheduling and confirmed cancellation limits

No arrival callback is exposed. Existing API events from servo()/move_to() and driver angle messages describe commands, not measured completion. Do not manufacture event JSON or flood logs on every Scheduler pass.

Keep servicing run_once or use run_forever for move_to/sweep. Keep callbacks short and perform complex actions in the foreground. While a move_to is unfinished, servo_stop, servo_release, a new servo(), and another move_to do not reliably cancel it. Its task ID lives only in a driver closure. A later tick can restore PWM after release; two moves can retain competing tasks. This is a confirmed source limitation, not a recommended operating pattern.

The normal Carrier close→reset_runtime path clears Scheduler, including untracked move tasks. It only stops Servo sweep and does not release/deinitialize PWM. End a complete session with release immediately followed by close, without servicing another tick between them. This is not a per-servo cancellation method for continued use, and it is not a guarantee against every cleanup exception. BarePico normally performs additional release/deinit in close; do not apply that guarantee to X2.

## Complete minimal example

Use direct positioning, observe, then release/close. No unfinished move_to is created.

```python
from mangobox import Mango
import time

m = Mango()
name = None
active = False
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("servo", False):
        raise RuntimeError("Enable Servo in Device Manager")
    group = m.config.get("servos", {})
    if not isinstance(group, dict):
        raise ValueError("Check the named servos settings")
    items = {key: spec for key, spec in group.items()
             if isinstance(spec, dict) and spec.get("enabled") is True}
    name = m.config.get("current_servo_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled Servo in Device Manager")
        name = next(iter(items))
    spec = items[name]
    low = int(spec.get("min_angle", m.config.get("servo_min_angle", 0)))
    high = int(spec.get("max_angle", m.config.get("servo_max_angle", 180)))
    if not 0 <= low < high <= 180:
        raise ValueError("Check the configured Servo angle limits")
    center = (low + high) // 2
    print("Servo:", name, "GPIO:", spec.get("pin"), "Limits:", low, high)
    if input("Check power and free movement; type RUN: ").strip() == "RUN":
        active = True
        m.servo(center, name=name)
        time.sleep_ms(800)
        print("Software angle:", m.servo_get_angle(name=name))
finally:
    try:
        if active:
            m.servo_release(name=name)
    finally:
        m.close()
```

## Troubleshooting and related reading

Check profile and DM enable/name/pin first, then test direct positioning. Verify Scheduler service and power before adding motion. Do not turn None into an assumed zero-degree reading or mark hardware PASS because a command returned.

[Complete Guide](../guides/servo.md) · [API Reference](../reference/servo.md) · [Scheduler](../../../shared/en/guides/scheduler.md) · [Runtime Config](../../../shared/en/guides/runtime-config.md)

Sources: [named facade](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/student_api_servo_multi.py), [named handler](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/servo_multi_handler.py), [BoardServo](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/servo.py), [reset/close handler](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/handler.py), [named config](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/servo_multi_config.py). Commit `f875289b5698f0e61faf64196b1165a3b18f2bd5`.
