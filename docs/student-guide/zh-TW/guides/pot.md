# 電位器（Potentiometer）使用指南

電位器是可旋轉調整的類比輸入裝置。MangoBox Pot API 會將校準後的位置換算成 **0～100%**；可用來控制 RGB 燈條亮度、音效參數或互動作品。

> 適用於具備 Pot Student API 的 MangoX2 / MangoLite High-Level MicroPython Runtime。先在 Device Manager 啟用 Pot 與命名設定（例如 `pot1`），並確認使用正確的 ADC 腳位。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
print("Pot supported:", m.supports("pot"))

while True:
    print("位置：", m.pot("pot1"), "%")
    time.sleep(0.2)
```

轉動旋鈕時，數值通常會在 0～100 之間變化。若方向反了，可在 Device Manager 設定反向，或用 `m.pot("pot1", invert=True)` 暫時反向讀取。

## 範例：旋鈕調整 RGB 亮度

```python
from mangobox import Mango
import time

m = Mango()
m.led_all("#ff8800", strip="strip1")

while True:
    percent = m.pot("pot1")
    m.brightness(percent, strip="strip1")
    time.sleep(0.1)
```

`strip1` 必須是 Device Manager 已設定的燈條名稱。若未建立命名燈條，可依既有設定改用預設 LED。

## 事件：旋轉超過指定幅度

```python
from mangobox import Mango

m = Mango()

def changed(value):
    print("新的位置：", value)
    m.brightness(value, strip="strip1")

m.on_pot_change(changed, threshold=3, period=100, name="pot1")
m.run_forever()
```

事件模式需要 `m.run_forever()`，輪詢模式不需要。

## 電壓與安全

- `m.pot_raw("pot1")`：取得 0～65535 的 ADC 縮放原始值；**不是實際 16-bit ADC 精度**。
- `m.pot_voltage("pot1")`：取得依校準值及設定供電電壓計算的**估計滑動端電壓**，並非獨立電壓表。
- Pico ADC 腳位只能接受約 0～3.3V。**不可直接把 5V 或 12V 接到 ADC 腳位**；程式的 `supply` 參數不會提供電氣保護。
- 預設建議使用 GP28（實際以裝置設定與腳位衝突檢查為準）。

## 問題排除

若讀值不動，先確認接線、共地、ADC GPIO、模組與 `pot1` 設定都已啟用。若百分比不合理，使用 Device Manager 重新設定或校準 `raw_min` / `raw_max`。Host Python 需搭配有 Pot API 的對應版本與實體 Runtime，舊版 Host 或純虛擬模式不可假設可用。

## 進階閱讀

[Pot API Reference](../reference/pot.md) · [Device Manager](../tools/device-manager.md)


## 裝置設定讀取（Runtime Config）

如果程式需要依照 DM 配置的腳位、名稱或參數運作，請參考 [Runtime Config 設定讀取教學](runtime-config.md)。High-Level MicroPython 可使用現有 `m.config.get()`，但不同模組的設定鍵可能不同，必須核對正式 Config 並檢查缺值。此介面不可直接假設 Host Python 也有。
