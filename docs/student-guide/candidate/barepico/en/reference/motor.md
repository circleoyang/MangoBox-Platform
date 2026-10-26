# BarePico Motor channels and differential drive — API Reference

> Source candidate: v0.1.0-rc6; BarePico Pico / Pico W / Pico 2 W; High-Level MicroPython. Source review does not claim Windows or physical-device acceptance in this update.

## Setup, targets and mode

Enable `enabled_modules.motor` in DM and explicitly configure M1/M2 `in1_pin/in2_pin` plus the `drive` profile. BarePico uses an external dual-input driver with no carrier motor pin/power defaults. Confirm driver compatibility, power and common ground. Hardware is acquired lazily and each action checks for DM profile changes.

## Methods, exact signatures and returns

Defaults are exactly those in the signatures below. Import with `from mangobox import Mango` and construct `m = Mango()`.

| Signature | Meaning | Returns |
| --- | --- | --- |
| `m.arc_left(outer_speed=80, inner_speed=60)` | Drive a left arc using inner/outer speeds. | `None` |
| `m.arc_right(outer_speed=80, inner_speed=60)` | Drive a right arc. | `None` |
| `m.backward(speed=70)` | Drive backward. | `None` |
| `m.coast()` | Request chassis coasting. | `None` |
| `m.drive_tank(left, right, assist=False)` | Set left/right commands and assistance explicitly. | `None` |
| `m.forward(speed=70)` | Drive forward; low-speed/startup assistance may apply. | `None` |
| `m.motor_brake(motor)` | Brake one motor. | `None` |
| `m.motor_coast(motor)` | Coast one motor. | `None` |
| `m.motor_run(motor, speed)` | Command a named motor with signed speed. | `None` |
| `m.pivot_left(speed=70)` | Pivot left. | `None` |
| `m.pivot_right(speed=70)` | Pivot right. | `None` |
| `m.spin_left(speed=70)` | Spin left. | `None` |
| `m.spin_right(speed=70)` | Spin right. | `None` |
| `m.stop()` | Request chassis braking. | `None` |

## Parameter types, ranges and defaults

| Parameter | Type and rules |
| --- | --- |
| `motor` | `M1/M2`, or aliases A/RIGHT=M1 and B/LEFT=M2. These aliases are separate from drive.left_motor/right_motor chassis mapping. |
| `speed` | Converted to an integer and clamped to -100–100. motor_run preserves sign; forward/backward/pivot/spin use the magnitude and choose direction by method. |
| `left / right` | drive_tank left/right commands -100–100; DM inversion and mapping still apply. |
| `assist` | Default False; True may apply startup/low-speed assistance. False still applies chassis scale and direction settings. |
| `outer_speed / inner_speed` | Outer/inner wheel magnitudes, converted, clamped and made non-negative. |

## Events and lifecycle

Public wrappers return None; internal driver/drive results are not public wheel-speed or position feedback. `motor_run()` sends a raw single-channel -100–100 request without chassis scaling, inversion or assist. Chassis APIs use the `drive` profile. `assist=False` disables low-speed/startup assistance but still applies chassis scaling and inversion.

`motor_run(..., 0)` and `drive_tank(0, 0)` coast with zero PWM. `stop()` / `motor_brake()` instead request electrical braking with both inputs high. High-level `forward(0)` and similar direction methods invoke stop. `coast()` / `motor_coast()` put both inputs at zero. None of these commands confirms an immediate mechanical stop.

Forward/backward/pivot/spin/arc enable assist, so a small speed may produce higher PWM. Configured startup_boost_ms and reversal dead time use synchronous waits; there is no fully nonblocking guarantee. Begin with explicit low commands, lifted wheels and a short deadline. For chassis testing use drive_tank(20,20,assist=False) and check scaling. Arc calls do not require inner<=outer; choose appropriate magnitudes.

Each use checks the configuration signature and releases/recreates resources after changes. `close()` performs best-effort coast/deinit cleanup; **it does not retain braking PWM**. A stop call is not a passive preflight query either, because chassis commands can initialize both channels.

## Errors and diagnostic order

Invalid motor names, invalid/conflicting pins, disabled state and closed objects are rejected. Runtime attempts to release old resources when configuration changes or becomes invalid; this is not hardware stop verification. Check profile, enablement, driver pin mapping, DM left/right and inversion, a short raised-wheel test, then power/wiring.

## Complete minimal example

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("motor", False):
        raise RuntimeError("Enable external Motor in Device Manager")
    channels = m.config.get("motors", {})
    if not isinstance(channels, dict):
        raise ValueError("Check the motors configuration")
    for channel in ("M1", "M2"):
        spec = channels.get(channel)
        if not isinstance(spec, dict) or not spec.get("enabled", False):
            raise ValueError("Configure and enable both M1 and M2")
        if spec.get("driver", "dual_input") != "dual_input":
            raise ValueError("This example requires a dual-input H-bridge")
    print("Lift wheels and check the driver wiring before the short test.")
    if input("Type RUN to test M1 briefly: ").strip() == "RUN":
        m.motor_run("M1", 20)
        started = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), started) < 400:
            m.run_once()
            time.sleep_ms(10)
        m.motor_brake("M1")
        time.sleep_ms(100)
finally:
    m.close()
```

## Related reading

[Guide](../guides/motor.md) · [Lifecycle](../../../shared/en/guides/lifecycle.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md)

## Reviewed source and validation

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/barepico/firmware/barepico/motor_driver.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/motor_driver.py)
- [runtime/barepico/firmware/barepico/drive_controller.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/drive_controller.py)

Reviewed source SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`. Examples received syntax and source-contract checks only; this update makes no hardware PASS claim.
