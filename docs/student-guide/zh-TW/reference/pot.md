# Pot（電位器）API Reference

> 以下是 MangoBox **High-Level MicroPython** 與已整合 Pot 擴充的 **Host Python** 共用的 Student API 方法定義。Host Python 的發行版是否已整合，須以其實際套件版本為準；虛擬 Pot 尚不支援。須啟用 Runtime 的 `enabled_modules.potentiometer` 及至少一個已啟用的命名電位器。

## 即時讀取

| Method | 回傳 | 說明 |
|---|---|---|
| `m.pot(name=None, invert=None)` | `int`，0～100 | 校準後的百分比 |
| `m.pot_raw(name=None)` | `int`，0～65535 | ADC 16-bit 縮放讀值 |
| `m.pot_voltage(name=None, supply=None)` | `float`，V | 校準位置推估的滑動端電壓 |

- `name`：命名電位器，例如 `"pot1"`；省略時採用設定檔的 `current_pot_setting`（通常為 `pot1`）。
- `invert`：`None` 沿用設定檔；`True` / `False` 可覆寫百分比方向，但**不反轉電壓**。
- `supply`：`None` 採設定供電電壓（預設 3.3V）；指定正確供電值僅影響當次估計，不會改變硬體容許電壓。

```python
from mangobox import Mango
m = Mango()
print(m.pot("pot1"))
print(m.pot_raw("pot1"))
print(m.pot_voltage("pot1"))
```

## 變化與門檻事件

| Method | 觸發條件 |
|---|---|
| `m.on_pot_change(callback, threshold=2, period=100, name=None, invert=None)` | 首次有效讀值或與上次通知值相差至少 `threshold` 個百分點 |
| `m.on_pot_above(threshold, callback, hysteresis=2, period=100, name=None, invert=None)` | 由低往高跨越門檻 |
| `m.on_pot_below(threshold, callback, hysteresis=2, period=100, name=None, invert=None)` | 由高往低跨越門檻 |
| `m.stop_pot(name=None)` | 停止指定命名電位器的監看 |

- `threshold`：變化事件需為 1～100；above/below 需為 0～100。
- `hysteresis`：0～100 的遲滯百分點，降低門檻附近的重複觸發。
- `period`：監看週期（毫秒），程式會至少取 20ms。
- `on_pot_change` 的 callback 接受一個參數 `value`（整數百分比）；above/below callback **不帶參數**。
- 事件註冊後須維持 event loop（`m.run_forever()`），不需要自行重複輪詢。

```python
from mangobox import Mango
m = Mango()

def changed(value):
    print("Pot:", value)

def too_high():
    print("超過 80%")

m.on_pot_change(changed, threshold=3, name="pot1")
m.on_pot_above(80, too_high, hysteresis=3, name="pot1")
m.run_forever()
```

## 支援能力與設定

`m.supports("pot")` 可確認目前 Runtime 的 Pot 功能與命名設定均已啟用；`m.capabilities()` 也可能列出 `"pot"`。兩者不是硬體接線測試。ADC 腳位使用 GP26 / GP27 / GP28，應先在 Device Manager 檢查衝突及校準。

## 執行環境

High-Level MicroPython 使用已整合 Pot 的 Runtime。Host Python 必須使用實際整合 Pot 擴充的 Student API 與已連線的實體 Runtime；`hardware` / `mirror` 模式可讀實體裝置，純虛擬模式不提供 Pot 模擬。**不能只憑 Runtime 已更新，就認定 MangoThonny 內附 Host 套件已更新。**

## 電氣安全

ADC 的實際電壓輸入不得超過 Pico 允許的約 0～3.3V；供電較高時需先用適當電路分壓與共地。不要把 `supply=5` 誤認為允許直接接 5V。
