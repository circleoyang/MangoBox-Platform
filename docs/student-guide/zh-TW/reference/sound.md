# Sound Sensor API Reference

> 本頁只應在 `sound_level` capability 對選定 target/mode/version 成立時顯示。

## `sound_level()`

```python
sound_level() -> int
```

回傳 0～100 的相對聲音強度。這不是 dB。

目前語意值以 sampling window 中的 peak-to-peak ADC 幅度正規化。

### Raises

`RuntimeError`：Sound Sensor 未啟用。

## `on_sound_above()`

```python
on_sound_above(threshold, callback, hysteresis=5) -> None
```

聲音強度往上跨越 threshold 時執行 callback。

## `on_sound_below()`

```python
on_sound_below(threshold, callback, hysteresis=5) -> None
```

聲音強度往下跨越 threshold 時執行 callback。

### Raises

`ValueError`：threshold 或 hysteresis 不在 0～100。

## Execution lifecycle

| API | High Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `sound_level()` | Immediate，同步進行一次目前聲音強度讀取 | 不需要 |
| `on_sound_above()` / `on_sound_below()` | 建立 threshold watcher 並啟動週期採樣；後續由 Scheduler 執行 | 需要 |

Sound callback 會自行啟動 watcher，不需要額外 `start_sensor()`。如果直接讀值會變但 callback 不觸發，先確認 event loop、threshold、hysteresis 與 sampling window。

## Configuration

```text
enabled_modules.sound_sensor
sound_sensor_pin
sound_noise_floor
sound_reference_level
sound_window_ms
sound_period_ms
sound_hysteresis
```

Quiet/Reference calibration 屬 Device Manager／Runtime 維護責任。

## Example

```python
from mangobox import Mango

m = Mango()

def loud():
    print("loud")

m.on_sound_above(60, loud)
m.run_forever()
```

## Related

`sound_level()`, `on_sound_above()`, `on_sound_below()`, `run_forever()`
