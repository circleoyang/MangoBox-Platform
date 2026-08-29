# IR 紅外線遙控器使用指南 — High Level MicroPython

IR Remote 可以用遙控器控制 MangoBox，例如方向鍵、OK、數字鍵、`*` 與 `#`。

> 本頁只適用於 High Level MicroPython。Host Python 目前不公開完整 IR learner API，因此 Host profile 會隱藏這個模組。

## 先確認你的版本是否支援 IR

```python
from mangobox import Mango

m = Mango()
print(m.supports("ir"))
```

`True` 代表目前 target 與 Runtime 版本提供 IR Student API。這不代表外接模組一定接對；`supports()` 不是電氣測試。

## 按 OK 控制 LED

```python
from mangobox import Mango

m = Mango()

def ok_pressed():
    print("OK 被按下")
    m.led_all("#00ff00")

def ok_released():
    print("OK 被放開")
    m.led_off()

m.on_ir_pressed("ok", ok_pressed)
m.on_ir_released("ok", ok_released)
m.run_forever()
```

`on_ir_pressed()` / `on_ir_released()` 會建立 IR 接收與更新工作，所以不像 Button callback 需要另外呼叫 `start_button()`；但 IR 解碼與 released 判定仍需要 Scheduler 持續更新，因此 `m.run_forever()` 是必要的。

不要只寫一次 `print(m.is_ir_pressed("ok"))` 就判定 IR 是否正常。IR decoder 也需要 event loop 更新；初學者建議優先使用 callback 寫法。

## MangoLite 與 MangoX2 的硬體差異

### MangoLite + Pico 2 W

MangoLite 的 IR Receiver 是板載固定功能，使用 GP22。學生通常不需要另外 Enable IR，也不需要自行設定 Pin（腳位）。

### MangoX2 + Pico / Pico 2 W

MangoX2 的 IR Receiver 是選配模組。必須：

1. 在設定中 Enable `ir_sensor`；
2. 設定 `ir_sensor_pin`；
3. 將外接 IR 模組的 Signal/OUT 接到同一個 GPIO／Pin。

High Level MicroPython 的 IR implementation 依 `ir_sensor_pin` 建立接收器，不使用舊的 `ir_receiver_pin` 作為 MangoX2 semantic path 的腳位來源。

## IR 沒反應時怎麼辦

### Step 1：確認 capability

```python
from mangobox import Mango

m = Mango()
print("IR supported =", m.supports("ir"))
```

### Step 2：MangoX2 檢查設定

```python
from mangobox import Mango

m = Mango()
print("IR enabled =", m.config.get("enabled_modules", {}).get("ir_sensor"))
print("IR Pin =", m.config.get("ir_sensor_pin"))
```

例如顯示 `IR Pin = 4`，就直接確認真機 Signal/OUT 是否接 GP4。

### Step 3：Device Manager

MangoX2 確認 IR Sensor = Enabled、UI Pin = `ir_sensor_pin`、真機 Signal/OUT 接同一 Pin。MangoLite 應顯示板載 IR（GP22）。

### Step 4：最小 raw edge test

如果設定正確，但按遙控器完全沒有事件，可以先不解碼 NEC，只確認 Signal Pin 是否出現 edge（邊緣變化）。

> 執行這支診斷程式時不要同時啟動 `on_ir_pressed()`，避免兩套 IRQ（中斷）占用同一 Pin。

```python
from machine import Pin
from mangobox import Mango
import time

m = Mango()

pin_no = m.config.get("ir_sensor_pin")
if pin_no is None:
    pin_no = 22

edges = 0

def changed(pin):
    global edges
    edges += 1

p = Pin(pin_no, Pin.IN)
p.irq(handler=changed,
      trigger=Pin.IRQ_RISING | Pin.IRQ_FALLING)

print("IR raw Pin = GP", pin_no)
last = 0
while True:
    time.sleep(1)
    now = edges
    print("edges / second =", now - last)
    last = now
```

- 按遙控器時 edge 明顯增加 → Receiver 有 pulse 進入 Pico，接著查 protocol／decoder／Student API。
- edge 一直是 0 → 優先查 VCC、GND、Signal、模組方向、Pin 與遙控器。

> Hardware Lab 主要處理 firmware、execution mode、Recovery、Clean Flash 等生命週期問題，不是一般 IR pulse analyzer。

## 小挑戰

用方向鍵控制作品狀態：↑ → 紅色、↓ → 藍色、OK → 熄滅。

完整工程資料請看 [IR Remote API Reference](../reference/ir.md)。
