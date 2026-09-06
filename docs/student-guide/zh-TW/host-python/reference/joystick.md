# Joystick API Reference — Host Python

## `joystick()`

```python
m.joystick(sensor=None)
```

一次取得目前 Joystick 的 X、Y 與 switch / button 狀態。

| 參數 | 說明 |
|---|---|
| `sensor` | 命名 Joystick；`None` 使用目前預設。 |

```python
value = m.joystick()
print(value)
```

實際回傳結構由 current Student API contract 定義；Host 程式應使用 Runtime 回傳的 canonical 結果，不直接假設 ADC Pin 或固定 raw center。

多裝置：

```python
m.joystick("controller1")
```

中心值、ADC 範圍與 switch Pin 的校準／mapping 由 Runtime / Device Manager 管理。

## Capability

```python
print(m.supports("joystick"))
```
