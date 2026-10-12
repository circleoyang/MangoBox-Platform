# MangoBox Runtime Config — Read Device Manager Settings

**High-Level MicroPython only** on MangoLite and MangoX2. This guide uses the existing `m.config.get()` Runtime object, without introducing any new Student API, and does not claim Host Python exposes the same object.

Device Manager (DM) owns module names, pins, LED counts, enable flags and calibration settings. Read rather than hardcode configuration, validate missing values, and restart the program to reload changes made in DM.

```python
from mangobox import Mango
m = Mango()
STRIP = "strip1"
spec = m.config.get("led_strips", {}).get(STRIP)
if not isinstance(spec, dict) or not spec.get("enabled", False):
    raise ValueError("Missing or disabled LED strip: " + STRIP)
count = int(spec["leds"])
if count <= 0:
    raise ValueError("Invalid LED count")
print("GPIO", spec.get("pin"), "LED count", count)
```

Use `count` for a custom LED frame, scheduled by `m.scheduler.add_task(callback, period=100)`. See the [tested Quantum Ripple tutorial](guides/scheduler.md).

## Common keys

| Module | Configuration keys |
|---|---|
| LED strips | `led_strips` dictionary, nested `pin`, `leds`, `power`, `enabled` |
| Buttons | `buttons` dictionary, nested `pin`, `pull`, `active`, `debounce_ms`, `enabled` |
| Cap Touch | `cap_touches` dictionary |
| Light | `light_sensor_pin` |
| Sound | `sound_sensor_pin` |
| Servo | `servo_pin`, `servo_min_angle`, `servo_max_angle` |
| Motor | `motor_a_in1_pin`, `motor_a_in2_pin`, `motor_b_in1_pin`, `motor_b_in2_pin` |
| Joystick | `ps2_vrx_pin`, `ps2_vry_pin`, `ps2_sw_pin` |
| OLED | `oled_sda_pin`, `oled_scl_pin`, `oled_addr` |
| Buzzer | `buzzer_pin`, `buzzer_mode` |
| PIR | `pir_sensor_pin` |
| Ultrasonic and Pot | Version-specific; inspect their actual published DM / Runtime config contracts rather than inventing keys |

Use `m.config.get("key", default)` for read-only access. Named modules and legacy scalar module settings are not interchangeable. Some keys may be absent in older runtimes. Do not mutate `m.config.data` or bypass DM validation with direct file writes.

**LLM instructions:** Do not hardcode DM-defined hardware parameters if the relevant configuration key is documented. Do not invent query methods such as `m.led_count()` or `m.led_info()`. Validate missing values and `enabled`, and never assume Host Python has `m.config.get()`. See the [Scheduler guide](guides/scheduler.md).
