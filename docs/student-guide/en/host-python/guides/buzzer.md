# Buzzer — Host Python Guide

Host Python sends buzzer commands to the MangoBox Runtime. The Runtime performs the actual tone, melody, and sound-effect playback.

## 30-second test

```python
from mangobox import Mango

m = Mango()
m.bee()
```

Or play a tone:

```python
m.tone(880, 300)
```

## Songs and effects

```python
m.play_song("twinkle_star")
m.play_sound("win")
```

Host Python does not need `m.run_forever()` to step through every note. `play_song()` sends the song data to the Runtime, which continues playback itself.

Use `m.run_forever()` or your own PC-side loop only when the Host process must remain alive for incoming hardware events or other ongoing work.

## Common API

```python
m.bee()
m.tone(880, 300)
m.play_song("twinkle_star")
m.play_sound("win")
m.stop_song()
```

## If there is no sound

Check `m.supports("buzzer")`, then use Device Manager to inspect Buzzer enablement, `buzzer_pin`, and `buzzer_mode`. Verify Signal/VCC/GND and whether the physical module is active or passive.

If both `bee()` and `tone()` are silent, inspect hardware/configuration before blaming `run_forever()`.

See [Host Python Buzzer API Reference](../reference/buzzer.md).
