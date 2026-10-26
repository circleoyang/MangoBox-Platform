# BarePico 超音波測距

> 候選來源：BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26；來源核對不等於實機通過。

## 1. 可以做什麼與準備

量測距離，或在靠近／遠離門檻時通知程式。DM 需啟用 `enabled_modules.ultrasonic_sensor`，在 `ultrasonic_sensors` 配置具名感測器的 `enabled`、`trigger_pin`、`echo_pin`、`samples` 等設定，多顆時選定 `current_ultrasonic_setting`。DM 的 `trigger/echo` 短鍵也可用，和 `trigger_pin/echo_pin` 同時存在時值需一致。BarePico 沒有固定 Trigger/Echo 預設腳。

## 2. 30 秒快速測試

把平整物體移近、移遠，觀察十次距離讀值。Echo 訊號須符合 Pico 的輸入電壓；使用會輸出 5V Echo 的模組時，先完成合適的電位轉換，不能直接接 Pico GPIO。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("ultrasonic_sensor", False):
    raise RuntimeError("Enable ultrasonic_sensor in Device Manager first")
items = {name: spec for name, spec in m.config.get("ultrasonic_sensors", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_ultrasonic_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled ultrasonic_sensors entry in Device Manager")
    name = next(iter(items))
spec = items[name]

try:
    trigger = spec.get("trigger_pin", spec.get("trigger"))
    echo = spec.get("echo_pin", spec.get("echo"))
    print("Sensor:", name, "Trigger:", trigger, "Echo:", echo)
    for _ in range(10):
        value = m.distance(sensor=name)
        print("No valid echo" if value is None else str(value) + " cm")
        time.sleep_ms(150)
finally:
    m.close()
```

## 3. 應該觀察到什麼

有效讀值是 2.0～300.0 cm 範圍內、取至 0.1 cm 的 float，無有效回波時可能是 `None`；硬體錯誤也可能拋例外。`None` 代表資料無效，不等於 0 cm，也不能直接視為前方安全。`is_near()` 在無讀值時回傳 False，因此安全決策仍要先辨識有效性。多感測器讀取有共用最小間隔，`period` 不是硬即時取樣承諾。

## 4. 常見用法

單次讀取用 `distance(sensor=name)`；變化事件可用 `on_distance_change()`，門檻用 `on_near()`／`on_far()`。近／遠 callback 不帶距離參數；以已有數值或另一次讀值顯示距離時要區分時點。近門檻必須小於遠門檻。

## 5. 完整互動範例

在 20 cm 內回報 NEAR，達 30 cm 回報 FAR，兩者間的區域讓狀態較穩定。Runtime 以連續有效取樣做判斷，初次滿足條件也可能回報；callback 只保存事件，前景再顯示。此示範只輸出文字，不控制車體。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("ultrasonic_sensor", False):
    raise RuntimeError("Enable ultrasonic_sensor in Device Manager first")
items = {name: spec for name, spec in m.config.get("ultrasonic_sensors", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_ultrasonic_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled ultrasonic_sensors entry in Device Manager")
    name = next(iter(items))
spec = items[name]

pending = None

def near():
    global pending
    pending = "NEAR"

def far():
    global pending
    pending = "FAR"

m.on_near(20, near, period=150, sensor=name)
m.on_far(30, far, period=150, sensor=name)
try:
    while True:
        m.run_once()
        if pending is not None:
            event = pending
            pending = None
            print(event)
        time.sleep_ms(10)
finally:
    m.close()
```

## 6. 適用範圍與問題排除

適用 BarePico 三目標 High-Level MicroPython v0.1.0-rc6 候選來源。沒有回波時不要只把 timeout 無限加長；會拖慢共同事件迴圈。

排錯：profile → 模組總開關／具名 enabled → Trigger與Echo實線對照DM → 電位轉換／電源／共地 → 物體距離、角度與材質。先用單一感測器與平整物體快測，再測多顆避免互擾。必要的 raw pulse 診斷要在停止 Mango 後進行；Hardware Lab 用於 firmware／模式問題，不是超音波波形儀。

## 7. 小挑戰

改成近 15 cm、遠 25 cm，比較手部靠近／遠離時的穩定性。再記錄 `None` 出現的條件，為互動作品設計「讀值暫時不可用」狀態。

[API Reference](../reference/ultrasonic.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
