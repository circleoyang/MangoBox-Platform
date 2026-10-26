# BarePico 光線百分比與明暗門檻 — API Reference

> 候選來源：v0.1.0-rc6；BarePico Pico / Pico W / Pico 2 W；High-Level MicroPython。這是來源核對，未宣告本輪 Windows 或實機驗收通過。

## 啟用、板型與模式

DM 啟用 `enabled_modules.light_sensor`，明確設定 `light_sensor_pin` 為 GP26/27/28。校正需滿足 `0 <= light_raw_bright < light_raw_dark <= 65535`；`light_sample_count` 為 1–32。BarePico 使用單一配置的光線輸入，不接受 carrier 的具名或變化事件延伸參數。

## 方法、精確簽章與回傳

所有預設值以下列簽章為準；使用 `from mangobox import Mango` 與 `m = Mango()`。

| 簽章 | 用途 | 回傳 |
| --- | --- | --- |
| `m.light()` | 讀取校正後亮度百分比。 | `int` 0–100 |
| `m.on_light_above(threshold, callback, hysteresis=5, period=100)` | 註冊向亮端跨越門檻。 | `None` |
| `m.on_light_below(threshold, callback, hysteresis=5, period=100)` | 註冊向暗端跨越門檻。 | `None` |
| `m.stop_light()` | 停止光線門檻監看。 | `None` |

## 參數型別、範圍與預設

| 參數 | 型別與規則 |
| --- | --- |
| `threshold` | 可轉成數值的 0–100 門檻；與 light() 同為校正後百分比。 |
| `hysteresis` | 0–100，預設 5；避免門檻附近反覆觸發。 |
| `period` | 整數 20–10000 ms；兩方向共用一個感測排程。 |
| `callback` | 零參數 callable。請傳函式本身。 |

## 事件與生命週期

`light()` 回傳 0=暗、100=亮的 int，不是 lux。其來源先平均 sample_count 次 ADC，再依 raw_bright/raw_dark 線性反向映射、限制於 0–100 並取整。它是一次新的採樣，不需要先啟動 watcher。

above/below 註冊使用零參數 callback。每次註冊都重新配置兩方向 tracker、立即讀取 baseline，不因初始位置發出跨越事件；**最後一次註冊的 period 控制共用 task**，不是兩個各自獨立週期。之後 above 在由未啟動狀態到 `value >= threshold` 時通知，等 `value <= threshold - hysteresis` 清除；below 對稱為 `<= threshold` 通知、`>= threshold + hysteresis` 清除。hysteresis=0 時清除條件改用嚴格另一側，等於門檻不反覆清除。

`stop_light()` 回 None，停止 task 與 tracker，但保留已註冊 callback／門檻配置及 ADC 物件；再註冊會建立新 baseline。結束用 close。BarePico 沒有 `on_light_change()`／`stop_light_change()`，不可套用 Carrier 的延伸簽章。

## 錯誤與排查順序

未啟用／已關閉或使用後改變配置會有 `RuntimeError`。ADC pin、校正、樣本數、門檻與週期不合法為 `ValueError`；callback 不是 callable 為 `TypeError`。排錯先看模組能力與開關，再看 ADC pin 和 DM 校正，最後比對感測器方向與實際明暗。

## 可獨立執行的最小範例

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("light_sensor", False):
        raise RuntimeError("Enable light_sensor in Device Manager")
    pin_no = m.config.get("light_sensor_pin")
    if type(pin_no) is not int:
        raise ValueError("Configure light_sensor_pin in Device Manager")

    print("Light GPIO:", pin_no)
    print("Relative brightness:", m.light())
finally:
    m.close()
```

## 相關閱讀

[Guide](../guides/light.md) · [Lifecycle](../../../shared/zh-TW/guides/lifecycle.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md)

## 核對來源與驗證

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangolite-pico2w/firmware/mangolite/devices/light.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/devices/light.py)
- [runtime/mangolite-pico2w/firmware/mangolite/sensor_core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/sensor_core.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

核對來源 SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`。本頁例子只經語法與來源契約檢查；沒有在本輪宣告實機 PASS。
