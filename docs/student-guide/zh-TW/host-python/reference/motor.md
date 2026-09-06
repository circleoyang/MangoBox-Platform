# Motor / Drive API Reference — Host Python

Host Python 與 High-Level MicroPython 共用車體／單顆馬達 method 名稱。PC 只送出 Student API 命令，不直接操作 `machine.Pin`。

## 車體移動

```python
m.forward(speed=70)
m.backward(speed=70)
m.pivot_left(speed=70)
m.pivot_right(speed=70)
m.spin_left(speed=70)
m.spin_right(speed=70)
m.arc_left(outer_speed=80, inner_speed=60)
m.arc_right(outer_speed=80, inner_speed=60)
m.drive_tank(left, right, assist=False)
m.stop()
m.coast()
```

一般 `speed` 為 `0..100` 百分比。`drive_tank(left, right)` 使用 `-100..100`，正負值同時表示方向。

```python
m.forward(40)
m.drive_tank(-30, 30)
m.stop()
```

- `stop()`：主動煞停。
- `coast()`：停止驅動後自由滑行。
- `pivot_*()`：樞軸轉向。
- `spin_*()`：左右輪反向、接近原地旋轉。
- `arc_*()`：內外輪不同速度走弧線。

## 單顆馬達

```python
m.motor_run(motor, speed)
m.motor_brake(motor)
m.motor_coast(motor)
```

| 參數 | 說明 |
|---|---|
| `motor` | `M1` / `M2`，亦接受目前相容 contract 的 `A/B`、`left/right` 別名。 |
| `speed` | `-100..100`。 |

```python
m.motor_run("M1", 50)
m.motor_brake("M1")
```

## Capability

```python
print(m.supports("drive"))
print(m.supports("motor"))
```

Capability 成立不代表電池、馬達接線與車體機構一定正確；硬體診斷請搭配 Device Manager / Hardware Lab。
