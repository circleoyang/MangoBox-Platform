# BarePico 超音波距離與近遠狀態 — API Reference

> 候選來源：v0.1.0-rc6；BarePico Pico / Pico W / Pico 2 W；High-Level MicroPython。這是來源核對，未宣告本輪 Windows 或實機驗收通過。

## 啟用、板型與模式

DM 啟用 `enabled_modules.ultrasonic_sensor`，在 `ultrasonic_sensors` 設定具名 enabled、Trigger/Echo。`trigger_pin/echo_pin` 與 DM 的短鍵 `trigger/echo` 都可用；兩組同時存在時值不可矛盾。samples 是整數 1–5（預設 3），timeout_us 是整數 1000–100000（預設 30000）。只有一顆且未選 current_ultrasonic_setting 時可唯一解析；多顆明確傳 sensor 或在 DM 選好。

BarePico 不退回 GP14/15。Echo 電壓須符合 Pico 輸入；5V Echo 模組先完成適當電位轉換。

## 方法、精確簽章與回傳

所有預設值以下列簽章為準；使用 `from mangobox import Mango` 與 `m = Mango()`。

| 簽章 | 用途 | 回傳 |
| --- | --- | --- |
| `m.distance(sensor=None)` | 單次讀取距離，明確處理 None。 | `float` cm 或 `None` |
| `m.is_near(distance_cm, sensor=None)` | 判斷有效讀值是否不大於門檻。 | `bool` |
| `m.on_distance_change(callback, threshold=2.0, period=150, sensor=None)` | 監看足夠幅度的距離變化。 | `None` |
| `m.on_far(distance_cm, callback, period=100, sensor=None)` | 進入遠端狀態時通知。 | `None` |
| `m.on_near(distance_cm, callback, period=100, sensor=None)` | 進入近端狀態時通知。 | `None` |
| `m.stop_distance_change(sensor=None)` | 只停止距離 change watcher。 | `None` |

## 參數型別、範圍與預設

| 參數 | 型別與規則 |
| --- | --- |
| `sensor` | 配置名稱 str 或 None；多顆時明確選定。 |
| `distance_cm` | is_near／near／far 經 float 轉換並檢查 >0；教學使用有限正值。兩方向同時註冊時 near < far，門檻單位 cm。 |
| `threshold` | change 的有限正數 int/float（bool、字串不接受），沒有額外數值上限；預設 2.0 cm，和最後一次已通知的中位數比較。 |
| `period`（change） | 嚴格整數 100–60000 ms，不接受 bool；預設 150。None 亦由 ChangeTracker 採預設，但教材明傳整數。 |
| `period`（near/far） | 經 int 後最少 60 ms，這條路徑沒有 change 的 60000 上限檢查；同一感測器保留較快的已註冊週期。 |
| `callback` | change 接收一個 float 公分值；near/far 無參數，皆須 callable。 |

## 事件與生命週期

`distance()` 使用配置的 samples 採樣，回傳四捨五入到 0.1 cm 的 float 或 None。驅動只保留 2.0–300.0 cm 的有效距離；沒有有效回波不是 0 cm。`is_near()` 固定用 3 次原始量測，回傳 bool；無效讀值是 False，所以 False 不能證明前方安全。

near/far 每次 poll 取一個原始樣本，累積三次有效值的中位數，依狀態轉換呼叫。初次中位數符合近／遠條件也會通知。兩門檻間保留現有近／遠狀態；無效值清空三樣本窗，不自動視為 far。

change 有兩層處理：每次先依 DM samples 由驅動取中位數，再由 ChangeTracker 累積三次有效結果。**第一個三結果中位數就通知一次**；其後與最後一次已通知值比較，差值 >= threshold 才通知。None 清空三結果窗但保留最後已通知值，恢復後不一定重新發 initial 事件。重註冊同一 sensor 的 change 會取消舊 watcher 並重設基準。

註冊／`stop_distance_change()` 回 None；stop 只取消 change，不取消 near/far。整體結束用 close。poll 可能因 60 ms 聲學間隔、samples 與 timeout 阻塞，不能把 period 當作保證的採樣完成週期；callback 不另做阻塞重讀。

## 錯誤與排查順序

未啟用／已關閉是 RuntimeError；名稱、GPIO、門檻順序與配置錯誤會拒絕。callback 非 callable 是 TypeError。ChangeTracker 對 threshold 的非數值／bool 與 period 非整數為 TypeError，非有限 threshold、非正 threshold 或 period 超界為 ValueError。near/far/is_near 的 float 轉換與比較不是相同嚴格驗證，請只提供有限正值。

一般 timeout／超出驅動距離範圍得到 None；硬體量測也可能拋 OSError 等例外，不保證所有失敗轉 None。change watcher 會略過讀取錯誤並重設樣本窗，主動 distance() 的錯誤仍可外拋。先查 profile、開關、具名設定與 DM pin，再做單顆快測，最後查電位、供電、物體角度與互擾。

## 可獨立執行的最小範例

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("ultrasonic_sensor", False):
        raise RuntimeError("Enable ultrasonic_sensor in Device Manager")
    group = m.config.get("ultrasonic_sensors", {})
    if not isinstance(group, dict):
        raise ValueError("Check the configured ultrasonic_sensors table")
    items = {key: value for key, value in group.items()
             if isinstance(value, dict) and value.get("enabled", False)}
    name = m.config.get("current_ultrasonic_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled ultrasonic_sensors entry in Device Manager")
        name = next(iter(items))
    spec = items[name]

    trigger = spec.get("trigger_pin", spec.get("trigger"))
    echo = spec.get("echo_pin", spec.get("echo"))
    print("Sensor:", name, "Trigger:", trigger, "Echo:", echo)
    for _ in range(4):
        value = m.distance(sensor=name)
        print("No valid echo" if value is None else str(value) + " cm")
        time.sleep_ms(250)
finally:
    m.close()
```

## 相關閱讀

[Guide](../guides/ultrasonic.md) · [Lifecycle](../../../shared/zh-TW/guides/lifecycle.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md)

## 核對來源與驗證

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/ultrasonic.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/ultrasonic.py)
- [runtime/mangox2-pico/firmware/mangox2/student_api_change_rules_v1.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/student_api_change_rules_v1.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

核對來源 SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`。本頁例子只經語法與來源契約檢查；沒有在本輪宣告實機 PASS。
