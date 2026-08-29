# 光線感測器（Light Sensor）使用指南

光線感測器可以讓作品知道環境變亮或變暗。MangoBox 高階 API 使用 0～100 的相對亮度值，不要求學生直接處理 ADC（Analog-to-Digital Converter，類比數位轉換器）原始值。

> `0` 代表較暗端，`100` 代表校準後的較亮端；這不是 lux。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.light())
    time.sleep(0.5)
```

用手遮住感測器再移開，數值應明顯變化。

`m.light()` 是直接讀取目前亮度，所以這種 polling（輪詢）寫法不需要 `m.run_forever()`。

## 事件方式

```python
from mangobox import Mango

m = Mango()

def dark():
    print("變暗了")
    m.led_all("blue")

m.on_light_below(30, dark)
m.run_forever()
```

`on_light_above()` / `on_light_below()` 會建立門檻 watcher（監看工作），後續感測與跨越門檻判定由 Scheduler 持續執行，所以事件寫法一定要保留 `m.run_forever()`。不需要另外呼叫 `start_sensor()`。

## 如果讀值不變

```python
from mangobox import Mango

m = Mango()
print("Light API 支援：", m.supports("light"))
print("Light Sensor 啟用：", m.config.get("enabled_modules", {}).get("light_sensor"))
print("Light ADC Pin：", m.config.get("light_sensor_pin"))
```

檢查 `light_sensor_pin` 是否是 ADC 可用 GPIO（General-Purpose Input/Output，通用輸入輸出），並確認模組 AO（Analog Output，類比輸出）真的接到該 Pin（腳位）。

如果直接 `m.light()` 讀值會變，但 callback 完全沒觸發，優先確認事件範例有執行到 `m.run_forever()`，再檢查 threshold（門檻值）與 hysteresis（遲滯值）。

## ADC 原始值診斷

```python
from machine import ADC
from mangobox import Mango
import time

m = Mango()
pin_no = m.config.get("light_sensor_pin")
adc = ADC(pin_no)

while True:
    print("GP", pin_no, "raw =", adc.read_u16())
    time.sleep(0.2)
```

raw value 會變但 `m.light()` 不合理：優先檢查 Bright／Dark 校準。raw value 幾乎不變：優先檢查接線與模組。

## 進階閱讀

- [Light Sensor API Reference](../reference/light.md)
- [Device Manager 基本操作](../tools/device-manager.md)
- [Hardware Lab 基本操作](../tools/hardware-lab.md)
