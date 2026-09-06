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
