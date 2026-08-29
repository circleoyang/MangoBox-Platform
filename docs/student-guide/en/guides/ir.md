# IR Remote Guide — High Level MicroPython

An IR Remote can control a MangoBox project with navigation keys, OK, number keys, `*` and `#`.

> This page applies only to High Level MicroPython. Current Host Python profiles do not expose a complete IR learner API, so the Host resolver hides this module.

## Check support

```python
from mangobox import Mango

m = Mango()
print(m.supports("ir"))
```

`True` means the selected target and Runtime version expose the IR Student API. It does not prove that an external receiver is wired correctly.

## Use OK to control the LEDs

```python
from mangobox import Mango

m = Mango()

def ok_pressed():
    print("OK pressed")
    m.led_all("#00ff00")

def ok_released():
    print("OK released")
    m.led_off()

m.on_ir_pressed("ok", ok_pressed)
m.on_ir_released("ok", ok_released)
m.run_forever()
```

`on_ir_pressed()` / `on_ir_released()` start the IR receive/update path, so there is no separate `start_button()`-style call. Decoding and release detection still depend on Scheduler updates, so `m.run_forever()` is required.

Do not use a one-shot `print(m.is_ir_pressed("ok"))` as a complete IR test. The decoder also needs event-loop updates.

## MangoLite and MangoX2 hardware differences

### MangoLite + Pico 2 W

The IR receiver is fixed onboard hardware on GP22. Learners normally do not enable a separate IR module or choose its Pin.

### MangoX2 + Pico / Pico 2 W

The IR receiver is optional external hardware. You must enable `ir_sensor`, set `ir_sensor_pin`, and connect Signal/OUT to that same GPIO/Pin.

The High Level MicroPython semantic IR path uses `ir_sensor_pin` on MangoX2 rather than the historical `ir_receiver_pin` source.

## If IR does not respond

### Step 1: check capability

```python
from mangobox import Mango

m = Mango()
print("IR supported =", m.supports("ir"))
```

### Step 2: check MangoX2 configuration

```python
from mangobox import Mango

m = Mango()
print("IR enabled =", m.config.get("enabled_modules", {}).get("ir_sensor"))
print("IR Pin =", m.config.get("ir_sensor_pin"))
```

If it reports `IR Pin = 4`, verify that physical Signal/OUT is connected to GP4.

### Step 3: Device Manager

For MangoX2, verify IR enablement, displayed Pin, and physical wiring. For MangoLite, the UI should identify the fixed onboard GP22 receiver.

### Step 4: minimal raw edge test

Do not run `on_ir_pressed()` at the same time as this diagnostic because both would try to own the same Pin IRQ.

```python
from machine import Pin
from mangobox import Mango
import time

m = Mango()
pin_no = m.config.get("ir_sensor_pin")
if pin_no is None:
    pin_no = 22

edges = 0

def changed(pin):
    global edges
    edges += 1

p = Pin(pin_no, Pin.IN)
p.irq(handler=changed,
      trigger=Pin.IRQ_RISING | Pin.IRQ_FALLING)

print("IR raw Pin = GP", pin_no)
last = 0
while True:
    time.sleep(1)
    now = edges
    print("edges / second =", now - last)
    last = now
```

- edge count increases when a key is pressed → the receiver is delivering pulses; investigate protocol/decoder/Student API next.
- edge count remains zero → inspect VCC, GND, Signal, receiver orientation, Pin, and the remote.

> Hardware Lab is for firmware, execution mode, Recovery, Clean Flash, and device-lifecycle diagnostics rather than general IR pulse analysis.

## Challenge

Use Up, Down, and OK to switch project states or LED colors.

See [IR Remote API Reference](../reference/ir.md).
