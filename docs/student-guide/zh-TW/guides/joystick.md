# Joystick 搖桿使用指南

Joystick（搖桿）通常包含 X 軸、Y 軸與一個可按下的開關。MangoBox 高階 API 將 X／Y 轉成約 `-100`～`100`，中心位置通常接近 `0, 0`。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    x, y = m.joystick()
    print(x, y, m.is_joystick_pressed())
    time.sleep(0.2)
```

`m.joystick()` 與 `m.is_joystick_pressed()` 都是直接讀取目前狀態，所以這種 polling（輪詢）寫法不需要 `m.run_forever()`。

第一次使用時先放開搖桿，讓系統取得中心位置。必要時：

```python
m.calibrate_joystick()
```

`calibrate_joystick()` 也是一次性的直接操作，不需要 `run_forever()`。

## 按下搖桿時執行

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("Joystick pressed")
    m.bee()

m.on_joystick_pressed(pressed)
m.run_forever()
```

`on_joystick_pressed()` / `on_joystick_released()` 會啟動 Joystick watcher（監看工作），後續狀態更新由 Scheduler 持續執行，所以 callback 寫法需要 `m.run_forever()`。不需要再另外呼叫 `start_sensor()`。

## 如果中心不在 0, 0

```python
from mangobox import Mango

m = Mango()
print("Joystick API 支援：", m.supports("joystick"))
print("Joystick 啟用：", m.config.get("enabled_modules", {}).get("ps2"))
print("X ADC Pin：", m.config.get("ps2_vrx_pin"))
print("Y ADC Pin：", m.config.get("ps2_vry_pin"))
print("SW Pin：", m.config.get("ps2_sw_pin"))
print("Deadzone：", m.config.get("ps2_deadzone"))
```

真機確認：`VRx → ps2_vrx_pin`、`VRy → ps2_vry_pin`、`SW → ps2_sw_pin`，並確認 VCC／GND。X、Y 必須接到 ADC 可用 GPIO（General-Purpose Input/Output，通用輸入輸出）。

如果直接輪詢的 X／Y 與按鍵狀態都會變，但 callback 完全沒有反應，優先確認 callback 範例有執行到 `m.run_forever()`。

## ADC 原始值診斷

```python
from machine import ADC
from mangobox import Mango
import time

m = Mango()
x_adc = ADC(m.config.get("ps2_vrx_pin"))
y_adc = ADC(m.config.get("ps2_vry_pin"))

while True:
    print(x_adc.read_u16(), y_adc.read_u16())
    time.sleep(0.2)
```

推動搖桿時兩軸 raw value 都應明顯變化。若只有一軸變化，優先檢查另一軸接線。

## 進階閱讀

- [Joystick API Reference](../reference/joystick.md)
- [Device Manager 基本操作](../tools/device-manager.md)
- [Hardware Lab 基本操作](../tools/hardware-lab.md)
