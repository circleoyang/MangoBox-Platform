# Light Sensor API Reference — Host Python

## `light()`

```python
m.light() -> int
```

同步取得 Runtime 校準後的 **0～100 相對亮度**；`0` 表示較暗端、`100` 表示較亮端。這不是 lux。

```python
value = m.light()
print(value)
```

## `on_light_above()`

```python
m.on_light_above(threshold, callback, hysteresis=5, period=100)
```

亮度進入高於門檻的區域時執行 callback。

## `on_light_below()`

```python
m.on_light_below(threshold, callback, hysteresis=5, period=100)
```

亮度進入低於門檻的區域時執行 callback。

`threshold` 與 `hysteresis` 使用 0～100；`period` 最低會限制在 20 ms。

## Host Python 語意

raw ADC sampling、明暗端 calibration 與 persistence 由 firmware / Runtime 擁有。Host Python 只取得 canonical normalized value，不另做一套不同換算。

callback 的 threshold watcher 由 Runtime 執行，不需要 PC 自己寫取樣迴圈；但 **Host 程序／連線必須持續存活** 才能接收事件並執行 callback。需要一個明確的長時間執行入口時，可在程式最後使用 `m.run_forever()`。

目前 Student API 不提供 `light("name")` 這類 named-sensor 參數。Pin 與校準設定由 Runtime / Device Manager 管理。

## 範例

```python
from mangobox import Mango

m = Mango()

def dark():
    m.led_all("white")

m.on_light_below(30, dark)
m.run_forever()
```

## Capability

```python
print(m.supports("light"))
```

## 相關 API

`light()`, `on_light_above()`, `on_light_below()`, `run_forever()`

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
