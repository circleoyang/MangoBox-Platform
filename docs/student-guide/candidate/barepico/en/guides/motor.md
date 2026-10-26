# External motors and drive on BarePico

> Candidate source: BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26. Source review is not hardware acceptance.

## 1. What you can do and prepare

Control M1/M2 through an external dual-input H-bridge, or use chassis movement commands. BarePico has no carrier motor driver; never connect a motor directly to GPIO. Enable `enabled_modules.motor` and explicitly configure `motors.M1` and `motors.M2` with `enabled`, `in1_pin`, `in2_pin` and `driver=dual_input`. This source requires both channels even for an M1-only test.

## 2. 30-second quick test

Lift the wheels, secure the mechanism and keep motor power easy to disconnect. Type RUN only after checking the driver wiring. M1 receives a low command of 20 for 400 ms, then stops. This is a proposed physical test, not a claim that it has passed.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("motor", False):
    raise RuntimeError("Enable external Motor in Device Manager")
channels = m.config.get("motors", {})
for channel in ("M1", "M2"):
    spec = channels.get(channel, {})
    if not spec.get("enabled", False):
        raise ValueError("Both M1 and M2 must be configured and enabled")
    if spec.get("driver", "dual_input") != "dual_input":
        raise ValueError("This example requires the configured dual-input H-bridge")
print("Confirm lifted wheels, clear mechanism and the configured driver wiring.")

def wait_running(milliseconds):
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < milliseconds:
        m.run_once()
        time.sleep_ms(10)

try:
    if input("Type RUN after checking the mechanism: ").strip() == "RUN":
        m.motor_run("M1", 20)
        wait_running(400)
        m.motor_brake("M1")
finally:
    m.close()
```

## 3. What to observe

Only M1 should turn briefly. A low command may not overcome starting friction. If it does not turn, check power, wiring and the driver before increasing the command. Positive/negative speed selects opposite directions; successful command dispatch does not prove physical direction.

## 4. Common uses

Use `motor_run()`, `motor_brake()` and `motor_coast()` for one channel. Use `forward()`, `backward()` and `drive_tank()` for chassis movement; left/right mapping and inversion follow DM `drive` settings. `forward()` and `backward()` enable minimum-speed and startup assistance, so `forward(20)` does not promise a constant output of 20. This interaction uses `drive_tank(..., assist=False)` to avoid those boosts; DM direction and scaling calibration still apply. Brake and coast have different electrical behavior; stopping distance still depends on the actual mechanism.

## 5. Complete interactive example

Keep the wheels lifted. Type f or b for a low-speed 400 ms action. Every action stops before the next blocking keyboard read. `finally` and `close()` handle program exit paths; they are not safety hardware for a power failure, a completely stalled program or a hardware fault.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("motor", False):
    raise RuntimeError("Enable external Motor in Device Manager")
channels = m.config.get("motors", {})
for channel in ("M1", "M2"):
    spec = channels.get(channel, {})
    if not spec.get("enabled", False):
        raise ValueError("Both M1 and M2 must be configured and enabled")
    if spec.get("driver", "dual_input") != "dual_input":
        raise ValueError("This example requires the configured dual-input H-bridge")
print("Confirm lifted wheels, clear mechanism and the configured driver wiring.")

def wait_running(milliseconds):
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < milliseconds:
        m.run_once()
        time.sleep_ms(10)

try:
    while True:
        command = input("f = forward 400ms, b = backward 400ms, q = quit: ").strip().lower()
        if command == "q":
            break
        if command in ("f", "b"):
            try:
                if command == "f":
                    m.drive_tank(20, 20, assist=False)
                else:
                    m.drive_tank(-20, -20, assist=False)
                wait_running(400)
            finally:
                m.stop()
        # Every action is stopped before the next blocking input().
finally:
    m.close()
```

## 6. Target/mode notes and troubleshooting

For BarePico High-Level MicroPython v0.1.0-rc6 candidate source. This local API tutorial does not imply that a phone web interface has motor-control permission or that hardware was accepted.

Diagnose: profile → aggregate enable → both channel configurations → GPIO and H-bridge IN1/IN2 wiring → DM direction/PWM slice conflicts → separate motor power, common ground and mechanism. For raw electrical diagnosis, remove motor power and stop Mango first, then measure the configured pins. Never import MangoLite fixed pin defaults.

## 7. Small challenge

Keep the low-speed and 400 ms limits. Compare observed M1, M2 and chassis drive_tank directions. Record the results and correct the DM direction configuration rather than negating every command in the application.

[API Reference](../reference/motor.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py` and `runtime/barepico/firmware/barepico/drive_controller.py`.
