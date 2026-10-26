# BarePico 外接 RGB 燈條

> 候選來源：BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26；來源核對不等於實機通過。

## 1. 可以做什麼與準備

可以用顏色表示狀態、點亮指定燈珠，或播放 Runtime 內建燈效。BarePico 沒有 MangoX2／MangoLite 的板載燈條；Pico 板上的指示燈也不是這組 WS2812B API。先在 Device Manager（DM）啟用 `enabled_modules.led_strip`，建立 `led_strips` 內的具名燈條，確認每筆 `enabled`、`pin`、`leds` 與 `power`。多條燈條時由 DM 選好 `current_led_setting`。

## 2. 30 秒快速測試

接好指定燈條後執行。範例會讀取 DM 的名稱與燈珠數，以不高於設定值的 20% 亮度亮紅色一秒，再關燈。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("led_strip", False):
    raise RuntimeError("Enable led_strip in Device Manager first")
items = {name: spec for name, spec in m.config.get("led_strips", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_led_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled led_strips entry in Device Manager")
    name = next(iter(items))
spec = items[name]

try:
    m.brightness(min(20, spec.get("power", 50)), strip=name)
    m.led_all("red", strip=name)
    print("Strip:", name, "GPIO:", spec["pin"], "LEDs:", spec["leds"])
    time.sleep_ms(1000)
finally:
    m.led_off(strip=name)
    m.close()
```

## 3. 應該觀察到什麼

整條指定燈條應亮紅色，再熄滅；Shell 顯示本次採用的名稱、GPIO 與燈珠數。命令沒有例外不等於實體一定發光，請直接觀察。索引從 0 起算，最後一顆是 `leds - 1`。這份來源的 `led_clear()` 會停止該燈條效果／到期還原任務，並寫入全黑畫面；`led_off()` 也停止並清黑。

## 4. 常見用法

狀態燈可用 `led_all()`；局部顯示可用 `led(index, color, strip=name)` 或 `led_range()`。內建 `rainbow()`、`breath()` 等動態效果需要前景持續呼叫 `run_once()` 或使用 `run_forever()`；一次只選一種事件迴圈。`led_range(start, end, ...)` 包含兩端，start 大於 end 時會交換。靜態點燈的正 `duration` 會還原先前顏色；動畫到期只停止更新、保留最後畫面。切換效果前先對該 strip 使用 `led_off()`，清掉舊任務，不能假設新效果自動取消其他效果。自訂動畫請閱讀 Scheduler 指南，不要在 callback 裡重新進入 Scheduler。

## 5. 完整互動範例

此範例在 Shell 輸入 r／g／b／o 切換紅、綠、藍、熄滅，q 結束。顯示的是靜態顏色，因此等待鍵盤輸入期間沒有動畫需要推進。每次改色只送一次命令。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("led_strip", False):
    raise RuntimeError("Enable led_strip in Device Manager first")
items = {name: spec for name, spec in m.config.get("led_strips", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_led_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled led_strips entry in Device Manager")
    name = next(iter(items))
spec = items[name]

colors = {"r": "red", "g": "green", "b": "blue", "o": "off"}
try:
    m.brightness(min(20, spec.get("power", 50)), strip=name)
    while True:
        command = input("r / g / b / o / q: ").strip().lower()
        if command == "q":
            break
        if command in colors:
            m.led_all(colors[command], strip=name)
            print("Color:", colors[command])
finally:
    m.led_off(strip=name)
    m.close()
```

## 6. 適用範圍與問題排除

適用於 BarePico 三種目標的 High-Level MicroPython v0.1.0-rc6 候選來源；不代表 Host Python 或實機驗收。BarePico 沒有 `supports()`；`capabilities()` 只回傳板型身分，不代表外接模組已裝好。

排錯順序：先核對 profile → 模組總開關 → 該燈條 `enabled` → DM 的 GPIO 與實際 DIN 線 → 燈珠數 → 電源與共地。不要接到燈條 DOUT。修改 GPIO／燈珠數後停止程式並重新建立 `Mango()`；不要重用舊物件。多燈條卻沒有選定預設時，範例會明確停止，請在 DM 選好再試。

## 7. 小挑戰

把顏色表新增黃色 y；再以讀出的 `spec["leds"]` 算出最後一顆的位置，只讓那一顆發光。不要在程式硬寫「一定有 6 顆」或預設 GPIO。

[API Reference](../reference/led.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
