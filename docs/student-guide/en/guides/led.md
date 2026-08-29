# RGB LED Guide — High Level MicroPython

RGB LEDs can show colors, indicate program state, and create effects such as breathing and rainbow animations.

> This page applies only to High Level MicroPython. Use the Host-specific documentation for Host Python.

## 30-second test

```python
from mangobox import Mango

m = Mango()
m.led_all("#0088ff")
```

The onboard LEDs should turn blue. This is an immediate output and does not require `m.run_forever()`.

## Common controls

### Immediate controls

```python
m.led_all("red")
m.led(0, "#00ff00")
m.led_range(0, 3, "blue")
m.brightness(30)
m.led_off()
```

These calls write the LED state immediately and do not need `m.run_forever()` just to perform that one output.

### Continuous effects

```python
from mangobox import Mango

m = Mango()
m.rainbow()
m.run_forever()
```

or:

```python
from mangobox import Mango

m = Mango()
m.breath("#0088ff")
m.run_forever()
```

`rainbow()`, `breath()`, meteor, color wipe, sparkle, and fire-flicker effects require the Runtime Scheduler to keep updating, so High Level MicroPython must keep the event loop running.

A static LED API with `duration > 0` also schedules a later restore:

```python
from mangobox import Mango

m = Mango()
m.led_all("red", duration=1000)
m.run_forever()
```

## If the LEDs do not light

### Step 1: check capability

```python
from mangobox import Mango

m = Mango()
print("LED supported =", m.supports("led"))
```

### Step 2: check device configuration

```python
from mangobox import Mango

m = Mango()
print("LED enabled =", m.config.get("enabled_modules", {}).get("led_strip"))
print("LED Pin =", m.config.get("led_strip_pin"))
print("LED count =", m.config.get("led_strip_leds"))
```

### Step 3: if static output works but effects do not move

Confirm that the program reaches:

```python
m.run_forever()
```

That symptom usually means the effect task exists but the Scheduler is no longer being serviced, rather than a GPIO wiring failure.

### Step 4: Device Manager

Check target identity, LED module enablement, GPIO/Pin, LED count, and strip selection.

### Step 5: physical check

```text
VCC / available power
GND / common ground
DIN → led_strip_pin
DIN / DOUT direction
configured LED count
```

> Hardware Lab is for firmware, execution mode, Recovery, Clean Flash, and device-lifecycle problems rather than ordinary LED/GPIO signal testing.

## Challenge

Show red, green, and blue in sequence, then turn the LEDs off.

See [RGB LED API Reference](../reference/led.md).
