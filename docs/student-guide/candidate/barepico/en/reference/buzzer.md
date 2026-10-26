# BarePico Buzzer tones and short melodies — API Reference

> Source candidate: v0.1.0-rc6; BarePico Pico / Pico W / Pico 2 W; High-Level MicroPython. Source review does not claim Windows or physical-device acceptance in this update.

## Setup, targets and mode

Enable `enabled_modules.buzzer` and configure external `buzzer_pin`, `buzzer_mode` (`pwm` or `gpio`) and integer `buzzer_duty` 1–65535. Pitched-tone and scheduled-melody examples use a suitable passive buzzer in `pwm` mode. The gpio single-tone path toggles the pin in software and depends on the component. This source's scheduled melody assumes a sustained PWM tone; equivalent gpio melody playback is not guaranteed. This is separate from DFPlayer audio or Sound input.

## Methods, exact signatures and returns

Defaults are exactly those in the signatures below. Import with `from mangobox import Mango` and construct `m = Mango()`.

| Signature | Meaning | Returns |
| --- | --- | --- |
| `m.bee()` | Convenience alias of beep. | `None` |
| `m.beep()` | Play the default short beep. | `None` |
| `m.music(notes, default_duration_ms=180, gap_ms=35)` | Normalize and play notes. | `None` |
| `m.play_song(song, tempo=None, default_duration_ms=180, gap_ms=35)` | Play a melody with optional tempo. | `None` |
| `m.play_sound(name)` | Play a defined sound preset. | `None` |
| `m.play_tone(frequency, duration=300)` | Explicit-name tone method. | `None` |
| `m.sound(name)` | Alias of play_sound. | `None` |
| `m.start_bee(period=1000, duration=3000)` | Start periodic beeping, optionally with a timed stop. | `None` |
| `m.stop_bee()` | Stop periodic beeping. | `None` |
| `m.stop_music()` | Alias of stop_song. | `None` |
| `m.stop_song()` | Stop a song. | `None` |
| `m.tone(frequency, duration=300)` | Play a tone at the selected frequency. | `None` |

## Parameter types, ranges and defaults

| Parameter | Type and rules |
| --- | --- |
| `frequency` | Single-tone facade converts to int, then validates 30–12000 Hz; not volume. |
| `duration` | Converted int; tone accepts 0–5000 ms, with 0 becoming 150 ms. For `start_bee`, 0 means no automatic stop; use 10–5000 ms for a positive value because Bare Scheduler rejects 1–9. |
| `period` | `start_bee` converts to int 20–60000 ms. Each beep itself blocks about 40 ms, so short periods are not a timing guarantee. |
| `notes / song` | String, list or tuple; prefer `[[440, 200], [0, 100], [660, 200]]`. Normalized length 1–256 notes, each 1–10000 ms; `R/REST/-/0` represent rests. |
| `tempo` | Converted float >0; supplies a default `round(60000/tempo)` ms for notes lacking explicit time. Existing presets and explicit millisecond durations are not automatically scaled. |
| `default_duration_ms / gap_ms` | Converted int default duration 1–10000 ms; gap 0–1000 ms. Facade defaults are 180/35. |
| `name` | `play_sound` / `sound` accept defined source presets; unknown names raise ValueError. |

The current note-name table contains C4, D4, E4, F4, G4, A4, B4 and the same names C5–B5. Do not infer arbitrary accidentals or octaves. Unknown text notes become 0 Hz rests instead of necessarily raising an error. Use actual numbers for numeric frequencies; `"880"` is not a recognized note name. Song-note frequencies also do not receive the same validation as standalone tones.

## Events and lifecycle

All wrappers return None, but their timing differs:

| Operation | Actual execution |
| --- | --- |
| `tone()` / `play_tone()` | **Synchronously blocks** for the tone duration, then turns output off; duration=0 becomes 150 ms, not a sustained tone |
| `beep()` / `bee()` | Synchronous 2500 Hz tone for about 100 ms |
| `music()` / `play_song()` / `play_sound()` | Advances through roughly 20 ms Scheduler steps; needs an event loop and pwm mode |
| `start_bee()` | Runs a synchronous roughly 40 ms beep when each period becomes due; positive duration schedules a separate stop |

Long tones delay other tasks and should not be awaited inside sensor callbacks. There is no volume or physical-playback feedback; tone returning only means its synchronous path finished. Calling `start_bee()` again while active does not replace the existing beeper task's period. To change period, stop it first and start again.

`stop_song()` / `stop_music()` cancels the melody and silences current output. `stop_bee()` cancels periodic beeping and silences current output. Neither cancels the other's future tasks. All modes share one device; stop the previous activity before switching. Close at shutdown to release PWM.

## Errors and diagnostic order

Disabled/closed state, failed PWM initialization or changed pin/mode/duty after use raises RuntimeError. Invalid song containers, excess note count/duration, unknown sound presets and bad configuration/timing are rejected. The facade first converts some values or clamps note durations to at least 1; do not claim universal strict validation before registration. Use positive `start_bee` duration 10–5000 to avoid 1–9 ms failing Scheduler validation after the beeper has already started.

Check profile, enablement, actual GPIO, DM mode/duty, component type, power and ground. For a silent melody, check pwm mode and recognized note names instead of trying arbitrary strings as song names.

## Complete minimal example

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("buzzer", False):
        raise RuntimeError("Enable buzzer in Device Manager")
    pin_no = m.config.get("buzzer_pin")
    if type(pin_no) is not int:
        raise ValueError("Configure buzzer_pin in Device Manager")

    if m.config.get("buzzer_mode", "pwm") != "pwm":
        raise ValueError("This pitched-tone example requires pwm mode")
    print("Starting a synchronous 200 ms tone")
    m.tone(880, duration=200)
    print("Tone call returned; verify the sound yourself")
finally:
    m.close()
```

## Related reading

[Guide](../guides/buzzer.md) · [Lifecycle](../../../shared/en/guides/lifecycle.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md)

## Reviewed source and validation

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/buzzer.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/buzzer.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

Reviewed source SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`. Examples received syntax and source-contract checks only; this update makes no hardware PASS claim.
