# Sound Sensor API Reference

## `sound_level()`

```python
m.sound_level(sensor=None) -> int | float
```

讀取校準後的 **0～100 相對聲音強度**。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `sensor` | `None` | 命名聲音感測器；省略時使用目前預設感測器。 |

### 回傳值

- `0`：校準範圍中的較安靜端
- `100`：校準範圍中的較大聲端
- 中間值：相對聲音活動量

**這個值不是 dB（分貝）**，不要把 `70` 寫成 `70 dB`。

```python
value = m.sound_level()
print("sound =", value)
```

## 範例：拍手／大聲時變色

```python
from mangobox import Mango
import time

m = Mango()

while True:
    level = m.sound_level()
    if level > 65:
        m.led_all("red")
    else:
        m.led_all("blue")
    time.sleep(0.05)
```

## raw signal 與校準

目前 Runtime 的 raw 聲音量測使用短時間窗的 peak-to-peak 變化，再依 calibration 轉成 0～100。Student API 故意不暴露一套與 Runtime 分離的自行換算公式。

因此：

- `sound_level()` 適合教學中的「安靜／普通／較大聲」相對判斷。
- 不適合當成聲級計或法規 dB 量測。
- 校準由 firmware / Runtime 擁有；Device Manager 負責操作與視覺化，不另做一份數學模型。

## Named sensor

```python
m.sound_level("mic1")
```

多裝置名稱、ADC Pin 與校準參數由 Device Manager / Runtime config 管理。

## 相關 API

`sound_level()`, `supports("sound_level")`, `capabilities()`
