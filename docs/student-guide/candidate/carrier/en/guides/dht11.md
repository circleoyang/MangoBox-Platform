# DHT11 guide for MangoX2 and MangoLite

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## 1. What can you build?

Read Celsius temperature and relative humidity, observe a room, implement thresholds or pass valid readings to OLED/voice output. This guide covers the five Carrier candidate HLMP targets and does not require Wi-Fi.

## 2. A 30-second quick test

Enable DHT11 in Device Manager, assign its real DATA GPIO and resolve pin conflicts. Read that setting and attach exactly once. Do not assume an example pin such as GP17 is free on every device.

```python
from mangobox import Mango

m = Mango()
enabled = m.config.get("enabled_modules", {})
pin = m.config.get("dht11_pin")
if not enabled.get("dht11_sensor", False) or type(pin) is not int:
    raise RuntimeError("Configure and enable DHT11 in Device Manager")
m.dht_attach(pin=pin)
try:
    temperature, humidity = m.dht()
    status = m.dht_status()
    if status["ok"]:
        print("Temperature:", temperature, "C")
        print("Humidity:", humidity, "%RH")
    else:
        print("No fresh valid reading:", status["last_error"])
finally:
    m.close()
```

## 3. What should you observe?

`dht()` returns a tuple in the order Celsius, %RH, not a dict. Always inspect `dht_status()["ok"]`. The first failed sample can be `(None, None)`; a later failure can retain the previous successful values. An old numeric value is not a new successful measurement.

The reader samples at most once every two seconds. Repeated calls inside that interval return cached data. A single reading is not enough to diagnose small environmental changes or interference.

## 4. Common use: thresholds and hysteresis

For observation, sample about every 2.5 seconds. For an alert, enter the alert state at 30°C and leave it at 28°C. The gap is hysteresis; it avoids repeated alerts when readings fluctuate near one threshold.

## 5. Complete interactive example

```python
from mangobox import Mango

m = Mango()
enabled = m.config.get("enabled_modules", {})
pin = m.config.get("dht11_pin")
if not enabled.get("dht11_sensor", False) or type(pin) is not int:
    raise RuntimeError("Configure and enable DHT11 in Device Manager")
m.dht_attach(pin=pin)
alert = False

def sample():
    global alert
    temperature, humidity = m.dht()
    if not m.dht_status()["ok"]:
        print("DHT11 read failed; keep the previous alert state")
        return
    print("C:", temperature, "RH:", humidity)
    if not alert and temperature >= 30:
        alert = True
        print("Temperature alert")
    elif alert and temperature <= 28:
        alert = False
        print("Temperature back in range")

task_id = m.scheduler.add_task(sample, period=2500)
try:
    m.run_forever()
finally:
    m.scheduler.remove_task(task_id)
    m.close()
```

This is a student-owned Scheduler task, not an invented `on_temperature_change()` method. Keep it to one bounded read and simple decisions. Defer complex multi-module actions to the main loop after `run_once()` returns. Remove only your task ID on exit; never clear the shared Scheduler.

## 6. Family/mode notes and troubleshooting

Check the selected candidate profile and method first, then DM enablement, dht11_pin, real DATA wiring, ground and power. Resolve conflicts through DM instead of creating a second Pin/DHT owner. Inspect last_error rather than replacing failed readings with zero or synthetic room temperature.

Carrier dht_attach does not automatically select the DM pin; the example explicitly reads it. BarePico on_dht/temp/humi are not part of this Carrier facade. Host 0.4.6 cannot run this device-side example.

## 7. Small challenge

Add a humidity alert with independent state. Use one dht() call for both readings, then pass validated data to OLED or DFPlayer.

[DHT11 Reference](../reference/dht11.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api_services.py`
- `runtime/common/peripherals/firmware_candidate/mb_dht11.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
