# PIR 人體感測器使用指南

PIR（Passive Infrared，人體紅外線）感測器可以判斷目前是否偵測到移動的人體或其他熱源變化。

> 本頁只應在文件解析器確認 `motion` capability 可用時顯示。不能因為設定檔有 `pir_sensor_pin` 就假設所有版本都支援。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.is_motion_detected())
    time.sleep(0.2)
```

`is_motion_detected()` 是直接讀取目前狀態，這種 polling（輪詢）寫法不需要 `m.run_forever()`。

## 事件方式

```python
from mangobox import Mango

m = Mango()

def detected():
    print("偵測到移動")
    m.led_all("red")

def cleared():
    print("沒有移動")
    m.led_off()

m.on_motion_detected(detected)
m.on_motion_cleared(cleared)
m.run_forever()
```

`on_motion_detected()` / `on_motion_cleared()` 會啟動 PIR watcher（監看工作），但後續狀態更新仍由 Scheduler 執行，所以事件寫法需要 `m.run_forever()`。這和 Button 不同，不需要另外呼叫 `start_button()` 類型的啟動 API。

## 如果一直是 False

先確認設定：

```python
from mangobox import Mango

m = Mango()
print("PIR API 支援：", m.supports("motion"))
print("PIR 模組啟用：", m.config.get("enabled_modules", {}).get("pir_sensor"))
print("PIR Pin：", m.config.get("pir_sensor_pin"))
```

建議順序：

```text
API 是否支援
→ PIR 是否 Enable
→ pir_sensor_pin
→ Device Manager 設定 / Live Read（若支援）
→ 最小 raw digital test
→ 真機 Signal / VCC / GND
```

## High Level MicroPython：最小 raw digital test

```python
from machine import Pin
from mangobox import Mango
import time

m = Mango()
pin_no = m.config.get("pir_sensor_pin")
p = Pin(pin_no, Pin.IN)

print("PIR raw Pin = GP", pin_no)

while True:
    print(p.value())
    time.sleep(0.2)
```

判讀方式：

- raw GPIO（General-Purpose Input/Output，通用輸入輸出）有 0／1 變化，但高階 API 一直沒事件 → 再查 Runtime／Student API／event loop，並確認 callback 範例有執行到 `m.run_forever()`。
- raw value 完全不變 → 優先查 Signal、Pin、VCC、GND、模組方向與 PIR 模組本身。

PIR 模組剛上電時可能需要短暫穩定時間，因此不要在剛供電的第一瞬間就判定故障。

> Hardware Lab 目前主要處理 firmware、execution mode、Recovery、Clean Flash 等生命週期問題，不是一般 PIR digital input 測試器。

## 進階閱讀

- [PIR API Reference](../reference/pir.md)
- [Device Manager 基本操作](../tools/device-manager.md)
