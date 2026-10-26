# MangoLite Sound Sensor — API Reference

> Source candidate Runtime 0.6.5-rc2; MangoLite + Pico W / Pico 2 W; High-Level MicroPython. Source review, Windows validation and hardware acceptance remain separate. This page does not declare new Host Python support.

## Setup, units and mode

Enable `enabled_modules.sound_sensor` in DM. Set `sound_sensor_pin` to the actual analog AO input on ADC GPIO 26, 27 or 28, and check power and common ground. A sound sensor is separate from Buzzer/DFPlayer playback. Runtime uses peak-to-peak ADC amplitude in a sampling window with `sound_noise_floor`, `sound_reference_level` and related calibration to produce a relative 0–100 value. It is not calibrated dB or a regulatory sound-level measurement.

The Lite `on_sound_above` and `on_sound_below` methods **do not accept `period`**. The Change method below has its own period parameter. Use the selected family's exact signature.

## Methods, exact signatures and returns

| Signature | Behavior | Returns |
| --- | --- | --- |
| `m.sound_level()` | Request the current relative sound level | `int`, 0–100; also `0` when no current value was received |
| `m.on_sound_above(threshold, callback, hysteresis=5)` | Notify on an upward threshold crossing | `None` |
| `m.on_sound_below(threshold, callback, hysteresis=5)` | Notify on a downward threshold crossing | `None` |
| `m.on_sound_change(callback, threshold=5, period=100)` | Notify after sufficient change from the last delivered value | `None` |
| `m.stop_sound_change()` | Stop the Change watcher | `None` |

A `0` may mean a relatively quiet input or no received current reading; it does not prove sensor connectivity. These methods have no sensor-name argument. Stopping Change does not cancel existing above/below watchers.

## Parameters, callbacks and scheduling

| Parameter | Type, range and default |
| --- | --- |
| above/below `threshold` | Required; numeric conversion to a relative level from 0 to 100 |
| above/below `hysteresis` | Numeric conversion, 0–100; default 5 |
| above/below `callback` | Required callable; invoked as `callback()` |
| Change `callback` | Required callable; invoked as `callback(value)` |
| Change `threshold` | Finite `int/float`, greater than 0 and at most 100; default 5 relative percentage points |
| Change `period` | Integer milliseconds, 100–60000; default 100; booleans are rejected |

Change compares with the last delivered value and notifies once for the first valid observation. The Lite facade/Runtime handles the threshold watcher's sampling interval. Hardware settings such as `sound_window_ms` belong to DM/Runtime and are not above/below Student API keywords. Cooperative scheduling and sampling windows can delay notification; callbacks are not precision timestamps.

## Lifecycle, errors and diagnosis

A direct `sound_level()` call needs no persistent loop. Threshold registration starts a watcher; Change adds a Scheduler task. Keep servicing `run_once()` in the foreground or use `run_forever()` for subsequent callbacks. Record pending work inside callbacks and perform display/effect changes in the foreground. Never re-enter the Scheduler from a callback.

A disabled module raises `RuntimeError`. Invalid callback types, argument types and out-of-range threshold/hysteresis/Change period values are rejected. Passing `period=` to the Lite above/below methods raises `TypeError`. Diagnose profile/runtime, enablement and ADC GPIO, direct values, loop/threshold/calibration, then AO wiring, ground, power and the sensor.

## Complete minimal example: watch changes for ten seconds

```python
from mangobox import Mango
import time

m = Mango()
pending = None

def changed(value):
    global pending
    pending = value

try:
    if not m.config.get("enabled_modules", {}).get("sound_sensor", False):
        raise RuntimeError("Enable Sound Sensor in Device Manager")
    print("Configured ADC GPIO:", m.config.get("sound_sensor_pin"))
    m.on_sound_change(changed, threshold=5, period=100)
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < 10000:
        m.run_once()
        if pending is not None:
            value = pending
            pending = None
            print("relative sound, not dB:", value)
        time.sleep_ms(10)
finally:
    m.stop_sound_change()
    m.close()
```

Compare quiet input with a gentle clap at a reasonable distance. If the raw signal does not change, changing Python thresholds cannot repair wiring. Avoid per-poll logs and fabricated `@@MANGO_EVENT@@` records.

## Related reading and source

[Sound Guide](../../../../en/guides/sound.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md) · [Scheduler](../../../shared/en/reference/scheduler.md)

Source: [student_api.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api.py), [Change extension](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api_change_v1.py), [Change rules](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api_change_rules_v1.py).
