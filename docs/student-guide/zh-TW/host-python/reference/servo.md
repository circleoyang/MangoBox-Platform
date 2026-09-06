# Servo API Reference — Host Python

適用於目前相容的 Host package 與 Runtime。Host Python 與 High-Level MicroPython 使用同一組 learner-facing Servo method 名稱；命令由 PC 傳給 Runtime 執行。

## 相容的單一／預設 Servo 寫法

```python
m.servo(angle)
m.servo_set_angle(angle)
m.servo_move_to(angle, step=5, period=60)
m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)
m.servo_stop()
m.servo_get_angle()
m.servo_release()
```

Student API 會驗證角度與 sweep 範圍；無效值會產生 `ValueError`。

## MangoX2 named Servo

目前 Host 支援 MangoX2 named-Servo contract，在相同 method 上增加可選的 `name`：

```python
m.servo(angle, name=None)
m.servo_set_angle(angle, name=None)
m.servo_move_to(angle, step=5, period=60, name=None)
m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None)
m.servo_stop(name=None)
m.servo_get_angle(name=None)
m.servo_release(name=None)
```

`name=None` 使用目前／預設 Servo；指定名稱時，Host 會將該名稱包含在送給 Runtime 的 Servo 命令中。

```python
from mangobox import Mango

m = Mango()
m.servo(90, name="arm")
print(m.servo_get_angle(name="arm"))
m.servo_release(name="arm")
```

MangoLite 目前維持既有單一／預設 Servo learner path；在 MangoLite profile 請使用不帶 `name` 的共同語法。

## `servo_move_to()` / `servo_sweep()`

Host 送出動作命令後，後續平滑移動或持續 sweep 由 Runtime Scheduler 執行；PC 端不需要用自己的 loop 逐步推進 Servo 動畫，也不需要為 Servo 動作另外呼叫 `m.run_forever()`。

## `servo_get_angle()` reply path

Host 送出 `get_angle` 並等待 Runtime 回覆；MangoX2 named Servo 會依指定名稱對應回覆。若沒有取得新的有效回覆，結果可能為 `None`。

## `servo_stop()` 與 `servo_release()`

`servo_stop()` 停止 sweep，但不等於釋放 PWM；`servo_release()` 才是停止保持 PWM 輸出。釋放 PWM 也不表示 Servo 一定回到 0 度。

## Availability / configuration

```python
print(m.supports("servo"))
```

MangoX2 named-device 設定主要使用 `servos` 與 `current_servo_setting`；每個 instance 可有自己的 Pin、角度範圍與 PWM 範圍。MangoLite 目前維持既有單 Servo 設定路徑。

`supports("servo") == True` 表示 learner path 可用，不代表實體 Servo 已正確接線或供電足夠。

## 相關 API

`servo()`, `servo_set_angle()`, `servo_move_to()`, `servo_sweep()`, `servo_stop()`, `servo_get_angle()`, `servo_release()`, `supports()`
