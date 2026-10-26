# Non-wireless Pico clock API Reference

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## Availability

Candidate HLMP for MangoX2 + Pico and BarePico + Pico. Both can accept trusted host timestamps; neither has the hardware required for Wi-Fi/NTP/BLE operations. Host 0.4.6 does not advertise these new facades.

## `enable_time_services()`

```python
m.enable_time_services(tz_minutes=480, max_age_s=86400, max_step_s=300)
```

Returns self and installs time services on the existing Scheduler without setting the date. tz_minutes: −720..840; max_age_s: 60..2,592,000; max_step_s: 0..86,400. Defaults are shown above. Some ranges are validated at first provider construction and raise ValueError. Installation has class-level state; repeated calls do not promise complete reconfiguration.

## `clock_status()`

```python
status = m.clock_status()
```

Returns a dict. Before enablement it includes valid=False, source=unsynced and reason. Managed fields include valid/source/sync_age_s/max_age_s/last_error/rtc_synced/rtc_status; extra base fields differ by family. The first query can lazily create a manager task without synchronizing time.

valid means provider-established time remains within its trust lifetime. rtc_status=verified is a separate RTC write/readback result. Other outcomes include not_synced/unavailable/invalid_clock_fields/readback_mismatch/write_failed. A plausible old date is not trusted time.

## `clock_sync_host()`

```python
status = m.clock_sync_host(utc_epoch, tz_minutes=480, force=False)
```

| Parameter | Type/range |
|---|---|
| utc_epoch | int, not bool; UTC Unix seconds in `[946684800, 4102444800)` |
| tz_minutes | int −720..840, default 480 |
| force | bool, default False; explicit acceptance of a large correction |

Returns the updated status dict. Missing service raises RuntimeError, invalid UTC/offset or excessive correction raises ValueError, and invalid force type raises TypeError. The caller must establish source trust; do not pass local wall-clock time as UTC or automatically bypass large-step protection.

## Dates and reminders

| Operation | MangoX2 Carrier | BarePico |
|---|---|---|
| Date/time | date()/time(); None if unsynchronized | Same names; RuntimeError if unsynchronized |
| Daily alarm | alarm(hhmm, cb, days=None) | alarm(when, callback, days=None) |
| Remove | alarm_remove(id) → bool | alarm_remove(ident) → bool |
| List | alarm_list() → list of IDs | alarm_list() → list of dict records |

Date/time strings are YYYY-MM-DD and HH:MM:SS. Alarms take HH:MM and days=None for every day or weekdays 1–7. Callbacks take no arguments; registration returns an integer ID. Shared examples check trust and pass time/callback positionally. now()/uptime() are not common to both families.

## Execution lifecycle

Keep the same Mango instance after synchronization. Alarms require the existing run_once/run_forever loop. Check validity before performing the action rather than assuming every base alarm cancels itself when trust expires. Remove only your alarm ID and never clear the entire Scheduler. These examples do not persist the clock or reminder configuration.

[Complete interactive example](../guides/clock.md). Do not invent clock_on_event from older proposals or generate wireless operations for this profile.

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/mb_timesync_rc6.py`
- `runtime/common/peripherals/firmware_candidate/mb_time.py`
- `runtime/common/peripherals/rc6f_recovered/mb_time/clock.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
