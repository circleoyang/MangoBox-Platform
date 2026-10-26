# BarePico 具名 RGB 燈條 — API Reference

> 候選來源：v0.1.0-rc6；BarePico Pico / Pico W / Pico 2 W；High-Level MicroPython。這是來源核對，未宣告本輪 Windows 或實機驗收通過。

## 啟用、板型與模式

DM 啟用 `enabled_modules.led_strip`，在 `led_strips` 建立具名且 `enabled=true` 的外接燈條，填寫實際 `pin`、`leds` 與 `power`。`leds` 是 1–256，`power` 是 0–100。指定 `strip` 時使用設定中的名稱；省略時採已選名稱、`current_led_setting`，或唯一啟用的燈條。多條且無有效選擇會失敗，沒有板載 RGB 預設腳。

## 方法、精確簽章與回傳

所有預設值以下列簽章為準；使用 `from mangobox import Mango` 與 `m = Mango()`。

| 簽章 | 用途 | 回傳 |
| --- | --- | --- |
| `m.breath(color='#ff00ff', period=50, duration=0, strip=None)` | 單色呼吸。 | `None` |
| `m.brightness(power=30, duration=0, strip=None)` | 設定亮度百分比。 | `None` |
| `m.led(index, color='#ffffff', duration=0, strip=None)` | 點亮單顆。 | `None` |
| `m.led_all(color='#ffffff', duration=0, strip=None)` | 整條設為同色。 | `None` |
| `m.led_clear(strip=None)` | 停止該燈條全部效果／還原任務，並清黑。 | `None` |
| `m.led_off(strip=None)` | 停止效果並熄燈。 | `None` |
| `m.led_range(start, end, color='#ffffff', duration=0, strip=None)` | 設定含兩端的燈號範圍。 | `None` |
| `m.led_set_brightness(power=30, duration=0, strip=None)` | brightness 的別名。 | `None` |
| `m.led_show_all(color='#ffffff', duration=0, strip=None)` | led_all 的別名。 | `None` |
| `m.led_show_one(index, color='#ffffff', duration=0, strip=None)` | led 的明確名稱別名。 | `None` |
| `m.led_show_range(start, end, color='#ffffff', duration=0, strip=None)` | led_range 的別名。 | `None` |
| `m.led_start_breathing(color='#ff00ff', period=50, duration=0, strip=None)` | breath 的別名。 | `None` |
| `m.led_start_color_wipe(colors=None, period=50, duration=0, strip=None)` | 以顏色序列逐步填色。 | `None` |
| `m.led_start_fire_flicker(color='#ff6600', period=50, duration=0, strip=None)` | 火焰閃動效果。 | `None` |
| `m.led_start_meteor(color='#ffffff', size=5, period=50, duration=0, strip=None)` | 依 size 顯示流星。 | `None` |
| `m.led_start_rainbow(period=20, duration=0, strip=None)` | rainbow 的明確名稱。 | `None` |
| `m.led_start_random_sparkle(color='#ffffff', period=50, duration=0, strip=None)` | 隨機閃點效果。 | `None` |
| `m.led_turn_off(strip=None)` | led_off 的別名。 | `None` |
| `m.rainbow(period=20, duration=0, strip=None)` | 彩虹效果。 | `None` |
| `m.select_led_strip(strip=None)` | 選擇後續省略 strip 時的燈條。 | `str` 名稱 |

## 參數型別、範圍與預設

