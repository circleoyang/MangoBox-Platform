# Servo 伺服馬達 — Host Python 使用指南

Host Python 會把 Servo 命令送給 MangoBox Runtime。位置控制、漸進移動與 sweep（往返掃動）都由 Runtime 執行。

## 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
print("Servo supported =", m.supports("servo"))
m.servo(90)
```

Servo 應移到約 90 度。Host 端不需要用 `m.run_forever()` 去逐步更新 Servo；Runtime 會處理動作。

## MangoX2：指定 named Servo

Host 0.4.6 的 MangoX2 current contract 支援 named Servo。若 Device Manager / Runtime 已設定多顆 Servo：

```python
m.servo(90, name="arm")
m.servo_move_to(150, step=5, period=60, name="arm")
m.servo_sweep(20, 160, step=5, period=50, name="camera")
print(m.servo_get_angle(name="arm"))
m.servo_stop(name="camera")
m.servo_release(name="arm")
```

不指定 `name` 時會使用 default/current Servo，舊的單 Servo 程式仍可使用。

> MangoLite 目前仍使用既有單一／default Servo learner path。在 MangoLite profile 下請省略 `name=`；不要把 MangoX2 的 named-device contract 直接套到 MangoLite。

## 漸進移動與 sweep

```python
m.servo_move_to(150, step=5, period=60)
m.servo_sweep(0, 180, step=5, period=50)
```

這些方法不需要 Host 端用 `m.run_forever()` 去驅動角度更新；Host 只送出命令，Runtime 會完成後續動作。

## 讀取目前角度

```python
angle = m.servo_get_angle()
print(angle)
```

MangoX2 named Servo 也可指定：

```python
angle = m.servo_get_angle(name="arm")
```

Host 0.4.6 會送出 `get_angle` 並等待 Runtime 的 `SERVO_ANGLE` 回覆；若沒有取得有效新回覆，會回傳 `None`。

## 常用 API

共同單 Servo 語法：

```python
m.servo(angle)
m.servo_set_angle(angle)
m.servo_move_to(angle, step=5, period=60)
m.servo_sweep(0, 180, step=5, period=50)
m.servo_stop()
m.servo_get_angle()
m.servo_release()
```

MangoX2 可在相同方法加上 `name="..."`。

`servo_stop()` 只停止 sweep；`servo_release()` 才會停止 PWM（Pulse Width Modulation，脈衝寬度調變）輸出。

## 如果 Servo 不動

先確認：

```python
from mangobox import Mango

m = Mango()
print(m.supports("servo"))
```

接著在 Device Manager 核對 Servo 是否 Enable、目前 Servo / named Servo、Pin、角度與 PWM 範圍，再檢查：

```text
Power / V+ → 合適電源
GND        → 與 MangoBox 共地
Signal     → Device Manager 顯示的 Servo Pin
```

Servo 很常因供電不足而抖動、無法移動或讓板子重啟。Host 程式正確不代表電源一定足夠。

完整函式資料請看 [Host Python Servo API Reference](../reference/servo.md)。
