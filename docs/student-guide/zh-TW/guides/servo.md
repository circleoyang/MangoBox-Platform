# Servo 伺服馬達使用指南

Servo（伺服馬達）可以移動到指定角度，適合做指針、門閂與互動機構。

## 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
m.servo(90)
```

`servo(90)` 會立即把 Servo 移到指定角度，不需要 `m.run_forever()`。

## 常用 API

```python
m.servo(angle)
m.servo_move_to(angle, step=5, period=60)
m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)
m.servo_stop()
m.servo_get_angle()
m.servo_release()
```

`servo_stop()` 停止自動往返；`servo_release()` 才會停止 PWM（Pulse Width Modulation，脈衝寬度調變）輸出。

## 立即定位與漸進動作的差別

### 立即移到角度

```python
from mangobox import Mango

m = Mango()
m.servo(30)
```

這是立即型控制，不需要 event loop（事件迴圈）。

### 漸進移動

```python
from mangobox import Mango

m = Mango()
m.servo(30)
m.servo_move_to(150, step=5, period=60)
m.run_forever()
```

先有目前角度後，`servo_move_to()` 會用 Scheduler 分段移動到目標角度，因此要讓 event loop 繼續執行。

### 自動往返

```python
from mangobox import Mango

m = Mango()
m.servo_sweep(30, 150, step=5, period=50)
m.run_forever()
```

`servo_sweep()` 是持續動作，一定需要 `m.run_forever()`。

## 如果 Servo 不動

```python
from mangobox import Mango

m = Mango()
print("Servo API 支援：", m.supports("servo"))
print("Servo 模組啟用：", m.config.get("enabled_modules", {}).get("servo"))
print("Servo Pin：", m.config.get("servo_pin"))
print("最小角度：", m.config.get("servo_min_angle"))
print("最大角度：", m.config.get("servo_max_angle"))
```

再檢查真機：

```text
Power / V+ → 合適電源
GND        → 與 MangoBox 共地
Signal     → servo_pin
```

Servo 很常發生「程式正確但供電不足」。若移動時裝置重新開機、Servo 抖動或完全不動，除了 Signal Pin（訊號腳位）也要檢查供電能力。

如果 `m.servo(90)` 可以正常移動，但 `servo_move_to()` 或 `servo_sweep()` 看起來沒有動作，先確認程式最後有 `m.run_forever()`。

## 小挑戰

先用 `m.servo()` 測試 30、90、150 度三個位置；確認都正常後，再改用 `servo_move_to()` 做平滑移動。

## 進階閱讀

- [Servo API Reference](../reference/servo.md)
- [Device Manager 基本操作](../tools/device-manager.md)
- [Hardware Lab 基本操作](../tools/hardware-lab.md)
