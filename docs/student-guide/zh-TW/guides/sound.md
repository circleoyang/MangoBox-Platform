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

## 新增：感測值變化事件（Change Callback）

除了直接呼叫 `m.sound_level()` 之外，現在可以讓 MangoBox 在數值變化達指定幅度時自動執行函式：

```python
from mangobox import Mango
m = Mango()

def changed(value):
    print('sound:', value)

m.on_sound_change(changed, threshold=5, period=100)
m.run_forever()
```

`threshold` 的單位是 0～100 相對音量百分點，與上一次實際通知值比較；`period` 是以毫秒指定的監看週期。首次有效讀值也會通知一次。音量是相對值，不是 dB（分貝）。 如需停止，使用 `m.stop_sound_change()`。

詳見 [API Reference](../reference/sound.md)。

> **版本注意：** Change API 需具備已整合 Sensor Change v1 的 Runtime／Host 套件。舊版不一定有這些方法；Host Python 應確認 MangoThonny 實際搭載的套件版本，不能只依韌體版本判斷。


## 裝置設定讀取（Runtime Config）

如果您希望程式適用於 DM 中不同的腳位、名稱或數量設定，可參考 [讀取 Device Manager 設定的教學](runtime-config.md)。High-Level MicroPython 已提供 `m.config.get()`；具名模組（例如 LED Strip）與獨立設定鍵（例如部分感測器 GPIO）的資料結構不同，請核對正式 Config 鍵並檢查模組是否啟用。**不要假設 Host Python 有相同 Config 介面，也不要編造新查詢方法。**
