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
