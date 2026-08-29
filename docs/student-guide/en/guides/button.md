# Button Guide — High Level MicroPython

A Button can be used in two ways: read its current state, or react to pressed/released events.

> This page applies only to High Level MicroPython. Use the Host-specific documentation for Host Python.

## Read the current state

```python
from mangobox import Mango

m = Mango()
print(m.read_button())
```

Typical values:

```text
0 = released
1 = pressed
```

This is a direct read, so it does not require `m.run_forever()`.

## React to button events

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("Button pressed")
    m.led_all("#ffff00")

def released():
    print("Button released")
    m.led_off()

m.on_pressed("button", pressed)
m.on_released("button", released)
m.start_button(100)
m.run_forever()
```

Two steps are required:

1. `m.start_button(100)` starts periodic Button sampling.
2. `m.run_forever()` keeps the device event loop active so state changes can be detected and callbacks can run.

Calling `on_pressed()` / `on_released()` only registers callbacks. In the current High Level MicroPython API, those calls do not automatically start Button monitoring.

## If the button does not respond

### Step 1: check capability

```python
from mangobox import Mango

m = Mango()
print("Button supported =", m.supports("button"))
```

### Step 2: check configuration

```python
from mangobox import Mango

m = Mango()
print("Button enabled =", m.config.get("enabled_modules", {}).get("button"))
print("Button Pin =", m.config.get("button_pin"))
```

For an external button also check the configured Pin, pull-up/pull-down mode, and active level.

### Step 3: minimal Student API polling test

```python
from mangobox import Mango
import time

m = Mango()

while True:
    print(m.read_button())
    time.sleep(0.2)
```

If the value changes between `0` and `1`, the high-level read path is probably healthy. Then check `start_button()`, callback registration, and the event loop.

### Step 4: Device Manager

Check Button enablement, GPIO/Pin, pull/active settings, and Live Read/Monitor when supported.

### Step 5: minimal raw digital test

```python
from machine import Pin
from mangobox import Mango
import time

m = Mango()
pin_no = m.config.get("button_pin")
p = Pin(pin_no, Pin.IN)

print("Button raw Pin = GP", pin_no)

while True:
    print(p.value())
    time.sleep(0.2)
```

- raw value changes → inspect Runtime settings, active level, `start_button()`, and the event loop.
- raw value never changes → inspect Signal, ground, power, wiring, and Pin assignment.

> Hardware Lab is for firmware, execution mode, Recovery, Clean Flash, and device-lifecycle diagnostics rather than ordinary digital-input testing.

## Challenge

Press the Button to turn the LEDs yellow, and release it to turn them off.

See [Button API Reference](../reference/button.md).
