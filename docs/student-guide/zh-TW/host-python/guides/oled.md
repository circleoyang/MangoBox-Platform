# OLED 顯示器 — Host Python 使用指南

Host Python 會在電腦端處理字型資料，再把 OLED 命令送給 MangoBox Runtime。

## 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
m.clear_oled()
m.text("Hello MangoBox", 0, 0)
```

Host Python 的 OLED 路徑和 High Level MicroPython 不同。Host 端會處理需要的中文字型 glyph（字形）上傳，並使用 deferred render（延後 render）機制把多筆文字更新合併後送出。

因此 **不要把 MangoLite 裝置端目前的 `m.run_forever()` 規則套到 Host Python**。靜態 `clear_oled()` / `text()` 不需要 Host event loop 才顯示。

## 多行文字

```python
m.clear_oled()
m.text("MangoBox\nReady!", 0, 0)
```

Host 0.4.6 會依行數安排基本行距，並處理需要上傳的中文字型。

## 閃爍文字

```python
m.flash_text("READY", 0, 0, period=500)
```

`flash_text()` 會把效果命令送給 Runtime，後續閃爍由 Runtime 執行，不需要 Host 用 `m.run_forever()` 驅動畫面。

## 如果沒有顯示

先確認：

```python
from mangobox import Mango

m = Mango()
print(m.supports("oled"))
print(m.capabilities())
```

接著在 Device Manager 核對：

```text
OLED 是否 Enable
oled_i2c_id
oled_sda_pin
oled_scl_pin
oled_addr
```

若是外接 OLED，再檢查 VCC / GND / SDA / SCL。Host Python 不應使用 PC 端的 `machine.I2C`，因為 `machine` 是 MicroPython 裝置端模組。

完整函式資料請看 [Host Python OLED API Reference](../reference/oled.md)。
