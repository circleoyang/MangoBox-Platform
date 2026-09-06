# Sound Sensor API Reference

> 僅在目前 target / mode / version 提供 `sound_level` capability 時使用本頁。

## `sound_level()`

```python
m.sound_level() -> int
```

讀取校準後的 **0～100 相對聲音強度**：

- `0`：校準範圍中的較安靜端
- `100`：校準範圍中的較大聲端
- 中間值：相對聲音活動量

**這不是 dB（分貝）**，不要把 `70` 解讀成 `70 dB`。

```python
level = m.sound_level()
print("sound =", level)
```

## `on_sound_above()`

```python
m.on_sound_above(threshold, callback, hysteresis=5, period=100)
```

聲音強度由下往上跨越 `threshold` 時觸發 callback。

## `on_sound_below()`

```python
m.on_sound_below(threshold, callback, hysteresis=5, period=100)
```

聲音強度由上往下跨越 `threshold` 時觸發 callback。

`threshold` 與 `hysteresis` 使用 0～100 的標準化語意；`hysteresis` 可避免數值在門檻附近抖動時反覆觸發。`period` 為更新／取樣監看間隔，單位 ms。

## 執行生命週期

| API | High-Level MicroPython 行為 | 需要 `m.run_forever()` |
|---|---|---:|
| `sound_level()` | 立即同步讀取目前相對聲音強度 | 否 |
| `on_sound_above()` / `on_sound_below()` | 建立門檻 watcher 並啟動週期取樣；後續由 Scheduler 處理 | 是 |

callback API 會自行建立需要的 watcher，不需要另外呼叫 `start_sensor()`。

## 範例：大聲時變色

```python
from mangobox import Mango

m = Mango()

def loud():
    m.led_all("red")

m.on_sound_above(65, loud)
m.run_forever()
```

## raw signal 與校準

Runtime 的 raw 聲音量測以短時間窗 peak-to-peak 變化為基礎，再依 calibration 轉成 0～100。這適合教學中的「安靜／普通／較大聲」相對判斷，不適合作為聲級計或法規 dB 量測。

校準與 persistence 由 firmware / Runtime 擁有，Device Manager 負責操作與視覺化。Student API 不提供 `sound_level("name")` 這類 named-sensor 參數，也不應另做一套不同換算。

## 相關 API

`sound_level()`, `on_sound_above()`, `on_sound_below()`, `supports("sound_level")`, `run_forever()`
