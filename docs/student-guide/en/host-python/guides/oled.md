# OLED Display — Host Python Guide

Host Python prepares font data on the computer and sends OLED commands to the MangoBox Runtime.

## 30-second test

```python
from mangobox import Mango

m = Mango()
m.clear_oled()
m.text("Hello MangoBox", 0, 0)
```

The Host OLED path differs from High Level MicroPython. Host 0.4.6 can upload required glyphs and uses deferred rendering to combine text updates before sending the final render.

Do **not** copy the current MangoLite device-side `m.run_forever()` rule into Host Python. Static `clear_oled()` / `text()` do not require the Host event loop to become visible.

## Multi-line text

```python
m.clear_oled()
m.text("MangoBox\nReady!", 0, 0)
```

## Flashing text

```python
m.flash_text("READY", 0, 0, period=500)
```

The command is sent to the Runtime and later flashing is handled there; the Host does not need `m.run_forever()` to animate it.

## If nothing appears

Check `m.supports("oled")`, then inspect OLED enablement, I2C bus, SDA/SCL pins, and address in Device Manager. For external displays, verify VCC/GND/SDA/SCL.

Do not use PC-side `machine.I2C`; `machine` belongs to MicroPython on the device.

See [Host Python OLED API Reference](../reference/oled.md).
