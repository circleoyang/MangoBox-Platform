# MangoLite Sound Sensor — API Reference

> 來源候選 Runtime 0.6.5-rc2；MangoLite + Pico W / Pico 2 W；High-Level MicroPython。來源核對與 Windows、實機驗收分開記錄；本頁沒有宣告新增 Host Python 支援。

## 設定、單位與模式

在 DM 啟用 `enabled_modules.sound_sensor`，以 `sound_sensor_pin` 設定實際 AO 類比輸入的 ADC GPIO 26、27 或 28，並檢查供電與共地。這個感測器與播放聲音的 Buzzer/DFPlayer 是不同模組。Runtime 使用取樣窗中的 peak-to-peak ADC 幅度，以及 `sound_noise_floor`、`sound_reference_level` 等設定，形成 0–100 相對聲音強度；數字不是校準後的 dB，也不能當法規聲級量測。

Lite 的 `on_sound_above` 和 `on_sound_below` **不接受 `period`**。只有下列 Change 方法提供自己的 period 參數，不能套用別的板型簽章。

## 方法、完整簽章與回傳

| 簽章 | 行為 | 回傳 |
| --- | --- | --- |
| `m.sound_level()` | 請求目前相對聲音強度 | `int`，0–100；未取得目前值時也回傳 `0` |
| `m.on_sound_above(threshold, callback, hysteresis=5)` | 聲音向上跨越門檻時通知 | `None` |
| `m.on_sound_below(threshold, callback, hysteresis=5)` | 聲音向下跨越門檻時通知 | `None` |
| `m.on_sound_change(callback, threshold=5, period=100)` | 與上次已通知值的差達門檻時通知 | `None` |
| `m.stop_sound_change()` | 停止 Change watcher | `None` |

讀到 `0` 可能是相對安靜，也可能尚未收到目前值；不能只靠它判定感測器連線成功。這組方法不接收感測器名稱。停止 Change watcher 不會取消既有 above/below watcher。

## 參數、事件與排程

| 參數 | 型別、範圍與預設 |
| --- | --- |
| above/below 的 `threshold` | 必填，可轉成數值的 0–100 相對聲音強度 |
| above/below 的 `hysteresis` | 可轉成數值的 0–100；預設 5 |
| above/below 的 `callback` | 必填 callable，以 `callback()` 通知 |
| Change 的 `callback` | 必填 callable，以 `callback(value)` 通知 |
| Change 的 `threshold` | 有限 `int/float`，大於 0 且不超過 100；預設 5 相對強度百分點 |
| Change 的 `period` | 整數毫秒，100–60000；預設 100，不接受布林值 |

Change 以「上次已送出」的值當比較基準，首次有效觀察會通知一次。門檻 watcher 的週期由 Lite facade/Runtime 處理；`sound_window_ms` 等硬體取樣設定由 DM/Runtime 維護，並不是 above/below 的 Student API keyword。合作式排程和取樣窗都可能延後通知，不適合作為精密時間戳記。

## 生命週期、錯誤與排錯

單次 `sound_level()` 不要求常駐 event loop。above/below 會建立 watcher，Change 另註冊 Scheduler 工作；主程式須持續 `run_once()` 或使用 `run_forever()` 才有後續事件。callback 只記錄值/旗標，前景再更新顯示或其他硬體；不要從 callback 重新進入 Scheduler。

停用模組會引發 `RuntimeError`，不可呼叫 callback 或錯誤參數型別會被拒絕；超出範圍的 threshold/hysteresis/Change period 會被拒絕。對 Lite above/below 傳入 `period=` 會引發 `TypeError`。排錯順序：profile/runtime → 模組與 ADC GPIO → 單次讀值 → event loop、門檻與校準 → AO 接線、共地、供電與感測器本體。

## 完整最小範例：十秒內顯示強度變化

```python
from mangobox import Mango
import time

m = Mango()
pending = None

def changed(value):
    global pending
    pending = value

try:
    if not m.config.get("enabled_modules", {}).get("sound_sensor", False):
        raise RuntimeError("Enable Sound Sensor in Device Manager")
    print("Configured ADC GPIO:", m.config.get("sound_sensor_pin"))
    m.on_sound_change(changed, threshold=5, period=100)
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < 10000:
        m.run_once()
        if pending is not None:
            value = pending
            pending = None
            print("relative sound, not dB:", value)
        time.sleep_ms(10)
finally:
    m.stop_sound_change()
    m.close()
```

在合理距離輕拍手，比較安靜與聲音出現時的相對差異。若原始訊號沒有改變，持續調整 Python 門檻無法修好接線；也不要逐輪印 log 或自行偽造 `@@MANGO_EVENT@@`。

## 相關閱讀與來源

[Sound Guide](../../../../zh-TW/guides/sound.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md) · [Scheduler](../../../shared/zh-TW/reference/scheduler.md)

來源：[student_api.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api.py)、[Change extension](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api_change_v1.py)、[Change 規則](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api_change_rules_v1.py)。
