# Potentiometer API Reference

> **Host Python version notice:** This documents the API for a Host package that actually integrates Pot. The currently listed Host Python 0.4.6 profile does not advertise Pot support; do not assume existing MangoThonny builds include it. A physical Runtime is required; virtual Pot is unsupported.


| API | Meaning |
|---|---|
| `m.pot(name=None, invert=None)` | Calibrated 0–100 integer percentage |
| `m.pot_raw(name=None)` | Scaled ADC integer 0–65535 |
| `m.pot_voltage(name=None, supply=None)` | Estimated, non-inverted wiper voltage in V |
| `m.on_pot_change(callback, threshold=2, period=100, name=None, invert=None)` | Callback with current percent after at least threshold percentage points change |
| `m.on_pot_above(threshold, callback, hysteresis=2, period=100, name=None, invert=None)` | Zero-argument callback when rising across threshold |
| `m.on_pot_below(threshold, callback, hysteresis=2, period=100, name=None, invert=None)` | Zero-argument callback when falling across threshold |
| `m.stop_pot(name=None)` | Stop the named Pot watcher |

`name=None` uses the configured current Pot (normally `pot1`). `invert=None` uses the device profile; explicitly setting it overrides direction for percentages, not voltage. `supply=None` uses the configured supply (default 3.3V), only for voltage estimation. Change threshold must be 1–100; above/below thresholds and hysteresis 0–100. Watch periods are in ms with a 20ms minimum.

```python
from mangobox import Mango
m = Mango()
def changed(value):
    print(value)
m.on_pot_change(changed, threshold=3, name="pot1")
m.run_forever()
```

Use `m.supports("pot")` to check enabled Runtime configuration, not physical wiring health. Enable both the module and named Pot profile. A Host Python package must explicitly include the Pot Student API and connect to physical Runtime; virtual Pot is not implemented.

**Safety:** ADC input voltage must stay within approximately 0–3.3V. `supply=5` does not make 5V input safe.
