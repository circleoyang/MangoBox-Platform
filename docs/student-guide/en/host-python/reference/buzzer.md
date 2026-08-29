# Buzzer API Reference — Host Python

Applies to Host package `0.4.6` with a compatible Runtime.

## `bee()` / `tone()`

```python
bee() -> None
tone(frequency, duration=300) -> None
```

The Host sends a buzzer command and the Runtime performs playback.

## `play_song()` / `play_sound()`

```python
play_song(song, tempo=None, default_duration_ms=180, gap_ms=35) -> None
play_sound(name) -> None
```

`play_sound()` raises `ValueError` for an unknown preset.

## `stop_song()`

```python
stop_song() -> None
```

## Execution lifecycle

| API | Host `m.run_forever()` |
|---|---:|
| `bee()` / `tone()` | not required |
| `play_song()` / `play_sound()` | not required to step later notes |
| `stop_song()` | not required |

The Host sends the command/song data to the Runtime; later playback is owned by the Runtime. `run_forever()` is mainly for keeping the PC process alive for incoming events.

## Availability

Use `m.supports("buzzer")` plus the selected compatibility profile. Inspect Buzzer enablement, `buzzer_pin`, and `buzzer_mode` in Device Manager.
