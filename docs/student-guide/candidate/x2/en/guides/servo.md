# MangoX2 Servo: select a named device and run a bounded action

> Source candidate Runtime 0.2.10-rc2 · MangoX2 + Pico / Pico W / Pico 2 W · High-Level MicroPython. Source and syntax review is not hardware acceptance. Runtime and MangoThonny have separate versions.

## 1. What you can do and prepare

A servo accepts angle commands for a light pointer or display mechanism. On MangoX2, `name=` selects a configured servo with its own GPIO, angle limits and pulse widths. This page activates one selected servo at a time.

Enable `enabled_modules.servo` and the intended entry in `servos` in Device Manager. Check `pin`, `min_angle`, `max_angle`, `min_us` and `max_us`. With several enabled entries, set `current_servo_setting`. The examples read only the required settings. Legacy scalar settings remain supported by Runtime, but this teaching path requires an explicit named collection. Do not assume GP14; another enabled module may claim it.

Connect the signal to the configured GPIO, use power appropriate for the actual servo, and share ground. Remove the load and confirm free movement within the selected limits. Accepting 0–180 degrees does not establish that a mechanism can move through that whole range. Recreate Mango after changing the configuration.

## 2. 30-second quick test

This complete program checks enable flags, a selected name and angle limits. Type `RUN` to request the midpoint once. The 800 ms interval is observation time, not proof of arrival. It explicitly releases PWM and then closes the session.

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

No move_to or sweep is scheduled here, so no persistent event loop is required. In this example, servo_release turns off the holding signal from the direct position command.

## 3. What to observe

The mechanism should move toward the configured midpoint. External force may move it after PWM is released. `servo_get_angle(name=name)` reports the stored command, possibly `None`; it is not an encoder measurement. For no motion, jitter or resets, inspect configuration, wiring/common ground, power and the mechanism. A printed angle cannot establish hardware success.

## 4. Common uses and confirmed limitations

| Need | X2 method | Lifecycle |
| --- | --- | --- |
| Request an angle directly | `servo(angle, name=None)` | Writes a PWM command immediately; no physical arrival guarantee |
| Move toward a target in steps | `servo_move_to(angle, step=5, period=60, name=None)` | Scheduler advances the command; keep servicing it |
| Sweep between endpoints | `servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None)` | Continues until explicitly stopped |
| Stop sweeping | `servo_stop(name=None)` | Stops sweep only and retains PWM |
| Release the holding signal | `servo_release(name=None)` | Stops sweep and immediately sets PWM duty to zero |

`step` and `period` are converted to integers and clamped to at least 1; period is in milliseconds. `name=None` uses Runtime's default selection. These examples pass a checked name on every call. If no angle has been commanded yet, the first move_to writes its target directly; the driver cannot observe the shaft's starting position.

**The current servo control logic shared across the three families has a cancellation gap: neither servo_stop nor servo_release cancels an unfinished move_to.** Release sets duty to zero immediately, but a later move tick can write PWM again. A new servo() or move_to also does not reliably replace the old task. Do not overlap move_to calls or treat release as cancellation/completion feedback. The runnable examples here use direct positioning and bounded sweeps.

On the normal Carrier close path, reset_runtime clears Scheduler, including pending move tasks. It does not call Servo release or PWM.deinit. Finish these examples with stop/release followed by close; do not claim that close alone releases holding output. If an unfinished move_to exists, end the session by releasing and immediately closing in the same foreground cleanup, without another Scheduler service between them. That is session shutdown, not a per-servo cancellation API for continued use.

## 5. Complete interactive example: short actions on one selected servo

Use `1` or `2` to request a position within 15 degrees of the midpoint, `3` for a three-second sweep, and `q` to finish. Each action stops/releases before returning to blocking input. The foreground owns run_once; it does not also start run_forever.

```python
from mangobox import Mango
import time

m = Mango()
name = None
active = False

def service(milliseconds):
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < milliseconds:
        m.run_once()
        time.sleep_ms(10)

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
    left = max(low, center - 15)
    right = min(high, center + 15)
    print("Test range:", left, right, "degrees")
    while True:
        command = input("1=left, 2=right, 3=three-second sweep, q=quit: ").strip()
        if command == "q":
            break
        if command not in ("1", "2", "3"):
            continue
        active = True
        if command == "3":
            m.servo(center, name=name)
            m.servo_sweep(left, right, step=3, period=60, name=name)
            service(3000)
        else:
            m.servo(left if command == "1" else right, name=name)
            service(800)
        m.servo_stop(name=name)
        m.servo_release(name=name)
        active = False
        print("Command interval finished; PWM released")
finally:
    try:
        if active:
            m.servo_stop(name=name)
            m.servo_release(name=name)
    finally:
        m.close()
```

“Interval finished” means only that the command service interval elapsed. If you add a Button callback, record a request in the callback and process it in the foreground after run_once returns. Do not enter the event loop recursively or clear the entire Scheduler to stop one servo.

## 6. Version, mode and troubleshooting

This page covers the three X2 targets above in High-Level MicroPython. Lite has no `name=` argument, while BarePico uses a different select_servo interface. Do not exchange their examples. Host Python coordinates work through the computer/transport and does not inherit this candidate's callback or close behavior.

Check profile/Runtime → module and named-entry enable → name/GPIO/angle/pulse settings → direct positioning → Scheduler → power/mechanism. An unknown or disabled name can raise ValueError. An angle outside 0–180 after integer conversion also raises ValueError. If direct positioning works and sweeping does not, confirm that run_once actually continues to run.

There is no arrival callback. API events and driver angle messages describe software operations; they do not prove a physical result. Avoid per-tick logging and do not manufacture `@@MANGO_EVENT@@` records. The known cancellation gap requires a Runtime fix; passing syntax checks does not repair it.

## 7. Small challenge

Keep one servo, the same small angle range and the three-second stop condition. Compare sweep step=2 with step=4, then compare period=60 with period=100 in a separate run. Change one parameter at a time, retain release/close cleanup, and record observations and power conditions. To test a second servo, select it in DM and rerun the single-device test; do not stack unfinished move_to operations.

[Complete Guide](../guides/servo.md) · [API Reference](../reference/servo.md) · [Scheduler](../../../shared/en/guides/scheduler.md) · [Runtime Config](../../../shared/en/guides/runtime-config.md)

Sources: [named facade](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/student_api_servo_multi.py), [named handler](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/servo_multi_handler.py), [BoardServo](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/servo.py), [reset/close handler](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/handler.py), [named config](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/servo_multi_config.py). Commit `f875289b5698f0e61faf64196b1165a3b18f2bd5`.
