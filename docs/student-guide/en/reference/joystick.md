# Joystick API Reference

> Show this page only when the selected target/mode/version provides the `joystick` capability.

## `joystick()`

```python
joystick() -> tuple[int, int]
```

Returns `(x, y)`, each approximately -100 to 100. Deadzone handling normally maps the released center to 0.

Raises `RuntimeError` when Joystick/PS2 is disabled.

## `is_joystick_pressed()`

```python
is_joystick_pressed() -> bool
```

Returns the push-switch state.

## `on_joystick_pressed()`

```python
on_joystick_pressed(callback, period=50) -> None
```

## `on_joystick_released()`

```python
on_joystick_released(callback, period=50) -> None
```

## `calibrate_joystick()`

```python
calibrate_joystick(samples=16)
```

Re-establishes the center while the stick is physically released.

## Execution lifecycle

| API | High Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `joystick()` | Immediate synchronous X/Y read | not required |
| `is_joystick_pressed()` | Immediate synchronous switch-state read | not required |
| `calibrate_joystick()` | one-time synchronous calibration command | not required |
| `on_joystick_pressed()` / `on_joystick_released()` | automatically start the Joystick watcher; later updates are Scheduler-driven | required |

Joystick callbacks start their own watcher, so no separate `start_sensor()` call is required. If polling values work but callbacks do not, first confirm the event loop remains active.

## Configuration

```text
enabled_modules.ps2
ps2_vrx_pin
ps2_vry_pin
ps2_sw_pin
ps2_deadzone
ps2_center_x
ps2_center_y
ps2_span_x
ps2_span_y
ps2_swap_xy
```

## Example

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("pressed")

m.on_joystick_pressed(pressed)
m.run_forever()
```

## Related

`joystick()`, `is_joystick_pressed()`, `on_joystick_pressed()`, `on_joystick_released()`, `calibrate_joystick()`, `run_forever()`
