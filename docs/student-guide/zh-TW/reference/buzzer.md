# Buzzer API Reference

## `bee()`

```python
bee() -> None
```

播放單次預設提示音。

## `tone()`

```python
tone(frequency, duration=300) -> None
```

| 參數 | 型別 | 說明 |
|---|---|---|
| `frequency` | `int` | 頻率（Hz）。 |
| `duration` | `int` | 持續時間（ms）。 |

## `play_song()`

```python
play_song(song, tempo=None, default_duration_ms=180, gap_ms=35) -> None
```

`song` 可為 preset 名稱、音符字串或音符清單。

## `play_sound()`

```python
play_sound(name) -> None
```

播放教學用短音效 preset。

### Raises

`ValueError`：`name` 不在支援的 preset 中。

## `start_bee()` / `stop_bee()`

```python
start_bee(period=1000, duration=3000) -> None
stop_bee() -> None
```

啟動／停止週期性蜂鳴。

## `stop_song()`

```python
stop_song() -> None
```

停止旋律播放。

## Execution lifecycle

| API | High Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `bee()` / `tone()` | Immediate / blocking，呼叫期間直接完成 | 不需要 |
| `play_song()` / `play_sound()` | 旋律由 Scheduler 逐步播放 | 需要 |
| `start_bee()` | 建立週期性 Scheduler 工作 | 需要 |
| `stop_song()` / `stop_bee()` | 立即停止 | 不需要 |

工程除錯時可利用這個差異定位問題：若 `bee()` 與 `tone()` 正常，但 `play_song()` 沒有持續播放，優先檢查 event loop，而不是先判定 Buzzer Pin 或 PWM 故障。

## Availability

Buzzer 是 MangoX2 與 MangoLite 的核心 Student API capability 之一，但仍應由選定 target、mode、version resolver 決定是否顯示。

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
