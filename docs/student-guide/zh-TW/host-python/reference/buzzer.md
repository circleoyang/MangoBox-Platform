# Buzzer API Reference — Host Python

適用：Host package `0.4.6` + 相容 Runtime。

## `bee()` / `tone()`

```python
bee() -> None
tone(frequency, duration=300) -> None
```

Host 送出蜂鳴器命令，由 Runtime 實際播放。

## `play_song()` / `play_sound()`

```python
play_song(song, tempo=None, default_duration_ms=180, gap_ms=35) -> None
play_sound(name) -> None
```

`song` 可使用 preset 名稱、音符字串或音符清單。`play_sound()` 對未知 preset 會拋出 `ValueError`。

## `stop_song()`

```python
stop_song() -> None
```

## Execution lifecycle

| API | Host `m.run_forever()` |
|---|---:|
| `bee()` / `tone()` | 不需要 |
| `play_song()` / `play_sound()` | 不需要用它播放後續 note |
| `stop_song()` | 不需要 |

Host 將完整命令／旋律送給 Runtime；後續播放由 Runtime 處理。`run_forever()` 只在 PC process 需要持續等待事件時才是典型做法。

## Availability

使用 `m.supports("buzzer")` 與 compatibility profile 判定。設定與硬體檢查以 Device Manager 的 `buzzer_pin`、`buzzer_mode`、Enable 狀態為準。
