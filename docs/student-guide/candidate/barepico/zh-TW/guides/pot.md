# BarePico 電位器

> 候選來源：BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26；來源核對不等於實機通過。

## 1. 可以做什麼與準備

把旋鈕位置讀成 0～100%，或在位置改變時觸發事件。DM 需啟用 `enabled_modules.potentiometer`，於 `potentiometers` 設定名稱、`enabled`、ADC `pin`、校準範圍及 `invert`，多顆時選好 `current_pot_setting`。訊號腳須是已配置的 GP26／GP27／GP28。

## 2. 30 秒快速測試

在兩秒讀值期間轉動旋鈕。程式會同時顯示百分比與 ADC 縮放原始值；兩者是分次取樣，不保證同一瞬間。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("potentiometer", False):
    raise RuntimeError("Enable potentiometer in Device Manager first")
items = {name: spec for name, spec in m.config.get("potentiometers", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_pot_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled potentiometers entry in Device Manager")
    name = next(iter(items))
spec = items[name]

try:
    print("Pot:", name, "GPIO:", spec["pin"])
    for _ in range(20):
        print("percent:", m.pot(name), "raw:", m.pot_raw(name))
        time.sleep_ms(100)
finally:
    m.close()
```

## 3. 應該觀察到什麼

百分比應在 0～100 之間變動；raw 是 0～65535 的縮放讀值，不代表 ADC 具有實際 16-bit 精度。`pot_voltage()` 是估計電壓；`supply` 參數不會改變接線的電氣安全。方向相反先確認 DM 的 `invert`；百分比卡在邊界則檢查校準。

## 4. 常見用法

用 `pot(name)` 取得位置；`on_pot_change()` 適合只在變化夠大時更新作品。BarePico 此來源會在第一次有效取樣先呼叫一次 `changed(value)`，之後與上一次送出的值比較。門檻事件 `on_pot_above()`／`on_pot_below()` 的 callback 不帶參數，首次讀值只建立跨越基準。

## 5. 完整互動範例

三段旋鈕選擇器：變化至少 3 個百分點才通知，callback 只保存新值，主迴圈將它分成 LOW／MID／HIGH。沒有每次輪詢都印出訊息。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("potentiometer", False):
    raise RuntimeError("Enable potentiometer in Device Manager first")
items = {name: spec for name, spec in m.config.get("potentiometers", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_pot_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled potentiometers entry in Device Manager")
    name = next(iter(items))
spec = items[name]

pending = None

def changed(value):
    global pending
    pending = value

m.on_pot_change(changed, threshold=3, period=100, name=name)
try:
    while True:
        m.run_once()
        if pending is not None:
            value = pending
            pending = None
            band = "LOW" if value < 33 else "MID" if value < 67 else "HIGH"
            print("Knob:", value, "%", band)
        time.sleep_ms(10)
finally:
    m.stop_pot(name)
    m.close()
```

## 6. 適用範圍與問題排除

只適用於 BarePico High-Level MicroPython v0.1.0-rc6 候選來源。未宣稱這是 carrier／Host 的相同回傳或首次事件行為。

排錯：profile → Pot 總開關與具名 `enabled` → ADC GPIO／滑動端訊號線 → DM 校準與反向 → VCC／GND。ADC 訊號不可直接承受 5V 或 12V；依 Pico 支援的電壓範圍接線。需要看原始訊號時，停止主程式後另用 `machine.ADC(pin).read_u16()` 讀取同一個配置腳；不要一邊改 DM 設定一邊保留舊 Mango 物件。

## 7. 小挑戰

將變化門檻改成 1 和 5，觀察安靜程度與反應速度。再加入上下門檻和遲滯（hysteresis），避免旋鈕在分界附近來回跳動。

[API Reference](../reference/pot.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
