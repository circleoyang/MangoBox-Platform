# Light Sensor API Reference

## `light()`

```python
m.light(sensor=None) -> int | float
```

讀取校準後的 **0～100 相對亮度**。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `sensor` | `None` | 命名光線感測器；省略時使用目前預設感測器。 |

### 回傳值

- `0`：校準範圍中的較暗端
- `100`：校準範圍中的較亮端
- 中間值：相對亮度

這不是 lux（照度）值。

```python
value = m.light()
print("light =", value)
```

## 範例：太暗時自動亮燈

```python
from mangobox import Mango
import time

m = Mango()

while True:
    value = m.light()
    if value < 30:
        m.led_all("white")
    else:
        m.led_off()
    time.sleep(0.1)
```

## 校準語意

Student API 只讀取標準化結果。ADC raw sampling、校準數值、validation 與 persistence 由 firmware / Runtime 負責；Host Python、Device Manager 與學生程式不應各自再實作一套不同換算。

因此不同感測器或不同環境的 `50` 應理解為「目前校準範圍中的相對中間值」，不是固定物理照度。

## Named sensor

若設定多個光線感測器，使用：

```python
m.light("left")
m.light("right")
```

名稱與 GPIO / ADC channel 由 Device Manager / Runtime config 管理。

## 相關 API

`light()`, `supports("light")`, `capabilities()`
