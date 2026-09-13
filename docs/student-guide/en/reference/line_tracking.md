# Line Tracking API Reference

> **Availability**: the current canonical contract exposes `line_tracking` only for **MangoX2 + High-Level MicroPython**. MangoX2 Host Python does not advertise it because the default GP12 / GP13 Line Tracking pair conflicts with current Host UART ownership. MangoLite does not currently advertise this capability.

Canonical import:

```python
from mangobox import Mango
m = Mango()
```

## `line_left()`

```python
m.line_left() -> bool
```

Synchronously read the normalized semantic state of the left line sensor.

### Returns

- `True`: the left sensor currently detects the line.
- `False`: the left sensor currently does not detect the line.

The physical active-high / active-low GPIO level is normalized by Runtime / module configuration; learner code should not reverse the raw value manually.

## `line_right()`

```python
m.line_right() -> bool
```

Synchronously read the normalized semantic state of the right line sensor.

### Returns

- `True`: the right sensor currently detects the line.
- `False`: the right sensor currently does not detect the line.

## `line_state()`

```python
m.line_state() -> str
```

Read both sensors and return one normalized semantic state:

| Return value | Meaning |
|---|---|
| `none` | Neither sensor is in the active line state. |
| `left` | The left sensor detects the line. |
| `right` | The right sensor detects the line. |
| `both` | Both sensors detect the line. |

```python
state = m.line_state()
print(state)
```

## `on_line_change()`

```python
m.on_line_change(callback, period=50)
```

Run a callback whenever the normalized line state changes.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---:|---|
| `callback` | callable | required | Function called when the state changes. |
| `period` | int | `50` | Monitor update interval in ms; Runtime clamps the effective scheduling interval to at least 20 ms. |

### Callback

The standard callback receives the new state string:

```python
def changed(state):
    print(state)

m.on_line_change(changed)
```

`state` is one of `none`, `left`, `right`, or `both`.

## `on_line_left()`

```python
m.on_line_left(callback, period=50)
```

Run a no-argument callback when the state enters `left`.

## `on_line_right()`

```python
m.on_line_right(callback, period=50)
```

Run a no-argument callback when the state enters `right`.

## `on_line_both()`

```python
m.on_line_both(callback, period=50)
```

Run a no-argument callback when the state enters `both`.

## `on_line_clear()`

```python
m.on_line_clear(callback, period=50)
```

Run a no-argument callback when the state enters `none`.

## Event-monitor behavior

All `on_line_*()` registrations share one Runtime line-tracking monitor. If a later registration requests a faster `period`, Runtime may reconfigure the shared monitor according to the current contract.

Events are transition-oriented: entering a semantic state triggers the matching callback. Registering a callback itself is not a state-change event.

## Execution lifecycle

| API | High-Level MicroPython behavior | Needs `m.run_forever()` |
|---|---|---:|
| `line_left()` | Immediate synchronous read | No |
| `line_right()` | Immediate synchronous read | No |
| `line_state()` | Immediate two-sensor read and normalization | No |
| `on_line_change()` | Creates/shares a watcher serviced by the Scheduler | Yes |
| `on_line_left/right/both/clear()` | Creates/shares a watcher serviced by the Scheduler | Yes |

Standard callback-program ending:

```python
m.run_forever()
```

## Example: observe state changes

```python
from mangobox import Mango

m = Mango()

def changed(state):
    print("line =", state)

m.on_line_change(changed, period=50)
m.run_forever()
```

## Example: minimal line-following logic

```python
from mangobox import Mango
import time

m = Mango()

while True:
    state = m.line_state()

    if state == "left":
        m.pivot_left(25)
    elif state == "right":
        m.pivot_right(25)
    elif state == "both":
        m.forward(30)
    else:
        m.stop()

    time.sleep(0.02)
```

This demonstrates API usage, not a universal controller. Real behavior depends on sensor placement, line width, mounting height, speed, and chassis dynamics.

## Hardware / configuration notes

- Current MangoX2 defaults Line Tracking to GP12 / GP13.
- Current Host UART usage conflicts with that default pair, so Host Python profiles do not advertise `line_tracking`.
- Active level and left/right pin mapping belong in Runtime / Device Manager configuration; learner programs should use semantic APIs rather than rebuilding raw GPIO drivers.
- Check capability before use when needed:

```python
print(m.supports("line_tracking"))
```

## Troubleshooting

### `line_state()` always returns `none`

Check capability, module enablement, wiring, sensor height, and contrast between the line and background before changing Motor parameters.

### Callbacks never fire

Make sure the program keeps `m.run_forever()` running and that the semantic state actually transitions. A stable state does not repeatedly retrigger the same callback.

### Left and right appear reversed

Verify the physical left/right sensor wiring against the Runtime configuration. Do not swap meanings independently in every learner program to hide a configuration problem.

## Related APIs

`line_left()`, `line_right()`, `line_state()`, `on_line_change()`, `on_line_left()`, `on_line_right()`, `on_line_both()`, `on_line_clear()`, `supports("line_tracking")`, `run_forever()`, `forward()`, `pivot_left()`, `pivot_right()`, `stop()`
