# RGB LED — Host Python 使用指南

這一頁只適用於 **Host Python**。Python 程式執行在電腦上，再把命令送給 MangoBox Runtime。

## 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
m.led_all("#0088ff")
```

LED 應該立即變成藍色。Host Python 不需要用 `m.run_forever()` 來驅動 Runtime 的 LED Scheduler。

## 持續燈效

```python
from mangobox import Mango

m = Mango()
m.rainbow()
```

`rainbow()`、`breath()` 等方法會把燈效命令交給 Runtime；燈效的後續更新由 Runtime 處理。

> Host Python 的 `m.run_forever()` 主要用來讓電腦端程式保持存活、接收感測事件，不是用來驅動 LED 燈效。

## 常用 API

```python
m.led_all("red")
m.led(0, "#00ff00")
m.led_range(0, 3, "blue")
m.brightness(30)
m.rainbow()
m.breath("#0088ff")
m.led_off()
```

## 如果 LED 沒有反應

先確認：

```python
from mangobox import Mango

m = Mango()
print(m.supports("led"))
print(m.capabilities())
```

若 API 支援但沒有反應，依序檢查：

```text
Host 與 Runtime 是否成功連線
→ Device Manager 中 LED 是否 Enable
→ Pin / LED 數量設定
→ 真機 VCC / GND / DIN
→ Runtime / firmware 是否與 Host 0.4.6 相容
```

Host Python 不應使用裝置端 `machine.Pin` 或直接讀 `m.config` 當成一般學生除錯方式；設定以 Device Manager 與 Host 啟動時取得的 Runtime configuration snapshot 為準。

## 小挑戰

用標準 Python 的 `time.sleep()` 讓 LED 依序顯示紅、綠、藍：

```python
from mangobox import Mango
import time

m = Mango()

for color in ("red", "green", "blue"):
    m.led_all(color)
    time.sleep(1)

m.led_off()
```

完整函式資料請看 [Host Python RGB LED API Reference](../reference/led.md)。
