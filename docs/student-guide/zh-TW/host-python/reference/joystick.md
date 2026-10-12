# Joystick API Reference — Host Python

## `joystick()`

```python
m.joystick() -> tuple[int, int]
```

同步要求 Runtime 回傳目前搖桿方向，結果為 `(x, y)`；兩軸皆標準化為 **-100～100**。

```python
x, y = m.joystick()
print(x, y)
```

搖桿 SW 按鍵狀態不包含在 `(x, y)` 中，請使用 `is_joystick_pressed()`。

## `is_joystick_pressed()`

```python
m.is_joystick_pressed() -> bool
```

同步取得目前 Joystick / PS2 的 SW 按鍵狀態。

## `on_joystick_pressed()`

```python
m.on_joystick_pressed(callback, period=50)
```

SW 按下時執行 callback。

## `on_joystick_released()`

```python
m.on_joystick_released(callback, period=50)
```

SW 放開時執行 callback。

## `calibrate_joystick()`

```python
m.calibrate_joystick(samples=16)
```

要求 Runtime 重新校正中心值，回傳 `(center_x, center_y)` raw center values。

`period` 最低會限制在 20 ms。Joystick 模組必須先由目前 Runtime config 的 `enabled_modules.ps2` 啟用。

## Host Python 語意

Host Python 不自行讀取 ADC，也不擁有另一套中心值換算；讀值、校正與事件都透過 Runtime 的 canonical contract 取得。ADC Pin、SW Pin、deadzone 與 span 由 Runtime / Device Manager 管理。

目前 Student API 不提供 `joystick("name")` 這類 named-sensor 參數。

## Capability

```python
print(m.supports("joystick"))
```

## 相關 API

`joystick()`, `is_joystick_pressed()`, `on_joystick_pressed()`, `on_joystick_released()`, `calibrate_joystick()`


## 搖桿變化事件: `on_joystick_change()`

`m.on_joystick_change(callback, threshold=8, period=100)` 監控 -100～100 的 X/Y 軸座標；其中任何一軸與上次已通知值相差至少 8 時觸發 callback(x, y)，首次有效讀值亦觸發。

```python
from mangobox import Mango
m = Mango()
def changed(x, y):
    print(x, y)
m.on_joystick_change(changed, threshold=8, period=100)
m.run_forever()
```

`m.stop_joystick_change()` 停止監看；需整合 Sensor Change v1 的 Runtime／Host 套件。
