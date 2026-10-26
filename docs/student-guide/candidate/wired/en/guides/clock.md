# Time synchronization and reminders on non-wireless Pico

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## 1. What can you build?

MangoX2 + Pico and BarePico + Pico have no built-in Wi-Fi/BLE, but can receive a trusted computer's UTC Unix timestamp, establish time for the current program and schedule reminders. This is the complete learner path for those two non-wireless candidate HLMP profiles.

## 2. A 30-second status test

```python
from mangobox import Mango

m = Mango()
try:
    m.enable_time_services()
    status = m.clock_status()
    print("valid:", status["valid"])
    print("source:", status["source"])
finally:
    m.close()
```

## 3. What should you observe?

Before synchronization through this provider, valid is normally False and source is unsynced. Enabling services does not automatically copy computer time. This state does not require adding Wi-Fi to the Pico.

## 4. Common use: a host-supplied UTC timestamp

Obtain the current Unix timestamp from a correctly timed computer and supply it promptly. It must be UTC seconds, not local display time with another eight hours added. An unsynchronized Pico time.time() is not a trusted host source. Taiwan display uses tz_minutes=480.

Interactive input demonstrates the existing API; it does not compensate for typing/transport delay. It is suitable for classroom observations and minute reminders, not precision time distribution. A real application can use the existing trusted DM/management workflow.

## 5. Complete interactive example

```python
from mangobox import Mango
import time

m = Mango()
m.enable_time_services()
pending = False
alarm_id = None

def due():
    global pending
    pending = True

try:
    utc_epoch = int(input("Paste current UTC Unix seconds from a trusted computer: "))
    status = m.clock_sync_host(utc_epoch, tz_minutes=480)
    if not status["valid"]:
        raise RuntimeError("Trusted clock is not valid")
    print("Local time:", m.date(), m.time())
    print("RTC:", status["rtc_status"])

    alarm_time = input("Reminder time HH:MM (local time): ")
    alarm_id = m.alarm(alarm_time, due)
    while True:
        m.run_once()
        if pending:
            pending = False
            if m.clock_status()["valid"]:
                print("Reminder:", m.date(), m.time())
            else:
                print("Reminder skipped: trusted time has expired")
        time.sleep_ms(10)
finally:
    if alarm_id is not None:
        m.alarm_remove(alarm_id)
    m.close()
```

Enter a local HH:MM time a minute or two ahead. The callback sets a flag; the main loop checks continuing validity before printing. Cleanup removes only its own reminder.

## 6. Target/mode notes and troubleshooting

Check status, UTC input, offset and rtc_status. Software validity and hardware RTC readback are separate outcomes. A plausible date is not proof of verified RTC writes.

An excessive correction after trusted synchronization is rejected. Check the source instead of automatically retrying with force=True. Re-establish time and alarms after restarting. This is a Pico HLMP API, not a new Host 0.4.6 facade.

Family-specific alarm_list results and unsynchronized read behavior differ. Shared code verifies validity and passes alarm time/callback positionally. Never generate Wi-Fi, NTP or BLE operations for non-wireless Pico.

## 7. Small challenge

Restrict a daily reminder to weekdays, then add independently validated OLED/voice output. When trust is absent, show “synchronize time first” instead of speaking stale time.

[Non-wireless clock Reference](../reference/clock.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/mb_timesync_rc6.py`
- `runtime/common/peripherals/firmware_candidate/mb_time.py`
- `runtime/common/peripherals/rc6f_recovered/mb_time/clock.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
