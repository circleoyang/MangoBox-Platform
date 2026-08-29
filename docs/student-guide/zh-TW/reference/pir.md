# PIR Motion API Reference

> 本頁只應在文件 resolver 確認 `motion` capability 可用時顯示。不能因 `pir_sensor_pin` 存在就自動公開。

## `is_motion_detected()`

```python
is_motion_detected() -> bool
```

立即讀取 PIR 目前語意狀態。

### Returns

- `True`：目前偵測到移動。
- `False`：目前未偵測到移動。

### Raises

`RuntimeError`：PIR module 未啟用。

## `on_motion_detected()`

```python
on_motion_detected(callback) -> None
```

從未偵測狀態跨越到偵測狀態時執行 callback（回呼函式）。

## `on_motion_cleared()`

```python
on_motion_cleared(callback) -> None
```

回到未偵測狀態時執行 callback。

## Execution lifecycle

| API | High Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `is_motion_detected()` | Immediate，同步讀取目前狀態 | 不需要 |
| `on_motion_detected()` / `on_motion_cleared()` | 自動啟動 PIR watcher，後續 sensor update 由 Scheduler 執行 | 需要 |

PIR callback 會自行啟動 watcher，不需要額外的 `start_sensor()`。如果直接讀值正常但 callback 沒反應，先確認 event loop 有持續執行。

## Configuration

```text
enabled_modules.pir_sensor
pir_sensor_pin
```

## Troubleshooting contract

```text
supports("motion")
→ module enablement
→ pir_sensor_pin
→ Device Manager（若目前版本提供對應 Live Read）
→ minimal machine.Pin raw diagnostic
→ physical Signal / VCC / GND wiring
```

Hardware Lab 只在問題屬於 firmware、execution mode、Recovery、Clean Flash 或其他裝置生命週期異常時進場；目前不是一般 PIR digital-input 測試器。

## Example

```python
from mangobox import Mango

m = Mango()

def detected():
    print("motion")

m.on_motion_detected(detected)
m.run_forever()
```

## Related

`is_motion_detected()`, `on_motion_detected()`, `on_motion_cleared()`, `run_forever()`
