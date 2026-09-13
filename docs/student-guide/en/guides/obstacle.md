# Obstacle Sensor Guide

The Obstacle API normalizes a digital obstacle sensor into `blocked` / `clear` semantics so learner code does not need to reverse active-high / active-low GPIO logic manually.

> **Availability**: the current canonical contract exposes `obstacle` for **MangoX2 + Host Python** and **MangoX2 + High-Level MicroPython**. MangoLite does not currently advertise this capability.

## 30-second test

Test the sensor before adding motors:

```python
from mangobox import Mango
import time

m = Mango()

while True:
    print(
        "blocked =", m.is_blocked(),
        "state =", m.block_state()
    )
    time.sleep(0.2)
```

Move an object toward and away from the sensor and verify that the state changes between:

```text
blocked
clear
```

## Boolean or readable state

For condition checks:

```python
if m.is_blocked():
    print("obstacle ahead")
```

For display or logging:

```python
print(m.block_state())
```

## Event callbacks

To react only when the state changes:

```python
from mangobox import Mango

m = Mango()
m.on_blocked(lambda: print("BLOCKED"))
m.on_clear(lambda: print("CLEAR"))
m.run_forever()
```

- `on_blocked()` fires on a clear -> blocked transition.
- `on_clear()` fires on a blocked -> clear transition.
- Both callbacks take no argument.
- Runtime establishes the current state as a baseline before monitoring, so registration itself should not create a false transition event.

### Host Python versus High-Level MicroPython lifecycle

High-Level MicroPython event programs keep the Scheduler running with:

```python
m.run_forever()
```

Host Python receives events through its Host runtime reader / callback dispatcher. The Host program still needs to stay alive, but `m.run_forever()` should not be treated as a required Host Python API.

## Named sensors

The current MangoX2 contract supports named obstacle sensors configured by Device Manager / Runtime configuration, for example `left` and `right`:

```python
print(m.is_blocked("left"))
print(m.is_blocked("right"))
```

Events may also select a named sensor:

```python
m.on_blocked(
    lambda: print("left blocked"),
    sensor="left"
)
```

If no name is supplied, the Student API uses the default sensor name `obstacle1`.

## Combine with Motor / Drive

Validate the sensor first, then add drive behavior:

```python
from mangobox import Mango
import time

m = Mango()

while True:
    if m.is_blocked():
        m.stop()
        m.led_all("red")
    else:
        m.forward(25)
        m.led_all("green")
    time.sleep(0.05)
```

This is only a minimal teaching example. Real obstacle avoidance usually adds stopping distance, steering logic, multiple sensors, or ultrasonic distance sensing.

## If the state appears inverted

Check these before reversing values in learner code:

1. Active-low / active-high configuration.
2. Device Manager / Runtime configuration.
3. Wiring.
4. The module sensitivity adjustment.
5. Mounting angle and target-surface reflectivity.

Active level belongs in Runtime / module configuration, not in every learner program.

## Important limitation: `clear` is not a connectivity test

The current `is_blocked()` / `block_state()` behavior falls back to `False` / `clear` when no valid obstacle value is available instead of raising a communication exception. Therefore:

- `clear` is useful as the Student API semantic result.
- Do not use `clear` alone to prove that the sensor, UART, or Runtime is healthy.
- If the state never changes, separately check capability, configuration, and physical input.

## Recommended troubleshooting order

1. Confirm `m.supports("obstacle")` is `True`.
2. Confirm the active target / mode profile supports Obstacle.
3. Print `block_state()` continuously before adding motors.
4. Check active level, wiring, and sensor sensitivity.
5. For named sensors, confirm the name matches Device Manager / Runtime configuration.
6. Add callbacks or Motor / Drive only after the direct reading is stable.

## Small challenge

Use two named obstacle sensors:

- left blocked: red
- right blocked: blue
- both clear: green

First implement the LED feedback, then reuse the same logic for steering.

## More

- [Obstacle API Reference](../reference/obstacle.md)
- [Motor / Drive Guide](motor.md)
- [Ultrasonic Guide](ultrasonic.md)
