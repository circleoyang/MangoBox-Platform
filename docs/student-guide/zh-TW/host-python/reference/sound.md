# Sound Sensor API Reference — Host Python

## `sound_level()`

```python
m.sound_level() -> int
```

同步取得 Runtime 校準後的 **0～100 相對聲音強度**。這不是 SPL / dB（分貝）。

```python
level = m.sound_level()
print(level)
```

## `on_sound_above()`

```python
m.on_sound_above(threshold, callback, hysteresis=5, period=100)
```

聲音強度進入高於門檻的區域時執行 callback。

## `on_sound_below()`

```python
m.on_sound_below(threshold, callback, hysteresis=5, period=100)
```

聲音強度進入低於門檻的區域時執行 callback。

`threshold` 與 `hysteresis` 使用 0～100；`period` 最低會限制在 20 ms。

## Host Python 語意

Runtime 的 raw 聲音量測使用短時間窗 peak-to-peak amplitude，再依 calibration 正規化為 0～100。Host Python 不重新實作 calibration 數學。

callback 的 threshold watcher 由 Runtime 執行，不需要 PC 自己寫取樣迴圈；但 **Host 程序／連線必須持續存活** 才能接收事件並執行 callback。需要一個明確的長時間執行入口時，可在程式最後使用 `m.run_forever()`。

這個值適合「安靜／普通／較大聲」相對判斷，不適合作為聲級計或法規 dB 量測。

目前 Student API 不提供 `sound_level("name")` 這類 named-sensor 參數。ADC Pin 與校準設定由 Runtime / Device Manager 管理。

## 範例

```python
from mangobox import Mango

m = Mango()

def loud():
    m.led_all("red")

m.on_sound_above(60, loud)
m.run_forever()
```

## Capability

```python
print(m.supports("sound_level"))
```

## 相關 API

`sound_level()`, `on_sound_above()`, `on_sound_below()`, `run_forever()`

## 感測值變化事件 (Change Callback): `on_sound_change()`

```python
m.on_sound_change(callback, threshold=5, period=100)
m.stop_sound_change()
```

變化量與上次實際通知值比較。門檻預設 5（相對音量值（非 dB）），不是每次取樣都通知；首次有效讀值通知一次。 `period` 為毫秒（ms）的監看週期，實際執行可能受取樣與通訊延遲影響。

```python
from mangobox import Mango
m = Mango()
def changed(value):
    print(value)
m.on_sound_change(changed, threshold=5)
m.run_forever()
```

注意：此 API 需整合 Sensor Change v1 的 Runtime／Host 套件，舊版不一定支援；不能由韌體版本推定 MangoThonny 的 Host Python 已更新。
