# Sound Sensor Guide

The sound sensor lets a project react to claps, taps, and changes in sound intensity.

`sound_level()` returns a relative value from 0 to 100. It is not calibrated dB.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.sound_level())
    time.sleep(0.2)
```

Clap near the sensor. The value should rise quickly.

`sound_level()` reads the current relative sound value directly, so this polling pattern does not require `m.run_forever()`.

## Event style

```python
from mangobox import Mango

m = Mango()

def loud():
    print("Loud!")
    m.led_all("red")

m.on_sound_above(60, loud)
m.run_forever()
```

`on_sound_above()` / `on_sound_below()` create threshold watchers. Later sampling and event decisions are Scheduler-driven, so event-style code must keep `m.run_forever()`. No separate `start_sensor()` call is required.

## If the value is fixed or always low

Check the current configuration:

```python
from mangobox import Mango

m = Mango()
print("Sound supported:", m.supports("sound_level"))
print("Sound sensor enabled:", m.config.get("enabled_modules", {}).get("sound_sensor"))
print("Sound ADC pin:", m.config.get("sound_sensor_pin"))
print("Window:", m.config.get("sound_window_ms"))
```

Recommended order:

```text
API support
→ module enablement
→ sound_sensor_pin
→ Device Manager configuration / calibration
→ minimal ADC raw test
→ physical AO / VCC / GND wiring
```

The current high-level value uses ADC peak-to-peak amplitude inside a sampling window, so a short clap can create a high peak.

If `sound_level()` changes but callbacks never fire, first confirm the event example reaches `m.run_forever()`, then inspect threshold, hysteresis, and sampling-window settings.

## High Level MicroPython: minimal ADC raw test

```python
from machine import ADC
from mangobox import Mango
import time

m = Mango()
pin_no = m.config.get("sound_sensor_pin")
adc = ADC(pin_no)

print("Sound raw ADC Pin = GP", pin_no)

while True:
    print(adc.read_u16())
    time.sleep(0.05)
```

Interpret the result:

- clapping/tapping changes the raw value but `sound_level()` is poor → inspect calibration, noise floor, reference level, or Runtime high-level processing.
- raw value barely changes → inspect AO wiring, ADC pin assignment, VCC/GND, and the sensor module itself.

Do not keep changing the high-level Python program when there is no raw physical signal.

> The current Hardware Lab focuses on firmware/execution-mode/Recovery/Clean-Flash lifecycle diagnostics; it is not a general ADC Sensor live-test tool.

## More

- [Sound Sensor API Reference](../reference/sound.md)
- [Device Manager](../tools/device-manager.md)
