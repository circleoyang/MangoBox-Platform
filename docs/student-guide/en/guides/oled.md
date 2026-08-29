# OLED Display Guide

Use the OLED for text, status messages, and sensor values.

> Show this page only when the selected hardware, programming mode, and software version support OLED.

## 30-second test

### High Level MicroPython

```python
from mangobox import Mango

m = Mango()
m.clear_oled()
m.text("Hello MangoBox", 0, 0)
m.run_forever()
```

On the current MangoLite + Pico 2 W Runtime, static OLED commands first enter the system queue. The device event loop must keep running before the queued command is processed and rendered. `m.run_forever()` keeps that event loop active.

Current MangoX2 static text is immediate, but this Guide temporarily uses one cross-hardware example so the same learner program does not appear to work on MangoX2 and fail silently on MangoLite.

> A future Runtime update will align MangoLite `clear_oled()` and `text()` with MangoX2 immediate semantics. Until that change is built and hardware-validated, keep `m.run_forever()` in this quick test.

## Common API

```python
m.clear_oled()
m.text(text, x=0, y=0, size=1)
m.flash_text(text, x=0, y=0, size=1, period=500, duration=0)
```

`flash_text()` is a continuous effect and requires the event loop:

```python
from mangobox import Mango

m = Mango()
m.flash_text("READY", 0, 0, period=500)
m.run_forever()
```

## If nothing appears

Check the current configuration first:

```python
from mangobox import Mango

m = Mango()
print("OLED supported:", m.supports("oled"))
print("OLED enabled:", m.config.get("enabled_modules", {}).get("oled"))
print("I2C ID:", m.config.get("oled_i2c_id"))
print("SDA pin:", m.config.get("oled_sda_pin"))
print("SCL pin:", m.config.get("oled_scl_pin"))
print("I2C address:", m.config.get("oled_addr"))
```

Recommended order:

```text
API support
→ module enablement
→ SDA / SCL pins
→ I2C address
→ High Level MicroPython event loop is running
→ Device Manager
→ minimal I2C scan
→ physical VCC / GND / SDA / SCL wiring
```

For an external OLED, verify:

```text
VCC
GND
SDA → oled_sda_pin
SCL → oled_scl_pin
```

### High Level MicroPython: minimal I2C scan

```python
from machine import I2C, Pin
from mangobox import Mango

m = Mango()

bus = int(m.config.get("oled_i2c_id"))
sda = int(m.config.get("oled_sda_pin"))
scl = int(m.config.get("oled_scl_pin"))

i2c = I2C(bus, sda=Pin(sda), scl=Pin(scl))
found = i2c.scan()

print("I2C devices =", found)
print("hex =", [hex(x) for x in found])
```

If the configured OLED address is `0x3C`, a healthy bus normally shows `0x3c` in the scan result.

- device is found but `m.text()` still shows nothing → on current MangoLite first confirm the example reaches `m.run_forever()`, then investigate Runtime/OLED driver/configuration.
- nothing is found → inspect VCC, GND, SDA, SCL, pin assignment, and I2C address.

> The current Hardware Lab is not a general I2C scanner. Use it for firmware/execution-mode/Recovery/Clean-Flash lifecycle problems.

## Challenge

Display:

```text
MangoBox
Ready!
```

After writing both lines, keep the High Level MicroPython event loop running.

## More

- [OLED API Reference](../reference/oled.md)
- [Device Manager](../tools/device-manager.md)
