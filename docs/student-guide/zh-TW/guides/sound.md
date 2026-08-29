# 聲音感測器（Sound Sensor）使用指南

Sound Sensor（聲音感測器）可以讓作品對拍手、敲擊或環境聲音強弱產生反應。

MangoBox 的 `sound_level()` 回傳 0～100 的相對聲音強度。這不是 dB（decibel，分貝）。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.sound_level())
    time.sleep(0.2)
```

在感測器旁拍手，數值應快速升高。

`sound_level()` 是直接讀取目前的相對聲音值，所以這種 polling（輪詢）寫法不需要 `m.run_forever()`。

## 事件方式

```python
from mangobox import Mango

m = Mango()

def loud():
    print("很大聲！")
    m.led_all("red")

m.on_sound_above(60, loud)
m.run_forever()
```

`on_sound_above()` / `on_sound_below()` 會建立門檻 watcher（監看工作），後續採樣與事件判定由 Scheduler 持續執行，所以事件寫法一定要保留 `m.run_forever()`。不需要另外呼叫 `start_sensor()`。

## 如果讀值固定或一直很低

先確認：

```python
from mangobox import Mango

m = Mango()
print("Sound API 支援：", m.supports("sound_level"))
print("Sound Sensor 啟用：", m.config.get("enabled_modules", {}).get("sound_sensor"))
print("Sound ADC Pin：", m.config.get("sound_sensor_pin"))
print("Window：", m.config.get("sound_window_ms"))
```

建議順序：

```text
API 是否支援
→ Sound Sensor 是否 Enable
→ sound_sensor_pin
→ Device Manager 設定 / calibration
→ 最小 ADC raw test
→ AO / VCC / GND 真機接線
```

目前高階聲音值使用 sampling window 內的 ADC peak-to-peak 幅度，因此短促拍手可能產生高峰值。

如果 `sound_level()` 讀值會變，但 callback 完全沒觸發，先確認事件範例有執行到 `m.run_forever()`，再檢查 threshold（門檻值）、hysteresis（遲滯值）與 sampling window。

## High Level MicroPython：最小 ADC raw test

```python
from machine import ADC
from mangobox import Mango
import time

m = Mango()
pin_no = m.config.get("sound_sensor_pin")
adc = ADC(pin_no)

print("Sound raw ADC Pin = GP", pin_no)

while True:
    print(adc.read_u16())
    time.sleep(0.05)
```

判讀方式：

- 拍手／敲擊時 raw value 明顯變化，但 `sound_level()` 不合理 → 再查 calibration、noise floor、reference level 或 Runtime 高階處理。
- raw value 幾乎完全不變 → 優先查 AO 接線、ADC Pin（腳位）、VCC／GND 與模組本身。

不要在 raw signal 根本沒有變化時一直修改高階 Python 程式。

> Hardware Lab 目前主要處理 firmware、execution mode、Recovery、Clean Flash 等生命週期問題，不是一般 ADC Sensor 即時測試工具。

## 進階閱讀

- [Sound Sensor API Reference](../reference/sound.md)
- [Device Manager 基本操作](../tools/device-manager.md)
