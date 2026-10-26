# MangoLite Light Sensor — API Reference

> Source candidate Runtime 0.6.5-rc2; MangoLite + Pico W / Pico 2 W; High-Level MicroPython. Source review does not establish a public stable release or physical-device acceptance.

## Setup, mode and units

Enable `enabled_modules.light_sensor` in Device Manager (DM). Verify that `light_sensor_pin` matches the actual ADC connection on GPIO 26, 27 or 28 without a pin conflict. Runtime calibration maps the reading to 0–100: 0 is the relative dark end and 100 the relative bright end. This is not lux. Maintain `light_raw_dark`, `light_raw_bright` and related calibration through DM/Runtime.

The MangoLite above/below methods accept only three parameters: **they do not accept `period`**. The Change callback has its own `period` parameter; do not transfer that argument to above/below. These signatures do not replace another target's or Host Python's contract.

## Methods, exact signatures and returns

| Signature | Behavior | Returns |
| --- | --- | --- |
| `m.light()` | Request the current calibrated reading | `int`, 0–100; also `0` when no current reading was received |
| `m.on_light_above(threshold, callback, hysteresis=5)` | Notify on an upward threshold crossing | `None` |
| `m.on_light_below(threshold, callback, hysteresis=5)` | Notify on a downward threshold crossing | `None` |
| `m.on_light_change(callback, threshold=2, period=100)` | Notify after sufficient change from the last delivered value | `None` |
| `m.stop_light_change()` | Stop the Change watcher | `None` |

A `0` reading alone proves neither darkness nor a healthy sensor connection. The Change watcher has no named-sensor argument. Stopping it does not cancel existing above/below threshold watchers.

## Parameters and callbacks

| Parameter | Type, range and default |
| --- | --- |
| above/below `threshold` | Required; numeric conversion to a relative level from 0 to 100 |
| above/below `hysteresis` | Numeric conversion, 0–100; default 5, reducing repeated triggers near a threshold |
| above/below `callback` | Required callable; invoked as `callback()` |
| Change `callback` | Required callable; invoked as `callback(value)` |
| Change `threshold` | Finite `int/float`, greater than 0 and at most 100; default 2 relative percentage points |
| Change `period` | Integer milliseconds, 50–60000; default 100; booleans are rejected |

Change compares with the last value actually delivered to the callback and delivers the first valid observation once. Scheduling is cooperative; the requested period is not a real-time guarantee. Threshold callbacks and Change callbacks take different numbers of arguments.

## Lifecycle and errors

A single `light()` request does not need a persistent event loop. Threshold registration starts its watcher; Change registration adds its own Scheduler task. Service `m.run_once()` in the foreground or use `m.run_forever()` to receive subsequent callbacks. Keep callbacks short; record pending work for the foreground. Never re-enter `run_once()` from a callback.

A disabled module raises `RuntimeError`. A non-callable callback raises `TypeError`; invalid threshold, hysteresis or Change period values are rejected. Passing `period=` to the Lite above/below methods raises `TypeError`. Diagnose target/runtime, enablement and GPIO, direct reading, loop/threshold settings, then power, wiring and the sensor.

## Complete minimal example: display changes only

```python
from mangobox import Mango
import time

m = Mango()
pending = None

def changed(value):
    global pending
    pending = value

try:
    if not m.config.get("enabled_modules", {}).get("light_sensor", False):
        raise RuntimeError("Enable Light Sensor in Device Manager")
    print("Configured ADC GPIO:", m.config.get("light_sensor_pin"))
    m.on_light_change(changed, threshold=2, period=100)
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < 10000:
        m.run_once()
        if pending is not None:
            value = pending
            pending = None
            print("relative light:", value)
        time.sleep_ms(10)
finally:
    m.stop_light_change()
    m.close()
```

The foreground should display the initial valid observation, then changes of at least two relative points. Avoid per-poll logging and fabricated `@@MANGO_EVENT@@` records.

## Related reading and source

[Light Guide](../../../../en/guides/light.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md) · [Scheduler](../../../shared/en/reference/scheduler.md)

Source: [student_api.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api.py), [student_api_change_v1.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api_change_v1.py), [Change rules](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api_change_rules_v1.py).
