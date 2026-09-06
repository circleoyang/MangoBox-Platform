# Buzzer API Reference

適用於 MangoBox High-Level MicroPython Student API。

```python
from mangobox import Mango
m = Mango()
```

## 快速索引

| 想做什麼 | API |
|---|---|
| 嗶一聲 | `bee()` |
| 播放指定頻率 | `tone()` |
| 播放音符清單 | `music()` |
| 播放 preset／旋律 | `play_song()` |
| 播放短音效 | `play_sound()` |
| 週期性蜂鳴 | `start_bee()` |
| 停止週期蜂鳴 | `stop_bee()` |
| 停止旋律 | `stop_song()` |

## `bee()`

```python
m.bee()
```

播放一次預設提示音。沒有參數，不回傳值。

```python
m.bee()
```

## `tone()`

```python
m.tone(frequency, duration=300)
```

| 參數 | 型別 | 預設值 | 說明 |
|---|---|---:|---|
| `frequency` | `int` | 必填 | 音調頻率，單位 Hz。 |
| `duration` | `int` | `300` | 播放時間，單位 ms。 |

```python
m.tone(440, 500)   # A4，播放 0.5 秒
m.tone(880, 150)
```

`tone()` 是 immediate / blocking 類型：這個音調在呼叫期間直接完成，因此單獨使用不需要 `run_forever()`。

## `music()`

```python
m.music(notes, default_duration_ms=180, gap_ms=35)
```

播放已整理好的音符資料。

| 參數 | 說明 |
|---|---|
| `notes` | 音符清單；可包含音名、頻率、休止與個別 duration。 |
| `default_duration_ms` | 未個別指定時，每個音符的預設時間（ms）。 |
| `gap_ms` | 音符間隔（ms）。 |

```python
m.music([
    ["C4", 200],
    ["E4", 200],
    ["G4", 400],
])
m.run_forever()
```

旋律由 Runtime Scheduler 逐步播放，High-Level MicroPython 必須持續服務 event loop。

## `play_song()`

```python
m.play_song(song, tempo=None, default_duration_ms=180, gap_ms=35)
```

`song` 可使用三種形式：

1. 內建 preset 名稱，例如 `"twinkle_star"`。
2. 音符字串，例如 `"C4 E4 G4"`。
3. 音符 list / tuple。

| 參數 | 說明 |
|---|---|
| `song` | preset 名稱、音符字串或音符清單。 |
| `tempo` | BPM；指定後用 BPM 換算未附 duration 的音符長度，必須大於 0。 |
| `default_duration_ms` | 沒有 `tempo` 與個別 duration 時的預設音符時間。 |
| `gap_ms` | 音符間隔（ms）。 |

```python
m.play_song("twinkle_star")
m.run_forever()
```

目前內建旋律 preset 包含：`happy_birthday`、`twinkle_star`、`jingle_bells`、`ode_to_joy`、`mario`。

## `play_sound()` / `sound()`

```python
m.play_sound(name)
m.sound(name)
```

播放短音效 preset；`sound()` 是簡短別名。

目前 preset：

```text
coin
jump
power_up
win
game_over
alert
```

```python
m.play_sound("coin")
m.run_forever()
```

未知名稱會拋出 `ValueError`。

## `start_bee()`

```python
m.start_bee(period=1000, duration=3000)
```

建立週期性蜂鳴工作。

| 參數 | 說明 |
|---|---|
| `period` | 每次週期的間隔（ms）。 |
| `duration` | 整個週期蜂鳴工作維持多久（ms）。 |

```python
m.start_bee(period=500, duration=5000)
m.run_forever()
```

## `stop_bee()`

```python
m.stop_bee()
```

立即停止 `start_bee()` 建立的週期性蜂鳴。

## `stop_song()` / `stop_music()`

```python
m.stop_song()
m.stop_music()
```

停止目前旋律播放；`stop_music()` 為相容別名。

## Execution lifecycle

| API | High-Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `bee()` / `tone()` | immediate / blocking | 不需要 |
| `music()` / `play_song()` / `play_sound()` | Scheduler 逐步播放 | 需要 |
| `start_bee()` | Scheduler 週期工作 | 需要 |
| `stop_song()` / `stop_bee()` | 立即停止 | 不需要 |

如果 `bee()`、`tone()` 正常，但旋律或週期蜂鳴沒有持續，優先檢查是否有執行 `m.run_forever()`，不要先判定 Buzzer Pin 或 PWM 故障。

## 完整範例

```python
from mangobox import Mango

m = Mango()

m.tone(880, 150)
m.play_song("ode_to_joy")
m.run_forever()
```

## 相關 API

`bee()`, `tone()`, `music()`, `play_song()`, `play_sound()`, `sound()`, `start_bee()`, `stop_bee()`, `stop_song()`, `run_forever()`
