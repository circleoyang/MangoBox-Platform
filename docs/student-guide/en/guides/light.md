# Light sensor guide

The light sensor lets a project react to brighter or darker surroundings. The high-level API returns a calibrated relative value from 0 to 100 instead of raw ADC values.

> `0` is the darker calibrated end and `100` is the brighter end. It is not lux.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.light())
    time.sleep(0.5)
```

Cover and uncover the sensor. The value should change clearly.

`m.light()` reads the current value directly, so this polling pattern does not require `m.run_forever()`.

## Event style

```python
from mangobox import Mango

m = Mango()

def dark():
    print("It became dark")
    m.led_all("blue")

m.on_light_below(30, dark)
m.run_forever()
```

`on_light_above()` / `on_light_below()` create threshold watchers. Later sampling and threshold-crossing checks are Scheduler-driven, so event-style code must keep `m.run_forever()`. No separate `start_sensor()` call is required.

## If the value does not change

```python
from mangobox import Mango

m = Mango()
print("Light supported:", m.supports("light"))
print("Light sensor enabled:", m.config.get("enabled_modules", {}).get("light_sensor"))
print("Light ADC pin:", m.config.get("light_sensor_pin"))
```

Check that `light_sensor_pin` is ADC-capable and that the module AO wire is really connected to that pin.

If direct `m.light()` values change but callbacks never fire, first confirm the event example reaches `m.run_forever()`, then inspect the threshold and hysteresis settings.

## ADC diagnostic

```python
from machine import ADC
from mangobox import Mango
import time

m = Mango()
pin_no = m.config.get("light_sensor_pin")
adc = ADC(pin_no)

while True:
    print("GP", pin_no, "raw =", adc.read_u16())
    time.sleep(0.2)
```

If raw values change but `m.light()` is unreasonable, check calibration. If raw values barely change, check wiring and the module.

## More

- [Light Sensor API Reference](../reference/light.md)
- [Device Manager](../tools/device-manager.md)
- [Hardware Lab](../tools/hardware-lab.md)
