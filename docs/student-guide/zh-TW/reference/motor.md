# Motor / Drive API Reference

```python
from mangobox import Mango
m = Mango()
```

所有車體 speed 百分比都以 `0..100` 為主；單顆馬達 `motor_run()` 則用 `-100..100` 同時表示速度與方向。

## 車體移動 API

### `forward()` / `backward()`

```python
m.forward(speed=70)
m.backward(speed=70)
```

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `speed` | `70` | 車體速度百分比。一般會取絕對值並限制在 `0..100`。 |

```python
m.forward(40)
m.backward(25)
```

### `pivot_left()` / `pivot_right()`

```python
m.pivot_left(speed=70)
m.pivot_right(speed=70)
```

以單側輪組為主要動力做樞軸轉向。適合小半徑轉彎，但不是「原地旋轉」。

### `spin_left()` / `spin_right()`

```python
m.spin_left(speed=70)
m.spin_right(speed=70)
```

左右輪反向運轉，讓車體接近原地旋轉。

### `arc_left()` / `arc_right()`

```python
m.arc_left(outer_speed=80, inner_speed=60)
m.arc_right(outer_speed=80, inner_speed=60)
```

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `outer_speed` | `80` | 外側輪速度。 |
| `inner_speed` | `60` | 內側輪速度。 |

外側輪較快、內側輪較慢，因此走弧線而不是原地轉。

### `drive_tank()`

```python
m.drive_tank(left, right, assist=False)
```

左右輪獨立控制。

| 參數 | 型別／範圍 | 說明 |
|---|---|---|
| `left` | `-100..100` | 左側速度；正負值代表方向。 |
| `right` | `-100..100` | 右側速度；正負值代表方向。 |
| `assist` | `bool` | 是否使用目前 Runtime 提供的 drive assist 行為。預設 `False`。 |

```python
m.drive_tank(50, 50)     # 前進
m.drive_tank(-40, 40)    # 原地轉向
```

### `stop()` / `coast()`

```python
m.stop()
m.coast()
```

- `stop()`：主動停止／煞停車體。
- `coast()`：停止驅動後讓馬達自由滑行。

兩者物理結果不同。需要快速停止時使用 `stop()`；希望自然滑行時使用 `coast()`。

## 單顆馬達 API

### `motor_run()`

```python
m.motor_run(motor, speed)
```

| 參數 | 說明 |
|---|---|
| `motor` | `"M1"`、`"M2"`；亦接受 `A/B`、`left/right` 相容名稱。 |
| `speed` | `-100..100`。正負方向依目前 motor mapping；`0` 為停止輸出。 |

```python
m.motor_run("M1", 50)
m.motor_run("M2", -30)
```

### `motor_brake()` / `motor_coast()`

```python
m.motor_brake(motor)
m.motor_coast(motor)
```

分別對指定單顆馬達進行主動煞停或自由滑行。

## Capability

```python
print(m.supports("drive"))
print(m.supports("motor"))
```

`drive` 表示完整車體移動介面，`motor` 表示單顆馬達控制介面。Capability 成立只代表目前 target / mode / Runtime 有完整 Student API 路徑，不代表電池、馬達接線與機構一定正確。

## 完整範例

```python
from mangobox import Mango
import time

m = Mango()
m.forward(40)
time.sleep(1)
m.spin_left(35)
time.sleep(0.5)
m.stop()
```

## 相關 API

`forward()`, `backward()`, `pivot_left()`, `pivot_right()`, `spin_left()`, `spin_right()`, `arc_left()`, `arc_right()`, `drive_tank()`, `stop()`, `coast()`, `motor_run()`, `motor_brake()`, `motor_coast()`
