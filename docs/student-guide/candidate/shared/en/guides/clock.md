# Clock and NTP guide: synchronize, read and schedule reminders

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## 1. What can you build?

Use one Mango object to install time services, synchronize from a trusted host or NTP, read local date/time and schedule reminders. A plausible RTC date after reset is not proof of trusted time.

All eight candidate HLMP targets can accept trusted UTC Unix seconds. NTP requires one of the six W/2 W targets with an already connected STA. “Host synchronization” means that the device accepts trusted data; it does not claim that Host Python 0.4.6 implements the same facade.

## 2. A 30-second status check

```python
from mangobox import Mango

m = Mango()
try:
    m.enable_time_services()
    status = m.clock_status()
    print("valid:", status["valid"])
    print("source:", status["source"])
    print("NTP pending:", status["ntp_pending"])
finally:
    m.close()
```

## 3. What should you observe?

Before synchronization through this service, the normal state is `valid=False`, `source="unsynced"`. Enabling services does not connect Wi-Fi, start AP or copy the computer's time. Starting NTP is also distinct from completing synchronization.

Read `valid` for software-clock trust, `ntp_pending` for an outstanding query, `last_error` for a failure and `rtc_status` for the separate hardware RTC write/readback outcome. A valid software clock does not guarantee successful hardware RTC readback.

## 4. Common use: UTC input and local display

Taiwan UTC+8 uses `tz_minutes=480`. `clock_sync_host()` requires the current UTC Unix timestamp. Do not add eight hours to the timestamp or copy a fixed sample date as “now”. A non-wireless Pico can receive this data from a trusted management/host workflow.

Do not automatically use `force=True` to bypass a large time-step rejection. Check the source and offset before an explicit decision to replace trusted time.

## 5. Complete example: one NTP request over existing STA

Prerequisite: a connected STA established by this program or the management workflow. This example borrows an existing network without taking ownership. To connect within student code, first use the [bounded Wi-Fi example](wifi.md), then continue on the same `m` object.

```python
from mangobox import Mango
import time

m = Mango()
try:
    m.enable_time_services()
    wifi = m.wifi_status()
    if not wifi["supported"] or not wifi["connected"]:
        raise RuntimeError("Connect STA Wi-Fi before this NTP example")

    m.clock_sync_ntp(tz_minutes=480)
    started_at = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started_at) < 5000:
        m.run_once()
        status = m.clock_status()
        if not status["ntp_pending"]:
            break
        time.sleep_ms(20)

    status = m.clock_status()
    if (status["ntp_pending"] or not status["valid"]
            or status["source"] != "ntp" or status["last_error"]):
        raise RuntimeError("NTP did not confirm a new valid time")
    print("Local time:", m.date(), m.time())
    print("RTC:", status["rtc_status"])
finally:
    m.close()
```

DNS resolution and the send phase can briefly block; only reception is cooperative. Start NTP outside timing-critical callbacks. Checking `valid` alone could accept an older host synchronization, so this example also checks source and error state.

### Extension: a weekday reminder

After synchronization, keep the same Mango object open and add the following block before its final cleanup:

```python
pending = False

def due():
    global pending
    pending = True

alarm_id = m.alarm("18:00", due, days=(1, 2, 3, 4, 5))
try:
    while True:
        m.run_once()
        if pending:
            pending = False
            if m.clock_status()["valid"]:
                print("Reminder:", m.date(), m.time())
        time.sleep_ms(10)
finally:
    m.alarm_remove(alarm_id)
    m.close()
```

This is an extension, not a standalone boot program. Weekdays use Monday=1 through Sunday=7. The callback records a flag; the main loop handles display or complex actions. These are minute-based reminders, not hard real-time interrupts.

## 6. Execution and troubleshooting

Check clock status, then actual STA connectivity, NTP reachability, offset, `last_error` and `rtc_status`. Establish trusted time again after restart; RAM clock state and alarms are not persistent.

Carrier and BarePico have different base clocks: unsynchronized `date()/time()`, `alarm_list()` shapes and some keyword names differ. Shared examples check valid time first and pass the alarm time/callback positionally. See the Reference for exact differences.

Choose either `run_forever()` or a main loop calling `run_once()`. Never re-enter the Scheduler from a callback. Check trusted-time validity before performing a reminder action; do not assume every underlying alarm automatically cancels itself after trust expires.

## 7. Small challenge

Add an OLED or voice reminder while handling unsynchronized time explicitly. Validate the output module alone, then integrate it into the synchronized main loop.

[Clock API Reference](../reference/clock.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/mb_timesync_rc6.py`
- `runtime/common/peripherals/firmware_candidate/mb_time.py`
- `runtime/common/peripherals/rc6f_recovered/mb_time/clock.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
