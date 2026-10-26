# Light sensing on BarePico

> Candidate source: BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26. Source review is not hardware acceptance.

## 1. What you can do and prepare

Read relative brightness or react when it crosses dark/bright thresholds. This BarePico API uses one `light_sensor_pin`; it is not a named multi-light-sensor interface. Enable `enabled_modules.light_sensor` and set its ADC GPIO, `light_raw_bright`, `light_raw_dark` and `light_sample_count` in DM.

## 2. 30-second quick test

Cover the sensor, then uncover it while observing the two-second readout.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("light_sensor", False):
    raise RuntimeError("Enable light_sensor in Device Manager first")
pin_no = m.config.get("light_sensor_pin")
if not isinstance(pin_no, int):
    raise ValueError("Configure light_sensor_pin in Device Manager")

try:
    print("Light GPIO:", pin_no)
    for _ in range(20):
        print("Relative brightness:", m.light())
        time.sleep_ms(100)
finally:
    m.close()
```

## 3. What to observe

`light()` returns an integer from 0 to 100: 0 is darker and 100 brighter. It is not lux. This source requires `raw_bright < raw_dark`. If the physical circuit reverses that relationship, do not swap calibration endpoints into an invalid order; inspect the sensor wiring and configuration.

## 4. Common uses

`on_light_below()` and `on_light_above()` report threshold crossings through callbacks with no arguments. The initial reading establishes a baseline rather than a spurious transition. Hysteresis requires moving back past the re-arm boundary before another event. This BarePico source has no `on_light_change()`; do not borrow that call from another family.

## 5. Complete interactive example

The example records DARK below 30 and BRIGHT above 70. Callbacks only set a pending flag; the foreground prints it. Cover and uncover the sensor to cross both thresholds.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("light_sensor", False):
    raise RuntimeError("Enable light_sensor in Device Manager first")
pin_no = m.config.get("light_sensor_pin")
if not isinstance(pin_no, int):
    raise ValueError("Configure light_sensor_pin in Device Manager")

pending = None

def dark():
    global pending
    pending = "DARK"

def bright():
    global pending
    pending = "BRIGHT"

m.on_light_below(30, dark, hysteresis=5, period=100)
m.on_light_above(70, bright, hysteresis=5, period=100)
try:
    while True:
        m.run_once()
        if pending is not None:
            event = pending
            pending = None
            print(event)
        time.sleep_ms(10)
finally:
    m.stop_light()
    m.close()
```

## 6. Target/mode notes and troubleshooting

For BarePico High-Level MicroPython v0.1.0-rc6 candidate source. `capabilities()` describes the board, not light-sensor health.

Diagnose: target/version → aggregate enable → configured GP26/27/28 and actual signal wire → DM bright/dark calibration → power, common ground and sensor orientation. Verify the quick read first, then inspect thresholds and the event loop. Stop Mango before a separate `machine.ADC` raw test; print the configured pin and read `read_u16()`. Recreate Mango after pin or calibration changes.

## 7. Small challenge

Find suitable classroom thresholds using shade and a flashlight. Leave a gap between dark and bright thresholds, then compare event frequency with hysteresis 0 and 5.

[API Reference](../reference/light.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
