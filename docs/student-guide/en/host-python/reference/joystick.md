# Host Python Joystick API Reference

## `joystick()`

Returns `(x, y)`, with both values as integers in `-100..100`.

## `is_joystick_pressed()`

Synchronously returns the current joystick switch state as `bool`.

## `on_joystick_pressed(callback, period=50)`

Calls the callback on press.

## `on_joystick_released(callback, period=50)`

Calls the callback on release.

## `calibrate_joystick(samples=16)`

Requests Runtime center calibration and returns `(center_x, center_y)` raw center values.

`period` is clamped to at least 20 ms. The Joystick module must be enabled through `enabled_modules.ps2`.


## Joystick change event: `on_joystick_change()`

`m.on_joystick_change(callback, threshold=8, period=100)` watches X/Y coordinates (-100 to 100). A change of at least 8 units on either axis from the last delivered reading triggers callback(x, y). The first valid observation also triggers.

```python
from mangobox import Mango
m = Mango()
def changed(x, y):
    print(x, y)
m.on_joystick_change(changed, threshold=8, period=100)
m.run_forever()
```

`m.stop_joystick_change()` stops the watcher; requires a Runtime/Host package that integrates Sensor Change v1.
