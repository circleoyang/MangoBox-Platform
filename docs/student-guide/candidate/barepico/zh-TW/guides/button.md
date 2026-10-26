# BarePico 外接按鈕

> 候選來源：BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26；來源核對不等於實機通過。

## 1. 可以做什麼與準備

讀取按鈕，或在按下／放開時回應。BarePico 不會替你假定板載按鈕或 GP3。DM 需啟用 `enabled_modules.button`，在 `buttons` 設定名稱、`pin`、`enabled`、`pull`、`active` 與 `debounce_ms`。以下入門程式要求剛好一顆啟用按鈕；多顆時請依實際名稱分別註冊。

## 2. 30 秒快速測試

連續讀取三秒，這段時間按下再放開按鈕。印出的數值是 Student API 的邏輯狀態。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("button", False):
    raise RuntimeError("Enable button in Device Manager first")
items = {name: spec for name, spec in m.config.get("buttons", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = None
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled buttons entry in Device Manager")
    name = next(iter(items))
spec = items[name]

try:
    print("Button:", name, "GPIO:", spec["pin"], "active:", spec.get("active", 1))
    for _ in range(30):
        print(m.read_sensor(name))
        time.sleep_ms(100)
finally:
    m.close()
```

## 3. 應該觀察到什麼

邏輯值 `1` 代表按下，`0` 代表放開。它不等於 GPIO 原始電位：接上拉時按下可能是 raw 0，但 Runtime 依 `active` 正規化成 1。快測的 read_sensor() 直接採樣，不等待去彈跳；背景 start_sensor() 掃描才使用去彈跳。讀值不變時先查 active 與接線，別先改 callback。

## 4. 常見用法

即時讀值用 `read_sensor(name)`；具名事件用 `on_pressed(name, callback)`、`on_released(name, callback)`。註冊後仍要 `start_sensor(name, period=...)` 並持續跑事件迴圈。只有一顆啟用按鈕時，`read_button()`／`start_button()` 才能可靠解析一般別名。start_sensor() 會先同步送出目前值，已按住的按鈕可能在 start 返回前觸發 pressed，因此先準備 callback 狀態。read_sensor() 也會同步派發已註冊的 callback，不要在事件模式旁高頻重讀。

## 5. 完整互動範例

按下計數器：callback（回呼函式）只記錄待處理事件，前景在 `run_once()` 返回後更新計數與顯示。這是短 callback 的基本做法；在後續整合燈效或音樂時也維持這個結構。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("button", False):
    raise RuntimeError("Enable button in Device Manager first")
items = {name: spec for name, spec in m.config.get("buttons", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = None
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled buttons entry in Device Manager")
    name = next(iter(items))
spec = items[name]

pending = None
count = 0

def pressed():
    global pending
    pending = "pressed"

def released():
    global pending
    pending = "released"

m.on_pressed(name, pressed)
m.on_released(name, released)
try:
    m.start_sensor(name, period=30)
    while True:
        m.run_once()
        if pending is not None:
            event = pending
            pending = None
            if event == "pressed":
                count += 1
            print(event, "press count:", count)
        time.sleep_ms(10)
finally:
    try:
        m.stop_sensor(name)
    finally:
        m.close()
```

## 6. 適用範圍與問題排除

本頁是 BarePico High-Level MicroPython v0.1.0-rc6 候選來源。`capabilities()` 不代表按鈕已配置，且沒有 `supports()`。

排錯：確認板型 → 總開關／具名 `enabled` → GPIO 和實際訊號腳 → `pull` 與 `active` → DM 設定及實際按壓。先跑快測；讀值會變但事件不動，再查 `start_sensor()`、名稱和事件迴圈。必要時停止 Mango 程式，另開 `machine.Pin` 最小讀值測試，使用相同 Pin 與 pull；不要同時啟動兩個 GPIO owner。按鈕腳位修改後重新啟動程式。

## 7. 小挑戰

新增放開次數，並檢查「按下、放開、再次按下」的順序。延伸兩顆按鈕時，用 `buttons` 中兩個真實名稱各註冊 callback；不要用一般 `button` 別名混在一起。

[API Reference](../reference/button.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
