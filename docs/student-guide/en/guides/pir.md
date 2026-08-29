# PIR Motion Sensor Guide

A PIR (Passive Infrared) sensor reports whether motion from a person or another changing heat source is detected.

> Show this page only when the resolver confirms the `motion` capability. A `pir_sensor_pin` key alone is not enough to claim API support.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.is_motion_detected())
    time.sleep(0.2)
```

`is_motion_detected()` is a direct current-state read. This polling pattern does not require `m.run_forever()`.

## Event style

```python
from mangobox import Mango

m = Mango()

def detected():
    print("Motion detected")
    m.led_all("red")

def cleared():
    print("Motion cleared")
    m.led_off()

m.on_motion_detected(detected)
m.on_motion_cleared(cleared)
m.run_forever()
```

`on_motion_detected()` / `on_motion_cleared()` start the PIR watcher, but later updates are still Scheduler-driven. Event-style code therefore requires `m.run_forever()`. Unlike Button callbacks, there is no separate `start_button()`-style call here.

## If it is always False

Check the current configuration:

```python
from mangobox import Mango

m = Mango()
print("PIR supported:", m.supports("motion"))
print("PIR enabled:", m.config.get("enabled_modules", {}).get("pir_sensor"))
print("PIR pin:", m.config.get("pir_sensor_pin"))
```

Recommended order:

```text
API support
→ module enablement
→ pir_sensor_pin
→ Device Manager config / Live Read (when supported)
→ minimal raw digital test
→ physical Signal / VCC / GND
```

## High Level MicroPython raw digital test

```python
from machine import Pin
from mangobox import Mango
import time

m = Mango()
pin_no = m.config.get("pir_sensor_pin")
p = Pin(pin_no, Pin.IN)

print("PIR raw Pin = GP", pin_no)

while True:
    print(p.value())
    time.sleep(0.2)
```

Interpret the result:

- raw value changes between 0 and 1 but the high-level API never changes → inspect Runtime/Student API/event-loop behavior and confirm the callback example reaches `m.run_forever()`.
- raw value never changes → inspect Signal, pin assignment, VCC, GND, sensor orientation, and the PIR module itself.

A PIR module may need a short stabilization period after power-up, so do not mark it failed immediately after power is applied.

> The current Hardware Lab focuses on firmware/execution-mode/Recovery/Clean-Flash lifecycle diagnostics; it is not a general PIR digital-input tester.

## More

- [PIR API Reference](../reference/pir.md)
- [Device Manager](../tools/device-manager.md)
