# Servo API Reference

```python
from mangobox import Mango
m = Mango()
```

## 快速索引

| 想做什麼 | API |
|---|---|
| 立即轉到角度 | `servo()` |
| 平滑移動到角度 | `servo_move_to()` |
| 持續來回掃動 | `servo_sweep()` |
| 停止掃動 | `servo_stop()` |
| 讀取最近角度 | `servo_get_angle()` |
| 釋放 PWM | `servo_release()` |

## `servo()` / `servo_set_angle()`

```python
m.servo(angle)
m.servo_set_angle(angle)
```

立即把 Servo 設為指定角度。`servo()` 是學生建議使用的短名稱。

| 參數 | 型別 | 範圍 | 說明 |
|---|---|---|---|
| `angle` | `int` | `0..180` | 目標角度（degree）。 |

```python
m.servo(0)
m.servo(90)
m.servo(180)
```

超出 `0..180` 會拋出 `ValueError`。

## `servo_move_to()`

```python
m.servo_move_to(angle, step=5, period=60)
```

讓 Servo 分段平滑移動到目標角度，而不是一次跳到新角度。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `angle` | 必填 | 目標角度 `0..180`。 |
| `step` | `5` | 每次更新改變的角度；最小會限制為 1。 |
| `period` | `60` | 每次更新間隔（ms）；最小會限制為 1 ms。 |

```python
m.servo_move_to(150, step=3, period=40)
m.run_forever()
```

`step` 越小、`period` 越大，通常移動越平滑但越慢。這是 Scheduler 動作，High-Level MicroPython 需持續執行 event loop。

## `servo_sweep()`

```python
m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)
```

讓 Servo 在最小與最大角度之間持續來回掃動。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `min_angle` | `0` | 掃動下限角度。 |
| `max_angle` | `180` | 掃動上限角度，必須大於 `min_angle`。 |
| `step` | `5` | 每次增加／減少的角度。 |
| `period` | `50` | 更新間隔（ms）。 |

```python
m.servo_sweep(30, 150, step=5, period=80)
m.run_forever()
```

若 `min_angle >= max_angle` 會拋出 `ValueError`。

## `servo_stop()`

```python
m.servo_stop()
```

停止 `servo_sweep()` 建立的持續掃動工作。它不是 `servo_release()`：停止 sweep 後仍可能維持 Servo PWM。

## `servo_get_angle()`

```python
angle = m.servo_get_angle()
```

要求 Runtime 回報目前／最近 Servo 角度，MicroPython direct mode 會回傳 `last_servo_angle`。

```python
print(m.servo_get_angle())
```

若尚未取得有效角度，可能回傳 `None`。

## `servo_release()`

```python
m.servo_release()
```

釋放 Servo PWM 輸出。適合不再需要保持角度、希望停止持續輸出 PWM 的情境。

> 釋放 PWM 後 Servo 是否仍物理維持原角度，會受 Servo 機構與負載影響，不應把它當成「回到 0 度」。

## Execution lifecycle

| API | 行為 | `m.run_forever()` |
|---|---|---:|
| `servo()` | 立即設定角度 | 不需要 |
| `servo_move_to()` | Scheduler 分段移動 | 需要 |
| `servo_sweep()` | Scheduler 持續掃動 | 需要 |
| `servo_stop()` / `servo_release()` | 立即命令 | 不需要 |

## 完整範例

```python
from mangobox import Mango

m = Mango()

m.servo(30)
m.servo_move_to(150, step=4, period=50)
m.run_forever()
```

## 相關 API

`servo()`, `servo_move_to()`, `servo_sweep()`, `servo_stop()`, `servo_get_angle()`, `servo_release()`, `run_forever()`
