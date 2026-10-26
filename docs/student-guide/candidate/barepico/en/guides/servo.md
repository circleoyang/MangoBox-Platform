# External servos on BarePico

> Candidate source: BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26. Source review is not hardware acceptance.

## 1. What you can do and prepare

Set a named servo target angle or move in small steps. Enable `enabled_modules.servo` and configure `servos` entries with name, `enabled`, `pin`, angle limits and pulse widths. Select `current_servo_setting` when several servos are enabled. Remove the load or confirm free movement first; use power appropriate for the actual servo and a common ground.

## 2. 30-second quick test

This program selects the midpoint of DM limits, sends one direct position command, then calls `close()` after half a second to clear tasks and deinitialize PWM. Confirm that midpoint is within the mechanism's permitted range. The test starts no move_to and does not treat release as motion completion.

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

## 3. What to observe

The servo should move toward the configured midpoint. `servo_get_angle()` reports the stored commanded angle, not an encoder measurement; the number may change even if the mechanism stalls. This page uses `close()` for full cleanup; without continuing PWM, the mechanism is not guaranteed to hold position.

## 4. Common uses

Select with `select_servo(name)`, then call `servo(angle)` or `servo_move_to(angle, step, period)`. BarePico does not accept the carrier `servo(angle, name=...)` signature. If no angle is stored, the first move_to writes the target directly; the interactive example first sets a midpoint.

**Candidate limitation: `servo_stop()` only stops sweep; `servo_release()` stops sweep and sets PWM duty to zero. Neither cancels an unfinished move_to.** The old task may write output again on its next tick, and direct servo() does not cancel it either. Do not overlap move_to calls or treat stop/release as cancellation/completion feedback. Use `close()` for complete shutdown and create a new Mango for another run.

## 5. Complete interactive example

Type l, c or r to move within 15 degrees of the midpoint. The example bounds targets by DM limits, drives Scheduler until the stored command reaches the target, then runs one more due period so the move task can retire before another input. A three-second timeout raises an error and closes the session. This observes software progress only; inspect the physical mechanism yourself. All work stays in the foreground.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("servo", False):
    raise RuntimeError("Enable servo in Device Manager first")
items = {name: spec for name, spec in m.config.get("servos", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_servo_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled servos entry in Device Manager")
    name = next(iter(items))
spec = items[name]

low = max(0, int(spec.get("min_angle", 0)))
high = min(180, int(spec.get("max_angle", 180)))
if low >= high:
    raise ValueError("Check the configured Servo angle limits")
center = (low + high) // 2
m.select_servo(name)

def move_and_wait(target):
    period = 60
    m.servo_move_to(target, step=2, period=period)
    started = time.ticks_ms()
    while m.servo_get_angle() != target:
        if time.ticks_diff(time.ticks_ms(), started) >= 3000:
            raise RuntimeError("Software move did not finish; close the session")
        m.run_once()
        time.sleep_ms(10)
    # Let the move task remove itself on the next due pass.
    reached = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), reached) < period:
        m.run_once()
        time.sleep_ms(10)
    m.run_once()

positions = {"l": max(low, center - 15), "c": center, "r": min(high, center + 15)}
try:
    m.servo(center)
    while True:
        command = input("l / c / r / q: ").strip().lower()
        if command == "q":
            break
        if command in positions:
            move_and_wait(positions[command])
            print("Commanded angle:", m.servo_get_angle())
finally:
    m.close()
```

## 6. Target/mode notes and troubleshooting

For BarePico High-Level MicroPython v0.1.0-rc6 candidate source; software checks cannot replace mechanism acceptance.

Diagnose: profile → aggregate/named enable → GPIO/signal wire → DM angle/pulse limits → external power/common ground → mechanical obstruction. Check power first for resets or jitter. Recreate Mango after changing pins/limits. Resolve PWM slice conflicts with Motor/Buzzer in configuration; do not introduce a second PWM owner.

## 7. Small challenge

Try a five-degree movement range, then compare different `step` and `period` values. Do not jump straight to a full 0–180 degree sweep; check the mechanism limits first.

[API Reference](../reference/servo.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
