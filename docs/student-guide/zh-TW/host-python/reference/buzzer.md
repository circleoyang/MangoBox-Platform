# Buzzer API Reference — Host Python

Host Python 與 High-Level MicroPython 使用相同的 Student API 名稱與主要參數；命令由 PC 傳到 Runtime。

## `bee()` / `tone()`

```python
m.bee()
m.tone(frequency, duration=300)
```

| 參數 | 說明 |
|---|---|
| `frequency` | 頻率 Hz。 |
| `duration` | 播放時間 ms，預設 300。 |

```python
m.tone(880, 500)
```

## `play_song()`

```python
m.play_song(song, tempo=None, default_duration_ms=180, gap_ms=35)
```

`song` 可為 preset 名稱、音符字串或音符 list；`tempo` 為 BPM，`default_duration_ms` 與 `gap_ms` 皆為 ms。

```python
m.play_song("twinkle_star")
```

## `music()`

```python
m.music(notes, default_duration_ms=180, gap_ms=35)
```

播放已整理好的音符清單。

## `play_sound()` / `sound()`

```python
m.play_sound(name)
m.sound(name)
```

內建短音效名稱：`coin`, `jump`, `power_up`, `win`, `game_over`, `alert`。未知名稱會產生 `ValueError`。

## `start_bee()` / `stop_bee()`

```python
m.start_bee(period=1000, duration=3000)
m.stop_bee()
```

`period` 是週期間隔 ms；`duration` 是週期蜂鳴工作維持時間 ms。

## `stop_song()` / `stop_music()`

```python
m.stop_song()
m.stop_music()
```

停止目前旋律。

## Host lifecycle

旋律與週期工作由 Runtime 端執行，不需要靠 Host `m.run_forever()` 推進 Scheduler；只有需要讓 PC process 持續存活或接收 callback 時才需要 Host event loop。

## 範例

```python
from mangobox import Mango

m = Mango()
m.tone(880, 150)
m.play_sound("coin")
```
