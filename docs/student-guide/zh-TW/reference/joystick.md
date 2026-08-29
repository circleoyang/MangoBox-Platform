# Joystick API Reference

> 本頁只應在 `joystick` capability 對選定 target/mode/version 成立時顯示。

## `joystick()`

```python
joystick() -> tuple[int, int]
```

回傳 `(x, y)`，兩軸皆約為 -100～100。中心位置通常經 deadzone 處理為 0。

### Raises

`RuntimeError`：Joystick／PS2 module 未啟用。

## `is_joystick_pressed()`

```python
is_joystick_pressed() -> bool
```

回傳搖桿按鍵是否按下。

## `on_joystick_pressed()`

```python
on_joystick_pressed(callback, period=50) -> None
```

## `on_joystick_released()`

```python
on_joystick_released(callback, period=50) -> None
```

## `calibrate_joystick()`

```python
calibrate_joystick(samples=16)
```

重新取得中心位置；執行時搖桿應保持放開。

## Execution lifecycle

| API | High Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `joystick()` | Immediate，同步讀取 X/Y | 不需要 |
| `is_joystick_pressed()` | Immediate，同步讀取 SW 狀態 | 不需要 |
| `calibrate_joystick()` | 一次性的同步校正命令 | 不需要 |
| `on_joystick_pressed()` / `on_joystick_released()` | 自動啟動 Joystick watcher，後續 update 由 Scheduler 執行 | 需要 |

Joystick callback 會自行啟動 watcher，不需要額外 `start_sensor()`。如果 polling 值正常但 callback 不執行，先確認 event loop 有持續執行。

## Configuration

```text
enabled_modules.ps2
ps2_vrx_pin
ps2_vry_pin
ps2_sw_pin
ps2_deadzone
ps2_center_x
ps2_center_y
ps2_span_x
ps2_span_y
ps2_swap_xy
```

## Example

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("pressed")

m.on_joystick_pressed(pressed)
m.run_forever()
```

## Related

`joystick()`, `is_joystick_pressed()`, `on_joystick_pressed()`, `on_joystick_released()`, `calibrate_joystick()`, `run_forever()`
