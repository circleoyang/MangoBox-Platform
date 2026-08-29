# RGB LED 使用指南 — High Level MicroPython

RGB LED 可以顯示不同顏色，也可以做呼吸燈、彩虹燈與作品狀態提示。

> 本頁只適用於 High Level MicroPython。Host Python 請使用 Host 專屬文件。

## 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
m.led_all("#0088ff")
```

板載 RGB LED 應該全部亮成藍色。這是立即型輸出，不需要 `m.run_forever()`。

## 常用控制

### 立即型控制

```python
m.led_all("red")
m.led(0, "#00ff00")
m.led_range(0, 3, "blue")
m.brightness(30)
m.led_off()
```

以上操作會立即寫入 LED，不需要為了這一次輸出另外呼叫 `m.run_forever()`。

### 持續燈效

```python
from mangobox import Mango

m = Mango()
m.rainbow()
m.run_forever()
```

或：

```python
from mangobox import Mango

m = Mango()
m.breath("#0088ff")
m.run_forever()
```

`rainbow()`、`breath()`、meteor、color wipe、sparkle、fire flicker 等燈效需要 Runtime Scheduler 持續更新，所以 High Level MicroPython 必須讓 event loop（事件迴圈）繼續執行。

靜態 LED API 若使用 `duration > 0`，系統也會排程稍後恢復，因此要讓 event loop 保持執行：

```python
from mangobox import Mango

m = Mango()
m.led_all("red", duration=1000)
m.run_forever()
```

## 如果 LED 沒有亮

### Step 1：確認 capability

```python
from mangobox import Mango

m = Mango()
print("LED supported =", m.supports("led"))
```

### Step 2：檢查裝置設定

```python
from mangobox import Mango

m = Mango()
print("LED enabled =", m.config.get("enabled_modules", {}).get("led_strip"))
print("LED Pin =", m.config.get("led_strip_pin"))
print("LED count =", m.config.get("led_strip_leds"))
```

### Step 3：若靜態 LED 正常、燈效不動

先確認程式最後有：

```python
m.run_forever()
```

這通常表示燈效 task 已建立，但 Scheduler 沒有繼續執行，而不是 GPIO 接錯。

### Step 4：Device Manager

確認 target、LED module Enable、GPIO／Pin、LED 數量與 strip 選擇都正確。

### Step 5：真機檢查

```text
VCC / 供電是否足夠
GND 是否共地
DIN 是否接到 led_strip_pin
DIN / DOUT 方向是否接反
LED 數量設定是否正確
```

> Hardware Lab 主要處理 firmware、execution mode、Recovery、Clean Flash 等生命週期問題，不是一般 LED／GPIO 訊號測試工具。

## 小挑戰

讓 LED 依序顯示紅色、綠色、藍色，再熄滅。

完整工程資料請看 [RGB LED API Reference](../reference/led.md)。
