# Light Sensor API Reference — Host Python

## `light()`

```python
m.light(sensor=None) -> int | float
```

讀取 Runtime 校準後的 **0～100 相對亮度**；`0` 表示較暗端、`100` 表示較亮端。這不是 lux。

| 參數 | 說明 |
|---|---|
| `sensor` | 命名光線感測器；`None` 使用目前預設。 |

```python
value = m.light()
if value < 30:
    m.led_all("white")
```

校準數學、raw ADC sampling 與 persistence 由 firmware / Runtime 擁有。Host Python 只取得 canonical normalized value，不應另做一套不同的換算。

多裝置可用：

```python
m.light("left")
m.light("right")
```

## Capability

```python
print(m.supports("light"))
```
