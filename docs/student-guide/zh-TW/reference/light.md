# Light Sensor API Reference

> 本頁只應在 `light` capability 對選定 target/mode/version 成立時顯示。

## `light()`

```python
light() -> int
```

回傳 0～100 的相對亮度。這是校準後的語意值，不是 lux。

### Raises

`RuntimeError`：Light Sensor 未啟用。

## `on_light_above()`

```python
on_light_above(threshold, callback, hysteresis=5) -> None
```

亮度由低往上跨越 `threshold` 時執行 callback。

## `on_light_below()`

```python
on_light_below(threshold, callback, hysteresis=5) -> None
```

亮度由高往下跨越 `threshold` 時執行 callback。

`threshold` 與 `hysteresis` 都使用 0～100 語意範圍。

### Raises

`ValueError`：threshold 或 hysteresis 不在 0～100。

## Execution lifecycle

| API | High Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `light()` | Immediate，同步取得目前校準值 | 不需要 |
| `on_light_above()` / `on_light_below()` | 建立 threshold watcher 並啟動 sensor update；後續由 Scheduler 處理 | 需要 |

Light callback 會自行啟動 watcher，不需要額外 `start_sensor()`。如果 `light()` 讀值正常但 callback 不觸發，先確認 event loop、threshold 與 hysteresis。

## Configuration

```text
enabled_modules.light_sensor
light_sensor_pin
light_raw_bright
light_raw_dark
light_sample_count
light_period_ms
light_hysteresis
```

Bright/Dark calibration 屬 Device Manager／Runtime 維護責任，不是學生 API。

## Example

```python
from mangobox import Mango

m = Mango()

def dark():
    print("dark")

m.on_light_below(30, dark)
m.run_forever()
```

## Related

`light()`, `on_light_above()`, `on_light_below()`, `run_forever()`
