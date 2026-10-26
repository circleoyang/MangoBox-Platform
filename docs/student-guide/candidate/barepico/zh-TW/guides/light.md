# BarePico 光線感測器

> 候選來源：BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26；來源核對不等於實機通過。

## 1. 可以做什麼與準備

讀取相對亮度，或在變暗、變亮跨過門檻時執行動作。此 BarePico API 使用單一 `light_sensor_pin`，不是具名多光線感測器介面。DM 需啟用 `enabled_modules.light_sensor`，設定 ADC GPIO、`light_raw_bright`、`light_raw_dark` 和 `light_sample_count`。

## 2. 30 秒快速測試

執行後遮住感測器，再移開手；觀看兩秒內的相對亮度。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("light_sensor", False):
    raise RuntimeError("Enable light_sensor in Device Manager first")
pin_no = m.config.get("light_sensor_pin")
if not isinstance(pin_no, int):
    raise ValueError("Configure light_sensor_pin in Device Manager")

try:
    print("Light GPIO:", pin_no)
    for _ in range(20):
        print("Relative brightness:", m.light())
        time.sleep_ms(100)
finally:
    m.close()
```

## 3. 應該觀察到什麼

`light()` 回傳整數 0～100，0 較暗、100 較亮，不是照度 lux。此來源要求校準 `raw_bright < raw_dark`。如果接線使原始方向相反，不能只把兩個校準值交換成違反限制的數字；應回到 DM 與感測器接法確認。

## 4. 常見用法

`on_light_below()`／`on_light_above()` 是門檻跨越事件，callback 不帶參數。初始取樣建立狀態，不會因程式剛啟動就憑空觸發。`hysteresis=5` 表示要退回門檻另一側一定距離，才重新準備觸發。此 BarePico 來源沒有 `on_light_change()`，不要照搬其他板型範例。

## 5. 完整互動範例

明暗提醒器：低於 30 時記錄 DARK，高於 70 時記錄 BRIGHT。callback 只設旗標，文字顯示在前景完成。遮住再移開，跨越兩個門檻觀察事件。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("light_sensor", False):
    raise RuntimeError("Enable light_sensor in Device Manager first")
pin_no = m.config.get("light_sensor_pin")
if not isinstance(pin_no, int):
    raise ValueError("Configure light_sensor_pin in Device Manager")

pending = None

def dark():
    global pending
    pending = "DARK"

def bright():
    global pending
    pending = "BRIGHT"

m.on_light_below(30, dark, hysteresis=5, period=100)
m.on_light_above(70, bright, hysteresis=5, period=100)
try:
    while True:
        m.run_once()
        if pending is not None:
            event = pending
            pending = None
            print(event)
        time.sleep_ms(10)
finally:
    m.stop_light()
    m.close()
```

## 6. 適用範圍與問題排除

只適用於 BarePico High-Level MicroPython v0.1.0-rc6 候選來源。BarePico 的 `capabilities()` 是身分描述，不是光線模組健康檢查。

排錯：target／版本 → `enabled_modules.light_sensor` → GP26／27／28 的實際訊號線 → DM 亮暗校準 → 電源、共地與感測元件方向。先確認快測會動，再查事件門檻與迴圈。原始診斷需停止 Mango 後另用 `machine.ADC`；先印配置的 Pin，再讀 `read_u16()`。更改校準或 Pin 後重新建立 Mango。

## 7. 小挑戰

以遮光盒和手電筒找出適合教室的暗／亮門檻；讓兩個門檻保留距離，再比較 hysteresis=0 與 5 的事件頻率。

[API Reference](../reference/light.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
