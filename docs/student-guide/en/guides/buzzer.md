# Buzzer Guide

The buzzer can play alerts, tones, and simple melodies.

## 30-second test

```python
from mangobox import Mango

m = Mango()
m.bee()
```

`bee()` plays one short sound immediately and does not require `m.run_forever()`.

## Tone and song

### One tone: immediate

```python
from mangobox import Mango

m = Mango()
m.tone(880, 300)
```

`880` is frequency in Hz. `300` is duration in milliseconds. This call plays during the API call and does not need the event loop.

### Songs and sound effects: event loop required

```python
from mangobox import Mango

m = Mango()
m.play_song("twinkle_star")
m.run_forever()
```

`play_song()` and `play_sound()` hand later notes to the Scheduler. Without `m.run_forever()`, playback may be scheduled but never continue.

For example:

```python
from mangobox import Mango

m = Mango()
m.play_sound("win")
m.run_forever()
```

## Common API

```python
m.bee()
m.tone(frequency, duration=300)
m.play_song(song, tempo=None)
m.play_sound(name)
m.start_bee(period=1000, duration=3000)
m.stop_song()
m.stop_bee()
```

Lifecycle rule:

- `bee()` and `tone()` are immediate and do not require `run_forever()`;
- `play_song()`, `play_sound()`, and `start_bee()` are Scheduler-driven and require `run_forever()`;
- `stop_song()` and `stop_bee()` stop immediately.

## If there is no sound

Check the current configuration first:

```python
from mangobox import Mango

m = Mango()
print("Buzzer supported:", m.supports("buzzer"))
print("Buzzer enabled:", m.config.get("enabled_modules", {}).get("buzzer"))
print("Buzzer pin:", m.config.get("buzzer_pin"))
print("Buzzer mode:", m.config.get("buzzer_mode"))
```

Recommended order:

```text
API support
→ module enablement
→ buzzer_pin
→ buzzer_mode
→ for songs/repeating beeps, confirm the event loop is still running
→ Device Manager configuration
→ physical buzzer type / wiring / power
```

A passive buzzer normally needs PWM control, while active and passive modules behave differently. If both `m.bee()` and `m.tone()` are silent, verify the module type and current `buzzer_mode`.

If `m.bee()` and `m.tone()` work but `m.play_song()` does not continue, first check that the program reaches `m.run_forever()`.

For an external Buzzer, also check:

```text
Signal → buzzer_pin
VCC / GND
module voltage requirements
```

> The current Hardware Lab is focused on firmware/execution-mode/Recovery/Clean-Flash lifecycle diagnostics; it is not a general Buzzer/PWM production-test tool.

## Challenge

Play one preset effect:

```python
from mangobox import Mango

m = Mango()
m.play_sound("game_over")   # try "win" too
m.run_forever()
```

Then change the sound name and compare the two effects.

## More

- [Buzzer API Reference](../reference/buzzer.md)
- [Device Manager](../tools/device-manager.md)
