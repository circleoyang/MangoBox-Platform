# BarePico Named RGB strips — API Reference

> Source candidate: v0.1.0-rc6; BarePico Pico / Pico W / Pico 2 W; High-Level MicroPython. Source review does not claim Windows or physical-device acceptance in this update.

## Setup, targets and mode

Enable `enabled_modules.led_strip` in DM and configure a named, enabled external strip under `led_strips`, including its actual `pin`, `leds` and `power`. `leds` is 1–256 and `power` is 0–100. An explicit `strip` is a configured name. Omission resolves the selected name, `current_led_setting`, or the only enabled strip. Multiple strips without a valid selection fail; there is no carrier RGB pin fallback.

## Methods, exact signatures and returns

Defaults are exactly those in the signatures below. Import with `from mangobox import Mango` and construct `m = Mango()`.

| Signature | Meaning | Returns |
| --- | --- | --- |
| `m.breath(color='#ff00ff', period=50, duration=0, strip=None)` | Start a single-color breathing effect. | `None` |
| `m.brightness(power=30, duration=0, strip=None)` | Set brightness percentage. | `None` |
| `m.led(index, color='#ffffff', duration=0, strip=None)` | Set one pixel. | `None` |
| `m.led_all(color='#ffffff', duration=0, strip=None)` | Set the entire strip to one color. | `None` |
| `m.led_clear(strip=None)` | Cancel all effect/restore tasks for this strip and clear pixels. | `None` |
| `m.led_off(strip=None)` | Stop effects and turn the strip off. | `None` |
| `m.led_range(start, end, color='#ffffff', duration=0, strip=None)` | Set an inclusive range of pixels. | `None` |
| `m.led_set_brightness(power=30, duration=0, strip=None)` | Alias of brightness. | `None` |
| `m.led_show_all(color='#ffffff', duration=0, strip=None)` | Alias of led_all. | `None` |
| `m.led_show_one(index, color='#ffffff', duration=0, strip=None)` | Explicit-name alias of led. | `None` |
| `m.led_show_range(start, end, color='#ffffff', duration=0, strip=None)` | Alias of led_range. | `None` |
| `m.led_start_breathing(color='#ff00ff', period=50, duration=0, strip=None)` | Alias of breath. | `None` |
| `m.led_start_color_wipe(colors=None, period=50, duration=0, strip=None)` | Wipe through a palette. | `None` |
| `m.led_start_fire_flicker(color='#ff6600', period=50, duration=0, strip=None)` | Start a fire flicker effect. | `None` |
| `m.led_start_meteor(color='#ffffff', size=5, period=50, duration=0, strip=None)` | Start a meteor with the selected size. | `None` |
| `m.led_start_rainbow(period=20, duration=0, strip=None)` | Explicit-name rainbow method. | `None` |
| `m.led_start_random_sparkle(color='#ffffff', period=50, duration=0, strip=None)` | Start random sparkles. | `None` |
| `m.led_turn_off(strip=None)` | Alias of led_off. | `None` |
| `m.rainbow(period=20, duration=0, strip=None)` | Start a rainbow effect. | `None` |
| `m.select_led_strip(strip=None)` | Select the strip used when later calls omit strip. | `str` name |

## Parameter types, ranges and defaults

| Parameter | Type and rules |
| --- | --- |
| `strip` | `str` or `None`; a configured strip name, not a GPIO number. |
| `index / start / end` | Facade converts to integers, then requires `0 <= index < leds`. A range **includes both endpoints**; the driver swaps them when `start > end`. |
| `color` | Supported color name or `#RRGGBB` string, such as `red` or `#00ff00`; not an RGB tuple. |
| `power` | Converted integer 0–100%; persisted DM power must itself be an integer. Not a current measurement. |
| `period` | Converted integer 20–10000 ms; defaults depend on the effect signature. |
| `duration` | Converted integer 0–120000 ms; zero schedules no new expiry operation. Positive values follow the table below; driver scheduling has a 20 ms minimum. |
| `colors` | `None` selects red/green/blue; otherwise a sequence of 1–32 valid colors converted to a list by the facade. |
| `size` | Converted integer from 1 to the strip length. A default of 5 is invalid for a shorter strip; pass a smaller value. |

## Events and lifecycle

`select_led_strip()` returns the selected name. Other public wrappers here return `None`; they do not return the internal command's True. The result does not confirm physical light output.

| Operation | What a positive `duration` does on expiry |
| --- | --- |
| `led()` / `led_show_one()` | Restores that pixel's previous color |
| `led_all()` / `led_range()` and aliases | Restores the saved whole-strip frame, potentially overwriting later changes |
| `brightness()` / `led_set_brightness()` | Restores the previous brightness |
| Animation effects | Stops that effect's update task, leaving its last frame; does not automatically turn LEDs off |

**In this source, `led_clear()` cancels all effect/restore tasks for the selected strip and writes a black frame.** Its canonical `BoardRGB.stop_all_effects()` ends by calling `clear()`. `led_off()` also stops and clears. Neither result is hardware feedback.

Immediate static colors need no event loop. Animation and positive-duration restore/stop work need `run_once()` or `run_forever()`. Different effects on one strip retain separate tasks and should not be assumed to compose. Call `led_off()` for that strip before starting a replacement to remove old animations, restores and stop timers. `duration=0` does not cancel previously scheduled expiry work. Do not clear the shared Scheduler to stop a strip effect.

## Errors and diagnostic order

Disabled/closed state, changed GPIO/count after use, or unavailable NeoPixel support raises `RuntimeError`. Invalid names, pins, counts, colors, indices or timing raise `ValueError`; conversions and non-iterable palettes can also raise `TypeError`. Check target scope, module/entry enablement and DM pin/count, then test a single color with correct wiring, power and ground. Recreate Mango after GPIO/count changes.

## Complete minimal example

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("led_strip", False):
        raise RuntimeError("Enable led_strip in Device Manager")
    group = m.config.get("led_strips", {})
    if not isinstance(group, dict):
        raise ValueError("Check the configured led_strips table")
    items = {key: value for key, value in group.items()
             if isinstance(value, dict) and value.get("enabled", False)}
    name = m.config.get("current_led_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled led_strips entry in Device Manager")
        name = next(iter(items))
    spec = items[name]

    count = spec.get("leds")
    if type(count) is not int or not 1 <= count <= 256:
        raise ValueError("Configured leds must be an integer from 1 to 256")
    m.brightness(min(20, spec.get("power", 50)), strip=name)
    m.led_all("blue", strip=name)
    last = min(2, count - 1)
    m.led_range(0, last, "red", duration=300, strip=name)
    print("Inclusive red range: 0 to", last, "; then restore blue")
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < 600:
        m.run_once()
        time.sleep_ms(10)
finally:
    m.close()
```

## Related reading

[Guide](../guides/led.md) · [Lifecycle](../../../shared/en/guides/lifecycle.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md)

## Reviewed source and validation

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/rgb.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/rgb.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

Reviewed source SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`. Examples received syntax and source-contract checks only; this update makes no hardware PASS claim.
