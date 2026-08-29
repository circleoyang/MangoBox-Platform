# RGB LED — Host Python Guide

This page applies only to **Host Python**. Python runs on the computer and sends commands to the MangoBox Runtime.

## 30-second test

```python
from mangobox import Mango

m = Mango()
m.led_all("#0088ff")
```

The LEDs should turn blue immediately. Host Python does not need `m.run_forever()` to drive the Runtime LED Scheduler.

## Continuous effects

```python
from mangobox import Mango

m = Mango()
m.rainbow()
```

`rainbow()`, `breath()`, and related methods send an effect command to the Runtime. The Runtime performs later animation updates.

> In Host Python, `m.run_forever()` mainly keeps the PC process alive for incoming sensor events. It is not the LED animation engine.

## Common API

```python
m.led_all("red")
m.led(0, "#00ff00")
m.led_range(0, 3, "blue")
m.brightness(30)
m.rainbow()
m.breath("#0088ff")
m.led_off()
```

## If the LEDs do not respond

```python
from mangobox import Mango

m = Mango()
print(m.supports("led"))
print(m.capabilities())
```

Then check:

```text
Host ↔ Runtime connection
→ LED enabled in Device Manager
→ pin / LED count configuration
→ physical VCC / GND / DIN
→ Host 0.4.6 and Runtime compatibility
```

Do not use device-side `machine.Pin` or assume `m.config` is the normal Host learner diagnostic path. Use Device Manager and the Runtime configuration snapshot obtained during Host startup.

## Challenge

```python
from mangobox import Mango
import time

m = Mango()

for color in ("red", "green", "blue"):
    m.led_all(color)
    time.sleep(1)

m.led_off()
```

See [Host Python RGB LED API Reference](../reference/led.md).
