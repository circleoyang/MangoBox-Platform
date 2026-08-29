# Buzzer API Reference

## `bee()`

```python
bee() -> None
```

Plays one default beep.

## `tone()`

```python
tone(frequency, duration=300) -> None
```

| Parameter | Type | Description |
|---|---|---|
| `frequency` | `int` | Frequency in Hz. |
| `duration` | `int` | Duration in milliseconds. |

## `play_song()`

```python
play_song(song, tempo=None, default_duration_ms=180, gap_ms=35) -> None
```

`song` may be a preset name, note string, or note list.

## `play_sound()`

```python
play_sound(name) -> None
```

Plays a short teaching-effect preset.

Raises `ValueError` for an unknown preset.

## `start_bee()` / `stop_bee()`

```python
start_bee(period=1000, duration=3000) -> None
stop_bee() -> None
```

Start or stop periodic beeping.

## `stop_song()`

```python
stop_song() -> None
```

Stops song playback.

## Execution lifecycle

| API | High Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `bee()` / `tone()` | Immediate/blocking during the call | not required |
| `play_song()` / `play_sound()` | notes are stepped by Scheduler | required |
| `start_bee()` | registers a periodic Scheduler task | required |
| `stop_song()` / `stop_bee()` | immediate stop | not required |

This distinction is useful for diagnostics: if `bee()` and `tone()` work but `play_song()` never continues, inspect the event loop before treating the Buzzer Pin or PWM path as failed.

## Availability

Buzzer is a core Student API capability on MangoX2 and MangoLite, subject to the selected target/mode/version resolver.

## Configuration

```text
enabled_modules.buzzer
buzzer_pin
buzzer_mode
```

## Example

```python
from mangobox import Mango

m = Mango()
m.play_song("twinkle_star")
m.run_forever()
```

## Related

`bee()`, `tone()`, `play_song()`, `play_sound()`, `start_bee()`, `stop_song()`, `stop_bee()`, `run_forever()`
