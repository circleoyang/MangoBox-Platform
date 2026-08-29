# OLED 顯示器使用指南

OLED 可以顯示文字、狀態與感測值。

> 本頁只應在目前 Hardware、Programming Mode 與版本支援 OLED 時顯示。

## 30 秒快速測試

### High Level MicroPython

```python
from mangobox import Mango

m = Mango()
m.clear_oled()
m.text("Hello MangoBox", 0, 0)
m.run_forever()
```

目前 MangoLite + Pico 2 W 的靜態 OLED 指令會先進入系統佇列，需要 event loop（事件迴圈）繼續執行，文字才會真正送到 OLED。`m.run_forever()` 會持續執行這個 event loop。

MangoX2 目前的靜態文字可以立即顯示，但學生文件暫時使用同一個跨硬體範例，避免同一份程式在 MangoX2 可用、換到 MangoLite 卻沒有畫面。

> 後續 Runtime 將把 MangoLite 的 `clear_oled()` 與 `text()` 統一成 immediate（立即執行）。完成 build 與實機驗證前，本頁仍保留 `m.run_forever()`。

## 常用 API

```python
m.clear_oled()
m.text(text, x=0, y=0, size=1)
m.flash_text(text, x=0, y=0, size=1, period=500, duration=0)
```

`flash_text()` 是持續效果，一定需要 event loop 繼續運作：

```python
from mangobox import Mango

m = Mango()
m.flash_text("READY", 0, 0, period=500)
m.run_forever()
```

## 如果沒有顯示

先檢查目前設定：

```python
from mangobox import Mango

m = Mango()
print("OLED API 支援：", m.supports("oled"))
print("OLED 模組啟用：", m.config.get("enabled_modules", {}).get("oled"))
print("I2C ID：", m.config.get("oled_i2c_id"))
print("SDA Pin：", m.config.get("oled_sda_pin"))
print("SCL Pin：", m.config.get("oled_scl_pin"))
print("I2C Address：", m.config.get("oled_addr"))
```

依序檢查：

```text
API 是否支援
→ OLED 是否 Enable
→ SDA / SCL Pin 是否與真機一致
→ I2C Address
→ High Level MicroPython 範例是否有讓 event loop 運作
→ Device Manager
→ 最小 I2C scan
→ VCC / GND / SDA / SCL 真機接線
```

外接 OLED 至少要確認：

```text
VCC
GND
SDA → oled_sda_pin
SCL → oled_scl_pin
```

### High Level MicroPython：最小 I2C scan

如果設定看起來正確，可以直接掃描目前設定的 I2C bus：

```python
from machine import I2C, Pin
from mangobox import Mango

m = Mango()

bus = int(m.config.get("oled_i2c_id"))
sda = int(m.config.get("oled_sda_pin"))
scl = int(m.config.get("oled_scl_pin"))

i2c = I2C(bus, sda=Pin(sda), scl=Pin(scl))
found = i2c.scan()

print("I2C devices =", found)
print("hex =", [hex(x) for x in found])
```

如果 OLED 設定的 address 是 `0x3C`，正常情況通常應在掃描結果看到 `0x3c`。

- 掃得到裝置，但 `m.text()` 沒顯示 → 先確認目前 MangoLite 範例有 `m.run_forever()`，再查 Runtime／OLED driver／設定。
- 完全掃不到 → 優先查 VCC、GND、SDA、SCL、Pin 與 I2C address。

> Hardware Lab 目前不是一般 I2C scanner；只有遇到 firmware、execution mode、Recovery、Clean Flash 等裝置生命週期問題時才需要使用 Hardware Lab。

## 小挑戰

顯示兩行：

```text
MangoBox
Ready!
```

提示：顯示完兩行後，別忘了讓 High Level MicroPython 的 event loop 繼續運作。

## 進階閱讀

- [OLED API Reference](../reference/oled.md)
- [Device Manager 基本操作](../tools/device-manager.md)
