# Clock, NTP and reminder API Reference

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## Availability and call order

All eight candidate HLMP targets share `enable_time_services/clock_status/clock_sync_host/clock_sync_ntp`. NTP operation requires one of the six wireless targets and an established STA connection. Host 0.4.6 does not advertise these new facades. Enable, synchronize, verify status, then use dates and reminders.

## `enable_time_services()`

```python
m.enable_time_services(tz_minutes=480, max_age_s=86400, max_step_s=300)
```

| Parameter | Type/default | Contract |
|---|---|---|
| `tz_minutes` | int / 480 | UTC offset −720..840 minutes; also pass the desired offset explicitly when synchronizing |
| `max_age_s` | int / 86400 | Trust lifetime, validated as 60..2,592,000 seconds |
| `max_step_s` | int / 300 | Maximum unforced correction after trusted synchronization, 0..86,400 seconds |

Returns `self`. Installs the provider on the existing Scheduler without synchronizing or enabling a network. Some values are validated when the provider is first instantiated; invalid ranges raise `ValueError`. Installation has class-level state: repeated calls are not a guarantee that all options have been reconfigured. Configure explicitly once at program startup.

## `clock_status()`

```python
status = m.clock_status()
```

Before enablement returns `valid=False`, `source="unsynced"`, `ntp_pending=False` and `reason`. After enablement, the first query lazily creates the manager and its Scheduler task, without writing RTC or connecting a network.

Common managed fields are `valid: bool`, `source: str`, `sync_age_s: int | None`, `max_age_s: int`, `ntp_pending: bool`, `last_error: str | None`, `rtc_synced: bool`, and `rtc_status: str`. Extra base-clock fields differ by family. RTC status values include `not_synced`, `verified`, `unavailable`, `invalid_clock_fields`, `readback_mismatch`, and `write_failed`.

`valid` means a trusted synchronization remains within its lifetime; it is not permanent. Directly changing the underlying clock through another API can invalidate that trust identity. `rtc_synced` separately requires a verified RTC write and a still-valid clock.

## `clock_sync_host()`

```python
status = m.clock_sync_host(utc_epoch, tz_minutes=480, force=False)
```

`utc_epoch` must be an integer UTC Unix timestamp in `[946684800, 4102444800)`, covering years 2000–2099; bool is rejected. `tz_minutes` is an integer −720..840. `force` must be bool, default False. Returns the resulting status dict; inspect both `valid` and the separate RTC result.

Invalid input or an excessive correction raises `ValueError`; invalid force type raises `TypeError`; missing service raises `RuntimeError`. The facade does not authenticate a remote sender: the caller must establish that the supplied timestamp is trustworthy. Do not silently bypass a large-step rejection.

## `clock_sync_ntp()`

```python
started = m.clock_sync_ntp(server="pool.ntp.org", tz_minutes=480)
```

`server` is a valid hostname of 1–253 characters with 1–63-character labels, none starting/ending in a hyphen. Offset rules are as above. Requires enabled services, wireless hardware, connected STA and no outstanding query. Returns `True` when the request starts, not when time is synchronized.

Reception runs cooperatively. Inspect `ntp_pending/valid/source/last_error`. DNS and the initial send may block; do not start this operation from a timing-critical callback. Invalid parameters raise `ValueError`; missing service/network prerequisites or a duplicate query raise `RuntimeError`; DNS/socket errors may propagate. This student facade does not expose a force option.

## Dates and reminders: family-specific signatures

| Operation | Carrier (X2/Lite) | BarePico |
|---|---|---|
| Date/time | `m.date()` / `m.time()`; None if unsynchronized | Same names; RuntimeError if unsynchronized |
| Daily alarm | `m.alarm(hhmm, cb, days=None)` | `m.alarm(when, callback, days=None)` |
| Dated reminder | `m.on_time(date_time, callback)` | `m.on_time(when, callback)` |
| Remove | `m.alarm_remove(id)` → bool | `m.alarm_remove(ident)` → bool |
| List | `m.alarm_list()` → list of IDs | `m.alarm_list()` → list of dict records |

After synchronization, date/time strings are `YYYY-MM-DD` and `HH:MM:SS`. Daily alarms take `HH:MM`; `days=None` means daily, or supply weekdays 1–7. Dated reminders take `YYYY-MM-DD HH:MM`. Registration returns an integer ID and callbacks take no arguments.

Carrier dated reminders may fire on the first later poll after their due time. BarePico matches the configured date/minute. Do not assume identical catch-up behavior after a long pause. Shared examples pass time and callback positionally and check trust first. `now()` and `uptime()` are BarePico base-clock additions, not shared Carrier methods.

## Execution lifecycle

Use one Mango object and its existing Scheduler. NTP reception and alarm callbacks require a running event loop; a long sleep delays them. Keep callbacks short and confirm validity before a complex reminder action. Remove your own alarm by ID rather than clearing the Scheduler. Clock and alarms are RAM state, not an automatically saved startup program or persistent schedule.

[Complete guide](../guides/clock.md) · [Wi-Fi](wifi.md) · [DFPlayer](dfplayer.md). `clock_on_event()` is a historical proposal name, not an installed facade in this snapshot.

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/mb_timesync_rc6.py`
- `runtime/common/peripherals/firmware_candidate/mb_time.py`
- `runtime/common/peripherals/rc6f_recovered/mb_time/clock.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
