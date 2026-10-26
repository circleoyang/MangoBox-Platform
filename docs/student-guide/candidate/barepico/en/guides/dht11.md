# DHT11 guide for BarePico

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## 1. What can you build?

Attach DHT11 to a bare Pico, Pico W or Pico 2 W, read Celsius/%RH and update a project through periodic callbacks. BarePico does not assume a sensor exists or silently use GP17 as a universally available pin.

## 2. A 30-second quick test

Enable DHT11 and save the actual dht11_pin in Device Manager. Call dht() directly: the first read creates the driver. No attachment call or second machine.Pin owner is needed.

```python
from mangobox import Mango

m = Mango()
try:
    temperature, humidity = m.dht()
    print("Temperature:", temperature, "C")
    print("Humidity:", humidity, "%RH")
except OSError as error:
    print("DHT11 measurement failed:", error)
finally:
    m.close()
```

## 3. What should you observe?

The result is a two-float tuple `(temperature, humidity)` in °C and %RH. Checksum/timeouts propagate; missing configuration raises RuntimeError and pin conflicts may raise ValueError. Never replace a failed read with zero or synthetic room temperature.

Successful readings are cached for two seconds. temp()/humi() read through the same dht() path, so one tuple is normally enough to update both values.

## 4. Common use: periodic events and thresholds

on_dht is a periodic successful-sample callback, not a change-only event. It passes two arguments. Maintain application state for threshold actions; entering at 30°C and leaving at 28°C provides hysteresis.

## 5. Complete interactive example

```python
from mangobox import Mango
import time

m = Mango()
latest = None
alert = False

def measured(temperature, humidity):
    global latest
    latest = (temperature, humidity)

m.on_dht(measured, period=2500)
try:
    while True:
        m.run_once()
        if latest is not None:
            temperature, humidity = latest
            latest = None
            print("C:", temperature, "RH:", humidity)
            if not alert and temperature >= 30:
                alert = True
                print("Temperature alert")
            elif alert and temperature <= 28:
                alert = False
                print("Temperature back in range")
        time.sleep_ms(10)
finally:
    m.stop_dht()
    m.close()
```

The callback stores the latest sample. The main loop processes it after run_once returns. Coalescing to the latest value is appropriate for environment displays; use a bounded queue if every sample must be retained.

## 6. Family/mode notes and troubleshooting

Check the selected candidate target, DM dht11_sensor enablement, configured pin, conflicts and physical wiring. on_dht catches OSError/ValueError from a read, prints an error and skips that callback; missing callbacks do not mean zero temperature.

BarePico does not expose Carrier dht_status(). It also does not implement dht11(), on_temperature_change() or on_humidity_change(). Do not combine examples from different families. Host 0.4.6 is not this execution environment.

## 7. Small challenge

Track the interval between successful samples and show “no recent reading” after a long gap. Then pass only valid readings to OLED/voice output, distinguishing a retained old value from new data.

[BarePico DHT11 Reference](../reference/dht11.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/rc6f_recovered/mb_dht/dht11.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
