# Light Sensor API Reference

> 僅在目前 target / mode / version 提供 `light` capability 時使用本頁。

## `light()`

```python
m.light() -> int
```

讀取校準後的 **0～100 相對亮度**：

- `0`：校準範圍中的較暗端
- `100`：校準範圍中的較亮端
- 中間值：相對亮度

這不是 lux（照度）值。

```python
value = m.light()
print("light =", value)
```

## `on_light_above()`

```python
m.on_light_above(threshold, callback, hysteresis=5, period=100)
```

亮度由下往上跨越 `threshold` 時觸發 callback。

## `on_light_below()`

```python
m.on_light_below(threshold, callback, hysteresis=5, period=100)
```

亮度由上往下跨越 `threshold` 時觸發 callback。

`threshold` 與 `hysteresis` 使用 0～100 的標準化語意；`hysteresis` 可避免讀值在門檻附近抖動時反覆觸發。`period` 為更新／監看間隔，單位 ms。

## 執行生命週期

| API | High-Level MicroPython 行為 | 需要 `m.run_forever()` |
|---|---|---:|
| `light()` | 立即同步讀取校準值 | 否 |
| `on_light_above()` / `on_light_below()` | 建立門檻 watcher 並啟動更新；後續由 Scheduler 處理 | 是 |

callback API 會自行建立需要的 watcher，不需要另外呼叫 `start_sensor()`。

## 範例：太暗時亮燈

```python
from mangobox import Mango

m = Mango()

def dark():
    m.led_all("white")

m.on_light_below(30, dark)
m.run_forever()
```

## 校準語意

ADC raw sampling、明暗端校準、validation 與 persistence 由 firmware / Runtime 負責；Device Manager 提供操作與視覺化。Student API 不提供 `light("name")` 這類 named-sensor 參數，也不應在每份學生程式另建不同換算。

因此 `50` 應理解為目前校準範圍中的相對中間值，不是固定物理照度。

## 相關 API

`light()`, `on_light_above()`, `on_light_below()`, `supports("light")`, `run_forever()`
