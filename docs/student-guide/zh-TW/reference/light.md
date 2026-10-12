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

## `on_light_change()` — 感測值變化事件（Change Callback）

```python
m.on_light_change(callback, threshold=2, period=100)
m.stop_light_change()
```

依設定週期讀取現有 `m.light()`，當有效讀值與**上次已通知 callback 的值**相差達門檻時通知；不是每次讀值都觸發。首次有效觀測會通知一次。

| 參數 | 說明 |
|---|---|
| `callback` | 接收 `value` 的函式；需接受一個參數 |
| `threshold` | 預設 `2`，單位為 0～100 相對亮度百分點；比較對象是上次通知值 |
| `period` | 預設 100 毫秒，指定監看週期，實際取樣時間仍受裝置及通訊延遲影響 |

光線讀值為相對值，不是 lux。

```python
from mangobox import Mango
m = Mango()

def changed(value):
    print('light:', value)

m.on_light_change(changed, threshold=2)
m.run_forever()
```

停止監看使用 `m.stop_light_change()`；若要停止所有監看，結束時可使用 `m.close()`。Change watcher 不會替代既有門檻事件。背景自動取樣產生的內部讀取 log 會受到抑制，實際達門檻時會留下 `sensor_event / change` 紀錄。

> **版本注意：** Change API 需具備已整合 Sensor Change v1 的 Runtime／Host 套件。舊版不一定有這些方法；Host Python 應確認 MangoThonny 實際搭載的套件版本，不能只依韌體版本判斷。
