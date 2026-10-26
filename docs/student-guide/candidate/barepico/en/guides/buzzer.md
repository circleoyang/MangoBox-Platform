# External buzzers on BarePico

> Candidate source: BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26. Source review is not hardware acceptance.

## 1. What you can do and prepare

Play tones, frequencies and short melodies. BarePico has no carrier buzzer. Enable `enabled_modules.buzzer` and configure external `buzzer_pin`, `buzzer_mode` and `buzzer_duty` in DM. These pitched-tone and melody examples require a suitable passive buzzer in `pwm` mode. The gpio single-tone path toggles the pin in software and depends on the component; this source does not guarantee equivalent scheduled gpio melodies.

## 2. 30-second quick test

This synchronously plays an 880 Hz tone for 200 ms. `tone()` waits for that duration and follows its output-off path before returning; it does not return first and depend on Scheduler to stop the note. No audio files or DFPlayer are needed.

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

## 3. What to observe

You should hear a short tone. A fixed pitch or click suggests checking the component and DM mode. `tone()` / `beep()` block synchronously; melodies through `music()` need ongoing event-loop processing. A None return reports neither volume nor physical success.

Tone duration=0 becomes 150 ms, not an indefinitely sustained sound. `start_bee()` is periodic, but each short beep also blocks about 40 ms. Avoid long tones inside sensor callbacks.

## 4. Common uses

Use `tone(frequency, duration=...)` for one tone and `music([[frequency, milliseconds], ...], gap_ms=...)` for a melody. `play_song()` and predefined sound names are available, but arbitrary song names are not guaranteed. `stop_music()` stops melody playback; use `stop_bee()` for periodic beeping.

## 5. Complete interactive example

Type 1 for a short tone, 2 for three notes or q to finish. A single tone completes synchronously. For a melody, the example services Scheduler for about 800 ms and explicitly stops it before waiting for another key. This is a fixed observation window, not completion feedback. Call the wait helper only from the foreground, never from a sensor callback.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("buzzer", False):
    raise RuntimeError("Enable buzzer in Device Manager first")
pin_no = m.config.get("buzzer_pin")
if not isinstance(pin_no, int):
    raise ValueError("Configure buzzer_pin in Device Manager")

def wait_running(milliseconds):
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < milliseconds:
        m.run_once()
        time.sleep_ms(10)

try:
    if m.config.get("buzzer_mode", "pwm") != "pwm":
        raise ValueError("This melody example requires pwm mode")
    while True:
        command = input("1 = short tone, 2 = three notes, q = quit: ").strip()
        if command == "q":
            break
        if command == "1":
            m.tone(660, duration=150)
        elif command == "2":
            m.music([[523, 150], [659, 150], [784, 250]], gap_ms=30)
            wait_running(800)
        m.stop_music()
finally:
    m.close()
```

## 6. Target/mode notes and troubleshooting

For BarePico High-Level MicroPython v0.1.0-rc6 candidate source. Buzzer output is separate from Sound sensor input.

Diagnose: profile → aggregate enable → actual GPIO → pwm/gpio mode and duty → component type, polarity, power and common ground. PWM slices can conflict with Servo/Motor; resolve DM assignments rather than bypassing the runtime check. Any minimal raw PWM test must run separately after stopping Mango, on a confirmed pin.

## 7. Small challenge

Create ascending and descending three-note notifications. Compare note length and gaps, and verify that each sequence returns to silence.

[API Reference](../reference/buzzer.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
