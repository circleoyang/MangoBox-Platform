# Potentiometer Guide

> **Host Python version notice:** This documents the API for a Host package that actually integrates Pot. The currently listed Host Python 0.4.6 profile does not advertise Pot support; do not assume existing MangoThonny builds include it. A physical Runtime is required; virtual Pot is unsupported.


The Pot API reports a calibrated knob position from **0 to 100%**. Enable the potentiometer module and a named profile such as `pot1` in Device Manager before running these High-Level MicroPython examples.

## Quick check
```python
from mangobox import Mango
import time
m = Mango()
print(m.supports("pot"))
while True:
    print(m.pot("pot1"), "%")
    time.sleep(0.2)
```

## Control LED strip brightness
```python
from mangobox import Mango
import time
m = Mango()
m.led_all("#ff8800", strip="strip1")
while True:
    m.brightness(m.pot("pot1"), strip="strip1")
    time.sleep(0.1)
```

Use the configured strip name. For events, register `m.on_pot_change(callback, threshold=2, period=100, name="pot1")` and call `m.run_forever()`. A change callback receives the new integer percentage.

`m.pot_raw()` returns a 0–65535 scaled ADC reading, not 16-bit hardware resolution. `m.pot_voltage()` estimates wiper voltage using calibration and the configured supply; it is not a voltmeter.

**Electrical safety:** Pico ADC inputs are approximately 0–3.3V maximum. Never connect 5V/12V directly; a `supply` parameter cannot protect hardware. Use supported ADC GPIOs GP26/GP27/GP28 and verify wiring.

Host Python needs a version that includes Pot integration and a physical Runtime; the pure virtual backend is not supported.

[Pot API Reference](../reference/pot.md)
