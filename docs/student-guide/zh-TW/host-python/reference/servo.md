# Servo API Reference — Host Python

Host Python 與 High-Level MicroPython 使用同一組 learner-facing Servo method 名稱；命令由 PC 傳給 Runtime 執行。

## `servo()`

```python
m.servo(angle)
```

立即設定角度。

| 參數 | 範圍 | 說明 |
|---|---|---|
| `angle` | `0..180` | 目標角度（degree）。 |

```python
m.servo(90)
```

超出範圍會產生 `ValueError`。

## `servo_move_to()`

```python
m.servo_move_to(angle, step=5, period=60)
```

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `angle` | 必填 | 目標角度 `0..180`。 |
| `step` | `5` | 每次更新改變的角度。 |
| `period` | `60` | 更新間隔（ms）。 |

```python
m.servo_move_to(150, step=3, period=50)
```

持續動作由 Runtime Scheduler 執行，Host 不需要用自己的 loop 推進 Servo 動畫。

## `servo_sweep()`

```python
m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)
```

讓 Servo 在兩個角度間持續掃動。`min_angle` 必須小於 `max_angle`。

```python
m.servo_sweep(30, 150, step=5, period=80)
```

## `servo_stop()`

```python
m.servo_stop()
```

停止 sweep 工作，但不等同釋放 PWM。

## `servo_get_angle()`

```python
m.servo_get_angle()
```

取得目前 Host / Runtime contract 可回報的最近 Servo 角度資訊；若尚無有效值，可能得到 `None`。

## `servo_release()`

```python
m.servo_release()
```

釋放 Servo PWM。這不是「回到 0 度」。

## Capability

```python
print(m.supports("servo"))
```

實際可用性以 Host package + Runtime compatibility resolver、目前 Device Manager 設定與 target capability 為準。