| 參數 | 型別與規則 |
| --- | --- |
| `strip` | `str` 或 `None`；具名燈條，不是 GPIO 編號。 |
| `index / start / end` | Facade 先轉成整數，再驗證 `0 <= index < leds`。範圍**包含兩端**；`start > end` 時驅動交換兩端。 |
| `color` | 支援的色名或 `#RRGGBB` 字串，例如 `red`、`#00ff00`；不是 RGB tuple。 |
| `power` | 轉成整數後 0–100%；DM 內的 `power` 本身須為整數。這不是供電電流量測。 |
| `period` | 轉成整數後 20–10000 ms；預設值依效果簽章。 |
| `duration` | 轉成整數後 0–120000 ms；0 不安排新的到期處理。正值的還原／停止規則見下表；驅動排程至少 20 ms。 |
| `colors` | `None` 採 red/green/blue；或由 1–32 個有效色彩組成的序列，Facade 轉成 list。 |
| `size` | 轉成整數後 1–燈條總數。預設 5 不適用少於 5 顆的燈條，需明傳較小值。 |

## 事件與生命週期

`select_led_strip()` 回傳選定的名稱，其餘本頁包裝方法回傳 `None`。底層命令內部的 True 不會從這些包裝方法傳回。回傳不是實體發光確認。

| 操作 | 正值 `duration` 到期時的行為 |
| --- | --- |
| `led()`／`led_show_one()` | 還原該顆呼叫前的顏色 |
| `led_all()`／`led_range()` 及其別名 | 還原呼叫前儲存的整條畫面；可能覆蓋之後其他操作的畫面 |
| `brightness()`／`led_set_brightness()` | 還原呼叫前亮度 |
| 各動畫效果 | 只停止該效果的更新任務，保留最後畫面；不自動熄燈 |

**這份來源的 `led_clear()` 會取消該燈條全部效果／還原任務，並寫入全黑畫面。** 它呼叫的 canonical `BoardRGB.stop_all_effects()` 最後會 `clear()`。`led_off()` 也停止並清黑；二者都不是硬體狀態回執。

靜態立即設色不需要事件迴圈；動畫及正 duration 的還原／停止需要 `run_once()` 或 `run_forever()`。同一燈條的不同動畫會各自持有任務，不應當作自動可混合的效果。切換前先對該 `strip` 呼叫 `led_off()`，再啟動下一個效果，避免舊動畫／還原／停止任務干擾。`duration=0` 不會替你取消過去已安排的到期任務。不要用共享 Scheduler 的 clear 取消燈效。

## 錯誤與排查順序

模組未啟用、物件已關閉、已使用的 GPIO／燈數改變或 NeoPixel 支援不存在會有 `RuntimeError`；名稱、GPIO、燈數、顏色、索引或時間不合法會有 `ValueError`，轉型／非可迭代顏色等也可能有 `TypeError`。先查目標、模組與具名開關、DM pin/count，再用單色檢查接線、供電與共地。修改 GPIO／燈數後重建 Mango。

## 可獨立執行的最小範例

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("led_strip", False):
        raise RuntimeError("Enable led_strip in Device Manager")
    group = m.config.get("led_strips", {})
    if not isinstance(group, dict):
        raise ValueError("Check the configured led_strips table")
    items = {key: value for key, value in group.items()
             if isinstance(value, dict) and value.get("enabled", False)}
    name = m.config.get("current_led_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled led_strips entry in Device Manager")
        name = next(iter(items))
    spec = items[name]

    count = spec.get("leds")
    if type(count) is not int or not 1 <= count <= 256:
        raise ValueError("Configured leds must be an integer from 1 to 256")
    m.brightness(min(20, spec.get("power", 50)), strip=name)
    m.led_all("blue", strip=name)
    last = min(2, count - 1)
    m.led_range(0, last, "red", duration=300, strip=name)
    print("Inclusive red range: 0 to", last, "; then restore blue")
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < 600:
        m.run_once()
        time.sleep_ms(10)
finally:
    m.close()
```

## 相關閱讀

[Guide](../guides/led.md) · [Lifecycle](../../../shared/zh-TW/guides/lifecycle.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md)

## 核對來源與驗證

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/rgb.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/rgb.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

核對來源 SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`。本頁例子只經語法與來源契約檢查；沒有在本輪宣告實機 PASS。
