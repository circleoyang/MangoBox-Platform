# Joystick 搖桿 — Host Python 使用指南

Joystick API 回傳已正規化的 X/Y 值，各為 `-100..100`，並可讀取搖桿按鍵。中心點與 deadzone 由 Runtime config 管理。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    x, y = m.joystick()
    print(x, y, m.is_joystick_pressed())
    time.sleep(0.2)
```

## 按鍵事件

```python
from mangobox import Mango

m = Mango()
m.on_joystick_pressed(lambda: print('PRESS'))
m.on_joystick_released(lambda: print('RELEASE'))
m.run_forever()
```

## 中心校正

保持搖桿完全放開在中央，再執行：

```python
center_x, center_y = m.calibrate_joystick(samples=16)
print(center_x, center_y)
```

校正命令交由 Runtime 執行，Host 不直接讀 PC ADC。

## 如果中心一直偏

先確認 VRX/VRY/SW Pin、Swap X/Y、Invert X/Y 與 deadzone，再做 center calibration。不要一開始就在學生程式手動扣固定 offset。

完整函式資料請看 [Host Python Joystick API Reference](../reference/joystick.md)。


## 變化事件: `on_joystick_change()`

`m.on_joystick_change(callback, threshold=8, period=100)` 以先前已通知值為基準比較，首次有效讀值也會通知一次。 任一座標軸變化達 8 即觸發。

```python
from mangobox import Mango
m = Mango()
def changed(x, y):
    print(x, y)
m.on_joystick_change(changed, threshold=8)
m.run_forever()
```

`m.stop_joystick_change()` 停止監看。此 API 需要整合 Sensor Change v1 的 Runtime／Host 套件。
