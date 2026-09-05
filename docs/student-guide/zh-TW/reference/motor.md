# Motor / Drive API Reference

```python
from mangobox import Mango
m = Mango()
```

## 車體移動

| API | 說明 |
| --- | --- |
| `forward(speed=70)` | 前進 |
| `backward(speed=70)` | 後退 |
| `pivot_left(speed=70)` | 左側樞軸轉向 |
| `pivot_right(speed=70)` | 右側樞軸轉向 |
| `spin_left(speed=70)` | 原地向左旋轉 |
| `spin_right(speed=70)` | 原地向右旋轉 |
| `arc_left(outer_speed=80, inner_speed=60)` | 左弧線 |
| `arc_right(outer_speed=80, inner_speed=60)` | 右弧線 |
| `drive_tank(left, right, assist=False)` | 左右輪獨立控制，值為 `-100..100` |
| `stop()` | 主動停止／煞停車體 |
| `coast()` | 讓車體自由滑行 |

一般 `speed` 會取絕對值並限制在 `0..100`。

## 單顆馬達

```python
motor_run(motor, speed)
motor_brake(motor)
motor_coast(motor)
```

`motor` 可使用 `M1`、`M2`，亦接受 `A/B`、`left/right` 相容別名；`speed` 為 `-100..100`。

## Capability

```python
m.supports('drive')
m.supports('motor')
```

Capability 表示目前 target/mode/config 有完整 Student API 路徑，不代表車輪機構、供電與接線一定正確。
