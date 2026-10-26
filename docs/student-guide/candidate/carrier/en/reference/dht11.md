# Carrier DHT11 API Reference

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## Availability

Candidate HLMP for MangoX2 Pico/Pico W/Pico 2 W and MangoLite Pico W/Pico 2 W. Wireless connectivity is not required. Correct DM setup and physical wiring remain necessary. Host 0.4.6 has no corresponding new facade.

## `dht_attach()`

```python
reader = m.dht_attach(pin=None, sensor=None, min_interval_ms=2000,
                      gpio_allowed=None)
```

| Parameter | Contract |
|---|---|
| `pin` | Required without an injected sensor; converted to int then checked in 0–28 |
| `sensor` | Advanced injected object providing measure()/temperature()/humidity() |
| `min_interval_ms` | Default 2000; must be at least 2000 ms |
| `gpio_allowed` | Optional callable validator; False rejects the pin |

Returns a `DHT11Reader`. Duplicate attachment raises `RuntimeError`; missing pin/sensor, range/interval or validator failure raises `ValueError`; invalid types can raise `TypeError`. The facade does not infer the saved DM pin or guarantee all cross-module checks without a supplied validator. Configure and check conflicts in DM first.

## `dht()`

```python
temperature, humidity = m.dht()
```

Returns `(float | None, float | None)` in °C and %RH. Missing attachment raises `RuntimeError`. Calls within the minimum interval return cached values; a due call attempts a new measurement. Driver/validation errors are recorded while retaining previous values, so always inspect status.

The source rejects values outside −20..80°C and 0..100%RH. These are plausibility checks, not a specification of sensor accuracy or guaranteed measurement range.

## `dht_status()`

```python
status = m.dht_status()
```

Before attachment returns `{"ok": False, "reason": "dht_not_attached"}`. After attachment contains `temperature/humidity/ok/last_error`. Values may be retained; ok requires a prior attempt without a most-recent error, and last_error is a string or None. Querying does not measure. There is no common sample timestamp field; record successful application read times if freshness matters.

## Events and Execution lifecycle

This facade does not expose on_dht/temp/humi/on_temperature_change/on_humidity_change. Register your own Scheduler task with an interval of at least 2000 ms and retain its ID. Update threshold state only for valid readings.

Direct reads are synchronous and throttled; scheduled monitoring needs run_once/run_forever. Do not re-enter the Scheduler from callbacks or clear all tasks to stop your own sample loop.

## Complete minimal example

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

[Guide and hysteresis example](../guides/dht11.md) · [BarePico comparison](../../../barepico/en/reference/dht11.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api_services.py`
- `runtime/common/peripherals/firmware_candidate/mb_dht11.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
