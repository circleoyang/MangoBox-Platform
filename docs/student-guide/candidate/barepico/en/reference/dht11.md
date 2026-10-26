# BarePico DHT11 API Reference

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## Availability and setup

Candidate HLMP for BarePico Pico/Pico W/Pico 2 W. Requires enabled_modules.dht11_sensor=True, an integer dht11_pin and the existing GPIO conflict checks. Constructing Mango does not claim a DHT GPIO; the first read or registration creates the sensor. Host 0.4.6 does not advertise this facade.

## `dht()`, `temp()` and `humi()`

```python
temperature, humidity = m.dht()
```

dht returns `(float, float)`, Celsius then %RH. temp and humi select the respective component through the same cached read. Successful samples are cached for at least 2000 ms.

Missing configuration raises RuntimeError, GPIO conflicts ValueError, and driver failures propagate, commonly OSError. The source rejects implausible values outside −40..80°C and 0..100%RH; those checks are not guaranteed sensor accuracy/range specifications.

## `on_dht()`

```python
task_id = m.on_dht(callback, period=2000)
```

callback must be callable as `(temperature, humidity)`. period is milliseconds, converted to int and required to be at least 2000. Returns a Scheduler task ID. Registration first stops the previous DHT watcher; it does not create multiple independent on_dht subscriptions.

Invalid callback raises TypeError and a short period raises ValueError. OSError/ValueError during a scheduled measurement are reported and that callback is skipped. This is a periodic sample event, not change detection. Keep callbacks short and defer complex actions.

## `stop_dht()`

```python
removed = m.stop_dht()
```

Returns True when its watcher was removed, False if no watcher existed. It neither clears the shared Scheduler nor promises to destroy the sensor. Direct dht reads remain possible afterward.

## `dht_attach()`: retained advanced interface

```python
m.dht_attach(pin=None)
```

Returns self. With no pin, validates DM configuration; ordinary student programs do not need it. An explicit integer pin is checked for GPIO/DFPlayer conflicts and changes the current in-memory DHT configuration without persisting Flash. This is not the Carrier sensor/min_interval/gpio_allowed signature.

An already used sensor raises RuntimeError, a non-integer GPIO TypeError, and a conflict ValueError. Do not use it as a routine way to bypass DM configuration.

## Execution lifecycle and logging

Direct reads are synchronous; on_dht requires run_once/run_forever. A new hardware sample may emit the existing sensor_event; cached reads do not each emit another sample event. Student code should not fabricate markers or IDs. Existing event_logging controls remain applicable.

## Complete minimal example

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

[Events and thresholds](../guides/dht11.md) · [Carrier comparison](../../../carrier/en/reference/dht11.md). BarePico does not expose dht_status(); do not copy the Carrier failure-handling path.

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/rc6f_recovered/mb_dht/dht11.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
