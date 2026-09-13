# Line Tracking Guide

Line Tracking uses two digital sensors to determine where a line is relative to the board. The MangoBox Student API normalizes the raw left/right signals into four semantic states: `none`, `left`, `right`, and `both`, so learner code does not need to reverse active-high / active-low GPIO logic manually.

> **Availability**: the current canonical contract exposes `line_tracking` only for **MangoX2 + High-Level MicroPython**. MangoX2 defaults Line Tracking to GP12 / GP13, which conflicts with current Host UART ownership, so Host Python profiles do not advertise this capability. MangoLite does not currently advertise it either.

## 30-second test

Test the sensors before adding motors:

```python
from mangobox import Mango
import time

m = Mango()

while True:
    print(
        "left =", m.line_left(),
        "right =", m.line_right(),
        "state =", m.line_state()
    )
    time.sleep(0.2)
```

Move the left and right sensors over the line one at a time and verify that `line_left()`, `line_right()`, and `line_state()` match the physical position.

## The four states

`m.line_state()` returns:

| State | Meaning |
|---|---|
| `none` | Neither sensor is in the active line state. |
| `left` | The left sensor detects the line. |
| `right` | The right sensor detects the line. |
| `both` | Both sensors detect the line. |

For teaching, let students observe these four states before combining sensing, steering, and speed control in one program.

## Event callbacks

To react only when the semantic state changes, use callbacks:

```python
from mangobox import Mango

m = Mango()

def changed(state):
    print("state =", state)

m.on_line_change(changed)
m.on_line_left(lambda: print("LEFT"))
m.on_line_right(lambda: print("RIGHT"))
m.on_line_both(lambda: print("BOTH"))
m.on_line_clear(lambda: print("NONE"))

m.run_forever()
```

- `on_line_change()` fires whenever the semantic state changes and passes the new `state` string.
- `on_line_left()` fires when the state enters `left`.
- `on_line_right()` fires when the state enters `right`.
- `on_line_both()` fires when the state enters `both`.
- `on_line_clear()` fires when the state enters `none`.

The four state-specific callbacks take no argument.

## When is `m.run_forever()` required?

Direct reads do not require it:

```python
print(m.line_left())
print(m.line_right())
print(m.line_state())
```

Programs using `on_line_*()` callbacks must keep the Scheduler running:

```python
m.run_forever()
```

The default event update period is 50 ms. Runtime clamps the effective scheduling interval to at least 20 ms.

## Combine with Motor / Drive

First validate sensing on its own, then add drive behavior:

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

This is a minimal teaching example, not a universal line-following controller. Sensor spacing, mounting height, line width, speed, and chassis inertia all affect real behavior.

## Recommended troubleshooting order

If tracking is unstable, check these in order:

1. Confirm `m.supports("line_tracking")` is `True`.
2. Confirm the profile is MangoX2 + High-Level MicroPython.
3. Verify that the physical left/right sensors match `line_left()` / `line_right()`.
4. Check sensor height and the contrast between the line and background.
5. Verify that `line_state()` is stable while the robot is stationary.
6. Only after sensing is reliable, tune Motor speed and steering values.

Do not start by reversing raw GPIO `0/1` values in learner code. Active level belongs in Runtime / module configuration.

## Common questions

### Why is Line Tracking not shown in Host Python?

The current MangoX2 default uses GP12 / GP13, which conflicts with Host UART ownership, so the canonical Host Python profile does not advertise `line_tracking`.

### Why do callbacks not fire?

Make sure the program ends with `m.run_forever()` and that the sensor state actually changes from one semantic state to another.

### Can I read raw GPIO directly?

That is not recommended for Student API teaching. `line_left()`, `line_right()`, and `line_state()` keep learner code independent from board pin mapping and active-level details.

## Small challenge

Before controlling motors, use RGB LEDs to show the four states:

- `none`: LEDs off
- `left`: red
- `right`: blue
- `both`: green

After the state display is stable, replace the same logic with Motor / Drive actions.

## More

- [Line Tracking API Reference](../reference/line_tracking.md)
- [Motor / Drive Guide](motor.md)
