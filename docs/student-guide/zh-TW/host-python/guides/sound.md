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

## 新增：感測值變化事件（Change Callback）

除了直接呼叫 `m.sound_level()` 之外，現在可以讓 MangoBox 在數值變化達指定幅度時自動執行函式：

```python
from mangobox import Mango
m = Mango()

def changed(value):
    print('sound:', value)

m.on_sound_change(changed, threshold=5, period=100)
m.run_forever()
```

`threshold` 的單位是 0～100 相對音量百分點，與上一次實際通知值比較；`period` 是以毫秒指定的監看週期。首次有效讀值也會通知一次。音量是相對值，不是 dB（分貝）。 如需停止，使用 `m.stop_sound_change()`。

詳見 [API Reference](../reference/sound.md)。

> **版本注意：** Change API 需具備已整合 Sensor Change v1 的 Runtime／Host 套件。舊版不一定有這些方法；Host Python 應確認 MangoThonny 實際搭載的套件版本，不能只依韌體版本判斷。
