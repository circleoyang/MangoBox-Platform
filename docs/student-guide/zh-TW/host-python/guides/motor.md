# Motor / Drive — Host Python 使用指南

Host Python 與 High-Level MicroPython 共用相同的 Drive learner semantics。Host 只送出語意命令，PWM、方向映射與 drivetrain assist 由 Runtime 執行。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
print(m.supports('drive'), m.supports('motor'))
m.forward(20)
time.sleep(0.5)
m.stop()
```

初次測試建議低速、車輪架空。

## 常用 API

```python
m.forward(60)
m.backward(60)
m.pivot_left(50)
m.pivot_right(50)
m.spin_left(50)
m.spin_right(50)
m.arc_left(80, 50)
m.arc_right(80, 50)
m.drive_tank(60, 40)
m.stop()
```

單顆馬達：

```python
m.motor_run('M1', 40)
m.motor_brake('M1')
m.motor_coast('M2')
```

MangoLite 目前也使用相同 shared drive-assist-v1 contract，因此 Host capability 可在 live Runtime config 啟用 Motor 時宣告 `drive` / `motor`。

方向錯誤應先修 Device Manager / Runtime config，不要把相反方向硬寫死在每一支學生程式。

完整函式資料請看 [Host Python Motor / Drive API Reference](../reference/motor.md)。
