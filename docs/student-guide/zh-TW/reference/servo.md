# Servo API Reference

Servo 可用性仍由 target / mode / version 決定。MangoX2 目前已支援 named Servo；MangoLite 目前維持既有的單一／預設 Servo learner path。

```python
from mangobox import Mango
m = Mango()
```

## 相容的單一／預設 Servo 寫法

一般單 Servo 教學可直接使用：

```python
m.servo(angle)
m.servo_set_angle(angle)
m.servo_move_to(angle, step=5, period=60)
m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)
m.servo_stop()
m.servo_get_angle()
m.servo_release()
```

角度由 Student API 驗證；無效角度或 sweep 範圍會產生 `ValueError`。

## MangoX2 named Servo

目前 MangoX2 的 named-device contract 在相同 method 上增加可選的 `name`：

```python
m.servo(angle, name=None)
m.servo_set_angle(angle, name=None)
m.servo_move_to(angle, step=5, period=60, name=None)
m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None)
m.servo_stop(name=None)
m.servo_get_angle(name=None)
m.servo_release(name=None)
```

`name=None` 使用目前／預設 Servo；指定名稱時，該 instance 必須存在於目前 Runtime Servo 設定且可用。

```python
m.servo(30, name="arm")
m.servo_move_to(150, step=5, period=60, name="arm")
print(m.servo_get_angle(name="arm"))
m.servo_release(name="arm")
```

> MangoLite 目前請使用不帶 `name` 的共同語法。不能因為 MangoX2 支援 named Servo，就推論 MangoLite 已完成相同多裝置契約。

## `servo()` / `servo_set_angle()`

立即設定目標角度。一般位置式 Servo 使用 `0..180` 度；超出允許範圍會產生 `ValueError`。

```python
m.servo(90)
```

## `servo_move_to()`

以 `step` 分段移動到目標角度；`period` 為每次更新間隔（ms）。

```python
m.servo_move_to(150, step=3, period=40)
m.run_forever()
```

High-Level MicroPython 中後續步進由 Runtime / Scheduler 執行，因此需要維持 event loop。

## `servo_sweep()`

在 `min_angle` 與 `max_angle` 間持續來回掃動，且必須滿足 `min_angle < max_angle`。

```python
m.servo_sweep(30, 150, step=5, period=80)
m.run_forever()
```

## `servo_stop()`

停止 sweep 工作，但不等同 `servo_release()`；停止 sweep 後仍可能維持 Servo PWM。

## `servo_get_angle()`

回傳目前或最近可確認的 Servo 角度；若尚未取得有效值，可能回傳 `None`。

```python
print(m.servo_get_angle())
```

## `servo_release()`

釋放 Servo PWM。這不是「回到 0 度」；釋放後的物理位置仍受 Servo 機構與負載影響。

## Execution lifecycle

| API | High-Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `servo()` / `servo_set_angle()` | 立即設定角度 | 不需要 |
| `servo_get_angle()` | Runtime 回覆目前／最近角度 | 不需要 |
| `servo_release()` | 立即釋放 | 不需要 |
| `servo_move_to()` | 後續步進由 Runtime / Scheduler 執行 | 需要 |
| `servo_sweep()` | 持續由 Runtime / Scheduler 掃動 | 需要 |
| `servo_stop()` | 停止目前／指定 Servo sweep | 不需要 |

## 設定

MangoX2 named-device 設定主要使用 `servos` 與 `current_servo_setting`；每個 named Servo 可有自己的 Pin、角度範圍、PWM 範圍與 Enabled / Locked 狀態。MangoLite 目前維持既有單 Servo 設定路徑。

實際 Pin 與設定以 Device Manager / Runtime config 為準。

## Availability

```python
print(m.supports("servo"))
```

`True` 表示目前 learner API / target / config 可提供 Servo 語意，不代表實體 Servo 已正確接線或供電足夠。

## 相關 API

`servo()`, `servo_set_angle()`, `servo_move_to()`, `servo_sweep()`, `servo_stop()`, `servo_get_angle()`, `servo_release()`, `supports()`, `run_forever()`
