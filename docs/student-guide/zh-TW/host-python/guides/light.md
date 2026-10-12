# Light 光線感測器 — Host Python 使用指南

Host Python 的 `light()` 回傳 Runtime 已校正的 0～100 相對亮度：`0=暗`、`100=亮`。Host 不自行做 ADC endpoint 計算。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.light())
    time.sleep(0.5)
```

## Threshold 事件

```python
from mangobox import Mango

m = Mango()
m.on_light_below(30, lambda: print('DARK'))
m.on_light_above(70, lambda: print('BRIGHT'))
m.run_forever()
```

可使用 `hysteresis` 避免數值在門檻附近反覆切換：

```python
m.on_light_below(30, dark, hysteresis=5, period=100)
```

## 校正責任

Bright / Dark raw endpoints 由 firmware/runtime 的 Sensor Calibration Contract v1 管理。Host API 只讀 normalized value 與接收事件，不在 PC 重新估算或覆寫校正公式。

若 normalized value 不合理，請用 Device Manager 重新做 Bright / Dark calibration，而不是在 Host 程式硬加比例公式。

完整函式資料請看 [Host Python Light API Reference](../reference/light.md)。

## 新增：感測值變化事件（Change Callback）

除了直接呼叫 `m.light()` 之外，現在可以讓 MangoBox 在數值變化達指定幅度時自動執行函式：

```python
from mangobox import Mango
m = Mango()

def changed(value):
    print('light:', value)

m.on_light_change(changed, threshold=2, period=100)
m.run_forever()
```

`threshold` 的單位是 0～100 相對亮度百分點，與上一次實際通知值比較；`period` 是以毫秒指定的監看週期。首次有效讀值也會通知一次。光線讀值為相對值，不是 lux。 如需停止，使用 `m.stop_light_change()`。

詳見 [API Reference](../reference/light.md)。

> **版本注意：** Change API 需具備已整合 Sensor Change v1 的 Runtime／Host 套件。舊版不一定有這些方法；Host Python 應確認 MangoThonny 實際搭載的套件版本，不能只依韌體版本判斷。
