# Servo API Reference

## `servo()`

```python
servo(angle) -> None
```

將位置型 Servo 移到指定角度。

### Raises

`ValueError`：角度超出 Student API 允許範圍。

## `servo_move_to()`

```python
servo_move_to(angle, step=5, period=60) -> None
```

以多個步進逐漸移動到目標角度。

## `servo_sweep()`

```python
servo_sweep(min_angle=0, max_angle=180, step=5, period=50) -> None
```

啟動往返掃動。

### Raises

`ValueError`：角度或範圍無效。

## `servo_stop()`

```python
servo_stop() -> None
```

停止 sweep。

## `servo_get_angle()`

```python
servo_get_angle()
```

取得 Runtime／Student API 已知角度。不同 Programming Mode 的 reply timing 可能不同，因此線上文件必須依 mode/version 顯示。

## `servo_release()`

```python
servo_release() -> None
```

停止 Servo PWM 輸出。

## Execution lifecycle

| API | High Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `servo(angle)` / `servo_set_angle()` | Immediate，直接寫入目標 PWM 位置 | 不需要 |
| `servo_get_angle()` | local Runtime 回覆為同步路徑 | 不需要 |
| `servo_release()` | Immediate | 不需要 |
| `servo_move_to()` | 當已有目前角度時，以 Scheduler 分段移動 | 為確保漸進移動完成，需要 |
| `servo_sweep()` | 持續 Scheduler 掃動 | 需要 |
| `servo_stop()` | 立即移除 sweep 工作 | 不需要 |

注意：若 Servo 尚無目前角度，`servo_move_to()` 的實作可能直接寫入目標位置。因此測試「漸進移動」時，應先用 `servo()` 設定起始角度，再呼叫 `servo_move_to()`。

## Availability

Servo 是可設定模組；只有 resolver 判定 `servo` capability 可用時才顯示。

## Configuration

```text
enabled_modules.servo
servo_pin
servo_min_angle
servo_max_angle
servo_min_us
servo_max_us
```

## Example

```python
from mangobox import Mango

m = Mango()
m.servo(30)
m.servo_move_to(150, step=5, period=60)
m.run_forever()
```

## Related

`servo()`, `servo_move_to()`, `servo_sweep()`, `servo_stop()`, `servo_get_angle()`, `servo_release()`, `run_forever()`
