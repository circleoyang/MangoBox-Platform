# Potentiometers on BarePico

> Candidate source: BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26. Source review is not hardware acceptance.

## 1. What you can do and prepare

Read knob position as 0–100% or react to changes. Enable `enabled_modules.potentiometer` and configure named `potentiometers` entries with `enabled`, ADC `pin`, calibration limits and `invert`. Select `current_pot_setting` when several are enabled. The signal must use a configured GP26, GP27 or GP28 ADC input.

## 2. 30-second quick test

Turn the knob during the two-second readout. Percentage and scaled ADC values are separate readings and need not represent exactly the same instant.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("potentiometer", False):
    raise RuntimeError("Enable potentiometer in Device Manager first")
items = {name: spec for name, spec in m.config.get("potentiometers", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_pot_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled potentiometers entry in Device Manager")
    name = next(iter(items))
spec = items[name]

try:
    print("Pot:", name, "GPIO:", spec["pin"])
    for _ in range(20):
        print("percent:", m.pot(name), "raw:", m.pot_raw(name))
        time.sleep_ms(100)
finally:
    m.close()
```

## 3. What to observe

Percentage should change within 0–100. Raw values are scaled to 0–65535; this does not imply a physical 16-bit ADC. `pot_voltage()` estimates voltage. Its `supply` argument provides no electrical protection. Check DM inversion if direction is reversed and calibration if values stick at an endpoint.

## 4. Common uses

Use `pot(name)` for a position and `on_pot_change()` to update only after a meaningful change. This BarePico source sends the first valid sample to `changed(value)`, then compares with the last delivered value. Callbacks for `on_pot_above()` and `on_pot_below()` take no arguments; their initial sample establishes the crossing baseline.

## 5. Complete interactive example

This three-band selector requests updates after a change of at least three percentage points. The callback only saves the value; the foreground labels it LOW, MID or HIGH. It does not print on every polling tick.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("potentiometer", False):
    raise RuntimeError("Enable potentiometer in Device Manager first")
items = {name: spec for name, spec in m.config.get("potentiometers", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_pot_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled potentiometers entry in Device Manager")
    name = next(iter(items))
spec = items[name]

pending = None

def changed(value):
    global pending
    pending = value

m.on_pot_change(changed, threshold=3, period=100, name=name)
try:
    while True:
        m.run_once()
        if pending is not None:
            value = pending
            pending = None
            band = "LOW" if value < 33 else "MID" if value < 67 else "HIGH"
            print("Knob:", value, "%", band)
        time.sleep_ms(10)
finally:
    m.stop_pot(name)
    m.close()
```

## 6. Target/mode notes and troubleshooting

For BarePico High-Level MicroPython v0.1.0-rc6 candidate source. Do not infer identical first-event or return semantics for carrier/Host implementations.

Diagnose: profile → aggregate/named enable → ADC GPIO and wiper signal → DM calibration/inversion → VCC/GND. Never feed 5V or 12V directly into a Pico ADC input; stay within its supported voltage range. For raw diagnosis, stop the application and use a separate `machine.ADC(pin).read_u16()` program on the configured pin. Recreate Mango after changing DM settings.

## 7. Small challenge

Compare thresholds of 1 and 5. Observe the trade-off between frequent updates and response sensitivity. Add above/below thresholds with hysteresis to avoid chatter near a boundary.

[API Reference](../reference/pot.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
