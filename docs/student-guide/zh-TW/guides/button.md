# Button 按鈕使用指南 — High Level MicroPython

Button 可以用兩種方式：直接讀取目前狀態，或在「按下／放開」時觸發事件。

> 本頁只適用於 High Level MicroPython。Host Python 請使用 Host 專屬文件。

## 方法一：直接讀取

```python
from mangobox import Mango

m = Mango()
print(m.read_button())
```

一般情況：

```text
0 = 放開
1 = 按下
```

這是直接讀值，不需要 `m.run_forever()`。

## 方法二：按下時做事情

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("按下按鈕")
    m.led_all("#ffff00")

def released():
    print("放開按鈕")
    m.led_off()

m.on_pressed("button", pressed)
m.on_released("button", released)
m.start_button(100)
m.run_forever()
```

這裡有兩個必要步驟：

1. `m.start_button(100)` 啟動 Button 的週期讀取；
2. `m.run_forever()` 讓裝置端 event loop（事件迴圈）持續運作，才能偵測狀態變化並執行 callback（回呼函式）。

只寫 `on_pressed()` / `on_released()` 只是登記 callback，現在的 High Level MicroPython 不會因此自動開始監聽 Button。

## 如果按鈕一直沒有反應

### Step 1：確認 capability

```python
from mangobox import Mango

m = Mango()
print("Button supported =", m.supports("button"))
```

### Step 2：檢查設定

```python
from mangobox import Mango

m = Mango()
print("Button enabled =", m.config.get("enabled_modules", {}).get("button"))
print("Button Pin =", m.config.get("button_pin"))
```

如果是外接 Button，還要確認 Pin、pull-up / pull-down 與 active level（有效電位）。

### Step 3：最小 Student API 持續讀取

```python
from mangobox import Mango
import time

m = Mango()

while True:
    print(m.read_button())
    time.sleep(0.2)
```

如果輸出會在 `0` 與 `1` 之間改變，硬體讀取路徑通常正常；接著檢查是否有 `start_button()`、callback 註冊與 event loop。

### Step 4：Device Manager

確認 Button module Enable、GPIO／Pin、pull/active 設定與 Live Read/Monitor（若版本支援）。

### Step 5：最小 raw digital test

```python
from machine import Pin
from mangobox import Mango
import time

m = Mango()
pin_no = m.config.get("button_pin")
p = Pin(pin_no, Pin.IN)

print("Button raw Pin = GP", pin_no)

while True:
    print(p.value())
    time.sleep(0.2)
```

- raw value 會變 → 查 Runtime 設定、active level、`start_button()` 與 event loop。
- raw value 完全不變 → 查 Signal、GND、VCC、按鈕接法與 Pin。

> Hardware Lab 主要處理 firmware、execution mode、Recovery、Clean Flash 等生命週期問題，不是一般 digital input 測試器。

## 小挑戰

按下 Button 讓 LED 亮黃色，放開後熄滅。

完整工程資料請看 [Button API Reference](../reference/button.md)。
