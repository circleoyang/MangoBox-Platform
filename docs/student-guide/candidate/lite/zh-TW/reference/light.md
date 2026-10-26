# MangoLite Light Sensor — API Reference

> 來源候選 Runtime 0.6.5-rc2；MangoLite + Pico W / Pico 2 W；High-Level MicroPython。這份文件依指定來源核對，不代表已公開發布或通過實機驗收。

## 設定、模式與單位

在 Device Manager（DM）啟用 `enabled_modules.light_sensor`，確認 `light_sensor_pin` 是實際接線的 ADC GPIO 26、27 或 28，且沒有腳位衝突。讀值由 Runtime 校準，`0` 表示相對暗端、`100` 表示相對亮端；單位不是 lux。DM 的 `light_raw_dark`、`light_raw_bright` 等校準設定不應在學生程式中另做一套換算。

MangoLite 的 above/below 門檻方法只接收三個參數，**沒有 `period` 參數**。Change callback 的 `period` 是另一個方法的參數，不能套用到 above/below。這些簽章不替代 Host Python 或其他板型的合約。

## 方法、完整簽章與回傳

| 簽章 | 行為 | 回傳 |
| --- | --- | --- |
| `m.light()` | 請求目前校準值 | `int`，0–100；未收到目前值時也回傳 `0` |
| `m.on_light_above(threshold, callback, hysteresis=5)` | 向上跨過門檻時通知 | `None` |
| `m.on_light_below(threshold, callback, hysteresis=5)` | 向下跨過門檻時通知 | `None` |
| `m.on_light_change(callback, threshold=2, period=100)` | 與上次已通知值相差達門檻時通知 | `None` |
| `m.stop_light_change()` | 停止 Change watcher | `None` |

`light()` 的 `0` 無法單獨證明環境真的黑暗，也無法證明接線正常。不要以讀到 `0` 當作已完成硬體驗收。Change watcher 不提供具名感測器參數；`stop_light_change()` 不會取消已註冊的 above/below 門檻 watcher。

## 參數與 callback

| 參數 | 型別、範圍與預設 |
| --- | --- |
| above/below 的 `threshold` | 必填；可轉成數值的 0–100 相對亮度 |
| above/below 的 `hysteresis` | 可轉成數值的 0–100；預設 5，用來減少門檻附近反覆觸發 |
| above/below 的 `callback` | 必填、可呼叫；形式是 `callback()`，不帶參數 |
| Change 的 `callback` | 必填、可呼叫；形式是 `callback(value)` |
| Change 的 `threshold` | 有限 `int/float`，大於 0 且不超過 100；預設 2，單位是相對亮度百分點 |
| Change 的 `period` | 整數毫秒，50–60000；預設 100，不接受布林值 |

Change 比較的是上次「已送出 callback」的數值，首次有效觀察會送出一次。週期是合作式排程的要求，不是即時執行保證。門檻事件與 Change 事件的 callback 參數數量不同，不能交換使用。

## 生命週期與錯誤

單次 `light()` 不需要常駐事件迴圈。above/below 會建立所需 watcher，Change 會註冊自己的 Scheduler 工作；要持續通知，主程式須服務 `m.run_once()` 或使用 `m.run_forever()`。不要在 callback 中再呼叫 `run_once()` 或進行複雜燈效切換，先記錄待辦值，再由前景處理。

模組未啟用會引發 `RuntimeError`。callback 不可呼叫會引發 `TypeError`；threshold、hysteresis 或 Change period 超出規則會被拒絕。將 `period=` 傳入 Lite 的 above/below 會造成 `TypeError`。依序檢查 target/runtime、模組與 GPIO、單次讀值、事件迴圈與門檻，再查供電、接線和感測器。

## 完整最小範例：只在亮度改變時顯示

```python
from mangobox import Mango
import time

m = Mango()
pending = None

def changed(value):
    global pending
    pending = value

try:
    if not m.config.get("enabled_modules", {}).get("light_sensor", False):
        raise RuntimeError("Enable Light Sensor in Device Manager")
    print("Configured ADC GPIO:", m.config.get("light_sensor_pin"))
    m.on_light_change(changed, threshold=2, period=100)
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < 10000:
        m.run_once()
        if pending is not None:
            value = pending
            pending = None
            print("relative light:", value)
        time.sleep_ms(10)
finally:
    m.stop_light_change()
    m.close()
```

預期前景先顯示一次有效觀察，再於相對亮度變化至少 2 點時顯示；不要逐次輪詢都新增 log，也不要自行印出 `@@MANGO_EVENT@@` 記錄。

## 相關閱讀與來源

[Light Guide](../../../../zh-TW/guides/light.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md) · [Scheduler](../../../shared/zh-TW/reference/scheduler.md)

來源：[student_api.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api.py)、[student_api_change_v1.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api_change_v1.py)、[Change 規則](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api_change_rules_v1.py)。
