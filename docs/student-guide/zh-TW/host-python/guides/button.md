# Button 按鈕 — Host Python 使用指南

Host Python 可以直接讀取 Button，也可以在按下／放開時執行 callback（回呼函式）。

## 直接讀取

```python
from mangobox import Mango

m = Mango()
print(m.read_button())
```

Host 0.4.6 的 `read_button()` 會送出讀取命令，等待 Runtime 回覆後回傳目前值。

一般情況：

```text
0 = 放開
1 = 按下
```

這種同步讀值不需要 `m.run_forever()`。

## 按下／放開事件

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("Button pressed")
    m.led_all("yellow")

def released():
    print("Button released")
    m.led_off()

m.on_pressed("button", pressed)
m.on_released("button", released)
m.start_button(100)
m.run_forever()
```

Host 端的角色和 High Level MicroPython 不同：

- `m.start_button(100)` 要求 Runtime 開始回報 Button 狀態；
- UART listener 在背景接收事件；
- callback 由 Host 端 thread 執行；
- `m.run_forever()` 的主要用途是讓 PC process 不要結束，持續接收事件。

## 如果 Button 沒反應

先測同步讀值：

```python
from mangobox import Mango
import time

m = Mango()

while True:
    print(m.read_button())
    time.sleep(0.2)
```

若同步讀值正常，但 callback 沒反應，優先檢查：

```text
是否有 on_pressed / on_released
→ 是否有 start_button()
→ PC 程式是否仍在執行
→ Runtime 是否持續回傳 Button event
```

若同步讀值也不變，再用 Device Manager 檢查 Button Enable、Pin 與真機接線。

完整函式資料請看 [Host Python Button API Reference](../reference/button.md)。
