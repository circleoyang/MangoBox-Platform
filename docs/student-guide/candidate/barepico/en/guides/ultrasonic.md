# Ultrasonic distance on BarePico

> Candidate source: BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26. Source review is not hardware acceptance.

## 1. What you can do and prepare

Measure distance or react to near/far transitions. Enable `enabled_modules.ultrasonic_sensor` and configure named `ultrasonic_sensors` entries with `enabled`, `trigger_pin`, `echo_pin`, `samples` and related settings. Select `current_ultrasonic_setting` when several are enabled. DM short keys `trigger/echo` are also supported; if both key forms exist, their values must agree. BarePico has no fixed Trigger/Echo fallback pins.

## 2. 30-second quick test

Move a flat object closer and farther during ten readings. Echo must stay within the Pico input voltage range. A module with a 5V Echo output needs suitable level conversion before connection to a Pico GPIO.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("ultrasonic_sensor", False):
    raise RuntimeError("Enable ultrasonic_sensor in Device Manager first")
items = {name: spec for name, spec in m.config.get("ultrasonic_sensors", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_ultrasonic_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled ultrasonic_sensors entry in Device Manager")
    name = next(iter(items))
spec = items[name]

try:
    trigger = spec.get("trigger_pin", spec.get("trigger"))
    echo = spec.get("echo_pin", spec.get("echo"))
    print("Sensor:", name, "Trigger:", trigger, "Echo:", echo)
    for _ in range(10):
        value = m.distance(sensor=name)
        print("No valid echo" if value is None else str(value) + " cm")
        time.sleep_ms(150)
finally:
    m.close()
```

## 3. What to observe

Valid readings are floats from 2.0 to 300.0 cm, rounded to 0.1 cm. An invalid echo may return `None`; hardware errors can also raise exceptions. `None` is not 0 cm and is not evidence of a clear path. `is_near()` returns False for an invalid reading, so safety logic must establish validity separately. Sensors share a minimum read interval; `period` is not a hard-real-time sampling guarantee.

## 4. Common uses

Use `distance(sensor=name)` for one measurement, `on_distance_change()` for changes and `on_near()`/`on_far()` for thresholds. Near/far callbacks have no distance argument. If displaying a separately obtained reading, distinguish its timestamp from the event. The near threshold must be lower than the far threshold.

## 5. Complete interactive example

The example reports NEAR at or below 20 cm and FAR at or above 30 cm. The gap reduces chatter. The runtime evaluates valid samples; the first satisfied threshold can also produce an event. Callbacks save a pending event and the foreground prints it. This example does not drive a vehicle.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("ultrasonic_sensor", False):
    raise RuntimeError("Enable ultrasonic_sensor in Device Manager first")
items = {name: spec for name, spec in m.config.get("ultrasonic_sensors", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_ultrasonic_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled ultrasonic_sensors entry in Device Manager")
    name = next(iter(items))
spec = items[name]

pending = None

def near():
    global pending
    pending = "NEAR"

def far():
    global pending
    pending = "FAR"

m.on_near(20, near, period=150, sensor=name)
m.on_far(30, far, period=150, sensor=name)
try:
    while True:
        m.run_once()
        if pending is not None:
            event = pending
            pending = None
            print(event)
        time.sleep_ms(10)
finally:
    m.close()
```

## 6. Target/mode notes and troubleshooting

For all three BarePico targets using candidate High-Level MicroPython v0.1.0-rc6. Do not respond to missing echoes by increasing timeout indefinitely; measurements can delay the shared event loop.

Diagnose: profile → aggregate/named enable → real Trigger/Echo wires versus DM → level conversion/power/common ground → object distance, angle and surface. Start with one sensor and a flat target before testing multiple sensors for acoustic interference. Stop Mango before any separate raw pulse test. Hardware Lab handles firmware/mode issues; it is not an ultrasonic waveform instrument.

## 7. Small challenge

Try near 15 cm and far 25 cm, then compare transition stability. Record when `None` occurs and design a clear “reading temporarily unavailable” state for the interaction.

[API Reference](../reference/ultrasonic.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
