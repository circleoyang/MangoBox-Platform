# MangoLite Servo: one configured servo and a bounded sweep

> Source candidate Runtime 0.6.5-rc2; MangoLite + Pico W / Pico 2 W; High-Level MicroPython. These examples are source-reviewed; physical-device acceptance has not been established by this update.

## 1. What you can build and prepare

A servo accepts angle requests for a lightweight pointer or demonstration mechanism. This Lite facade controls the single servo configured in DM. Its methods do not accept `name=`, and it has no `select_servo()` method. Use this learner path for Lite.

Enable Servo in Device Manager and verify `servo_pin`, `servo_min_angle`, `servo_max_angle`, `servo_min_us` and `servo_max_us`. Wire the signal to the configured GPIO, supply power appropriate for the servo, and share ground with MangoBox. Remove loads that could jam, collide or fall during the first test. The API's 0–180 range does not prove that the mechanism can safely travel through that range.

## 2. A 30-second quick test

This complete program checks configuration and waits for `RUN` before requesting the midpoint of the configured range. It releases the PWM holding signal after a short wait.

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
        raise ValueError("Check the configured Servo angle range")
    center = (low + high) // 2
    print("Signal GPIO:", m.config.get("servo_pin"))
    print("Requested center:", center)
    if input("Clear the mechanism; type RUN: ").strip() == "RUN":
        active = True
        m.servo(center)
        time.sleep_ms(800)
        print("Software angle:", m.servo_get_angle())
finally:
    try:
        if active:
            m.servo_release()
    finally:
        m.close()
```

This test has an immediate angle request and no persistent callback. Its short wait does not replace a required event loop. The interaction below demonstrates foreground Scheduler service.

## 3. What to observe

With suitable configuration, power and mechanics, the servo should move toward the requested midpoint. `servo_get_angle()` reports the latest software angle retained/reported by Runtime and can return `None`; it is not a physical angle sensor. A successful command return does not prove that the mechanism reached its position.

After `servo_release()`, external force may move the shaft. Do not suspend a heavy load in this test. Stop if the servo stalls, buzzes continuously or shakes, or if the board resets. Check angle/PWM calibration, power and mechanical load.

## 4. Common uses and method selection

| Goal | Lite method | Execution |
| --- | --- | --- |
| Request an angle immediately | `m.servo(angle)` | No persistent event loop needed |
| Move gradually toward an angle | `m.servo_move_to(angle, step=5, period=60)` | Keep servicing the Scheduler |
| Sweep between endpoints | `m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)` | Continuous action that needs an explicit stop |
| Stop sweeping | `m.servo_stop()` | Stops the sweep request; does not release PWM |
| Release the holding signal | `m.servo_release()` | Holding force may be lost |

`step` is an angle increment and `period` is milliseconds. Both are converted to integers and bounded below by 1. A smaller step gives finer command increments, without guaranteeing physical speed or position accuracy. Choose endpoints within the verified mechanical range.

## 5. Complete interaction: one bounded action per command

Enter `1` or `2` for positions within 15 degrees of the midpoint, `3` for a three-second sweep, or `q` to finish. Each action stops sweeping and releases PWM before waiting for another command.

```python
from mangobox import Mango
import time

m = Mango()
active = False

def service(milliseconds):
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < milliseconds:
        m.run_once()
        time.sleep_ms(10)

try:
    if not m.config.get("enabled_modules", {}).get("servo", False):
        raise RuntimeError("Enable Servo in Device Manager")
    low = int(m.config.get("servo_min_angle", 0))
    high = int(m.config.get("servo_max_angle", 180))
    if not 0 <= low < high <= 180:
        raise ValueError("Check the configured Servo angle range")
    center = (low + high) // 2
    left = max(low, center - 15)
    right = min(high, center + 15)
    print("Check power, common ground and GPIO:", m.config.get("servo_pin"))
    print("Test range:", left, right, "degrees; remove the load")
    while True:
        command = input("1=left, 2=right, 3=three-second sweep, q=quit: ").strip()
        if command == "q":
            break
        if command not in ("1", "2", "3"):
            continue
        active = True
        if command == "3":
            m.servo(center)
            m.servo_sweep(left, right, step=3, period=60)
            service(3000)
        else:
            m.servo(left if command == "1" else right)
            service(800)
        m.servo_stop()
        m.servo_release()
        active = False
        print("Action finished; PWM released")
finally:
    try:
        if active:
            m.servo_stop()
            m.servo_release()
    finally:
        m.close()
```

`service()` calls `run_once()` only in the foreground. If you later add a Button callback, record its requested action and handle it after `run_once()` returns.

## 6. Versions, modes and troubleshooting

Check the Lite profile and installed runtime, DM enablement/GPIO/angle/PWM settings, then an immediate angle request. Next inspect power, ground and mechanics. If immediate positioning works but sweeping does not, first verify that the event loop keeps running.

Lite has no `name` keyword; supplying it raises `TypeError`. Angles outside 0–180 raise `ValueError`, and sweep requires the minimum angle to be below the maximum. `servo_stop()` specifically stops sweeping; `servo_release()` releases the holding signal. A new device firmware does not establish Host Python lifecycle parity.

## 7. Small challenge

Compare `step=2, period=60` with `step=4, period=60` over the same safe range. Record the command pattern, observations and limitations. Change one setting at a time, retain the bounded duration and finally cleanup, and do not infer physical positioning error from software angle values.

[Complete Servo Reference](../reference/servo.md) · [Scheduler](../../../shared/en/guides/scheduler.md) · [Runtime Config](../../../shared/en/guides/runtime-config.md)

Source: [Lite student_api.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api.py) and [Runtime Config](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/runtime/config.py), pinned to `f875289b5698f0e61faf64196b1165a3b18f2bd5`.
