# Servo 伺服馬達使用指南

Servo（伺服馬達）可以移動到指定角度，適合做指針、門閂與互動機構。

## 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
m.servo(90)
```

`servo(90)` 會立即把目前預設 Servo 移到指定角度，不需要 `m.run_forever()`。

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

## MangoX2：指定 named Servo

目前 MangoX2 的 Student API 已支援 named Servo。若 Device Manager / Runtime 設定中有多顆已啟用 Servo，可用 `name=` 指定：

```python
m.servo(90, name="arm")
m.servo_move_to(150, step=5, period=60, name="arm")
m.servo_sweep(20, 160, step=5, period=50, name="camera")
print(m.servo_get_angle(name="arm"))
m.servo_stop(name="camera")
m.servo_release(name="arm")
```

不指定 `name` 時仍使用目前 default / current Servo，舊的單 Servo 程式可以繼續使用。

> MangoLite 目前仍使用既有單一／default Servo learner path；在 MangoLite profile 下請省略 `name=`。named Servo 是目前 MangoX2 的 current contract，不應由文件假設成所有板卡都已完全相同。

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

High-Level MicroPython 的漸進動作由裝置端 Runtime / Scheduler 執行。要讓排程持續服務，程式需保留 event loop。

### 自動往返

```python
from mangobox import Mango

m = Mango()
m.servo_sweep(30, 150, step=5, period=50)
m.run_forever()
```

`servo_sweep()` 是持續動作，需要 `m.run_forever()`。

## 如果 Servo 不動

先確認 API capability：

```python
from mangobox import Mango

m = Mango()
print("Servo API 支援：", m.supports("servo"))
```

再到 Device Manager 檢查目前裝置的 Servo Enable、Pin、角度與 PWM 範圍。MangoX2 current named-device 設定以 `servos` collection 為主要來源；舊 scalar keys 仍保留相容用途。MangoLite 目前仍使用既有單 Servo 設定。

真機還要檢查：

```text
Power / V+ → 合適電源
GND        → 與 MangoBox 共地
Signal     → Device Manager 顯示的 Servo Pin
```

Servo 很常發生「程式正確但供電不足」。若移動時裝置重新開機、Servo 抖動或完全不動，除了 Signal Pin（訊號腳位）也要檢查供電能力與共地。

如果 `m.servo(90)` 可以正常移動，但 `servo_move_to()` 或 `servo_sweep()` 看起來沒有動作，High-Level MicroPython 請先確認程式最後有 `m.run_forever()`。

## 小挑戰

先用 `m.servo()` 測試 30、90、150 度三個位置；確認都正常後，再改用 `servo_move_to()` 做平滑移動。MangoX2 若設定了第二顆 Servo，再用 `name=` 分別控制兩顆。

## 進階閱讀

- [Servo API Reference](../reference/servo.md)
- [Device Manager 基本操作](../tools/device-manager.md)
- [Hardware Lab 基本操作](../tools/hardware-lab.md)
