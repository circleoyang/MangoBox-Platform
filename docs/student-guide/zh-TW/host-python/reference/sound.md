# Sound Sensor API Reference — Host Python

## `sound_level()`

```python
m.sound_level(sensor=None) -> int | float
```

讀取 Runtime 校準後的 **0～100 相對聲音強度**。這不是 dB（分貝）。

| 參數 | 說明 |
|---|---|
| `sensor` | 命名聲音感測器；`None` 使用目前預設。 |

```python
level = m.sound_level()
print(level)
```

目前 raw 聲音量測以短時間窗 peak-to-peak 變化為基礎，再由 Runtime calibration 轉為 0～100。Host Python 不應再建立另一套獨立換算。

適合：「安靜／普通／較大聲」相對判斷；不適合聲級計或法規 dB 測量。

多裝置：

```python
m.sound_level("mic1")
```

## Capability

```python
print(m.supports("sound_level"))
```
