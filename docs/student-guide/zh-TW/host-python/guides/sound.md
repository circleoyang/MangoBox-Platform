# Sound 聲音感測器 — Host Python 使用指南

`sound_level()` 回傳 0～100 的相對聲音強度，**不是 dB**。目前 Runtime 使用短時間窗 peak-to-peak raw amplitude，再依 Sensor Calibration Contract v1 的 quiet/reference calibration 正規化。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.sound_level())
    time.sleep(0.2)
```

## Threshold 事件

```python
from mangobox import Mango

m = Mango()
m.on_sound_above(70, lambda: print('LOUD'))
m.on_sound_below(30, lambda: print('QUIET'))
m.run_forever()
```

可設定 `hysteresis` 與 `period`：

```python
m.on_sound_above(70, loud, hysteresis=5, period=100)
```

## 校正責任

Host 不執行 quiet P90、reference P98 或 raw span 計算。這些都是 firmware/runtime 的校正責任。若數值總是 0/100 或變化不合理，請先在 Device Manager 做 quiet/reference calibration。

完整函式資料請看 [Host Python Sound API Reference](../reference/sound.md)。
