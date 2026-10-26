# DHT11: select the correct family guide and reference

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

DHT11 reports Celsius temperature and relative humidity. Both families return `(temperature, humidity)` from `dht()`, but setup, failures and event APIs differ. Select the complete family-specific learner path.

| Family | Setup | Failure | Events |
|---|---|---|---|
| MangoX2/MangoLite | Read configured pin, explicitly attach | Old values or None; inspect dht_status | A student-owned Scheduler task |
| BarePico | Enable/configure in DM, then read | Driver exception propagates | on_dht(callback, period) |

Units are °C and %RH. Hardware sampling is limited to intervals of at least 2000 ms; faster calls can return cached data. This is not a continuous high-rate stream.

## Continue for your target

- [MangoX2/MangoLite guide](../../../carrier/en/guides/dht11.md) · [Reference](../../../carrier/en/reference/dht11.md)
- [BarePico guide](../../../barepico/en/guides/dht11.md) · [Reference](../../../barepico/en/reference/dht11.md)

Each guide includes a complete quick test, observable results, an interactive threshold example, troubleshooting and a challenge. This entry page does not mix executable family-specific examples. Host 0.4.6 has no corresponding new facade. `dht11()`, `on_temperature_change()` and `on_humidity_change()` are not implemented public methods in this snapshot. Do not invent them.

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api_services.py`
- `runtime/common/peripherals/firmware_candidate/mb_dht11.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/rc6f_recovered/mb_dht/dht11.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
