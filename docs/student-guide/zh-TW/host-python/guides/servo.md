# Servo 伺服馬達 — Host Python 使用指南

Host Python 會把 Servo 命令送給 MangoBox Runtime。位置控制、漸進移動與 sweep（往返掃動）都由 Runtime 執行。

## 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
m.servo(90)
```

Servo 應移到約 90 度。

## 漸進移動與 sweep

```python
m.servo_move_to(150, step=5, period=60)
m.servo_sweep(0, 180, step=5, period=50)
```

這些方法不需要 Host 端用 `m.run_forever()` 去逐步更新角度；Host 只送出命令，Runtime 會完成後續動作。

## 讀取目前角度

```python
angle = m.servo_get_angle()
print(angle)
```

Host 0.4.6 會等待 Runtime 的 `SERVO_ANGLE` 回覆；若沒有取得有效回覆，可能得到 `None`。

## 常用 API

```python
m.servo(angle)
m.servo_move_to(angle, step=5, period=60)
m.servo_sweep(0, 180, step=5, period=50)
m.servo_stop()
m.servo_get_angle()
m.servo_release()
```

`servo_stop()` 只停止 sweep；`servo_release()` 才會停止 PWM（Pulse Width Modulation，脈衝寬度調變）輸出。

## 如果 Servo 不動

先確認：

```python
from mangobox import Mango

m = Mango()
print(m.supports("servo"))
```

接著在 Device Manager 核對 Servo 是否 Enable、`servo_pin`、角度範圍，再檢查：

```text
Power / V+ → 合適電源
GND        → 與 MangoBox 共地
Signal     → servo_pin
```

Servo 很常因供電不足而抖動、無法移動或讓板子重啟。Host 程式正確不代表電源一定足夠。

完整函式資料請看 [Host Python Servo API Reference](../reference/servo.md)。
