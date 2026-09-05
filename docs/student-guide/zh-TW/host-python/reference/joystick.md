# Host Python Joystick API Reference

## `joystick()`

回傳：

```python
(x, y)
```

X、Y 都是整數 `-100..100`。

## `is_joystick_pressed()`

同步讀取 SW state，回傳 `bool`。

## `on_joystick_pressed(callback, period=50)`

搖桿按鍵按下時觸發 callback。

## `on_joystick_released(callback, period=50)`

搖桿按鍵放開時觸發 callback。

## `calibrate_joystick(samples=16)`

要求 Runtime 執行 center calibration，回傳 `(center_x, center_y)` raw center values。

`period` 最低 20 ms。Joystick 必須在 `enabled_modules.ps2` 啟用。
