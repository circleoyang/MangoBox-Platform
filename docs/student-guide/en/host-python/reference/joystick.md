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
