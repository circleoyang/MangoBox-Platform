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
