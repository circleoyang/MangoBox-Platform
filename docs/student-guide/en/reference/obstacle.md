# Obstacle API Reference

> **Availability**: the current canonical contract exposes `obstacle` for **MangoX2 + Host Python** and **MangoX2 + High-Level MicroPython**. MangoLite does not currently advertise this capability.

Canonical import:

```python
from mangobox import Mango
m = Mango()
```

## `is_blocked()`

```python
m.is_blocked(sensor=None) -> bool
```

Synchronously read the selected obstacle sensor and return a normalized Boolean state.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---:|---|
| `sensor` | str \| None | `None` | Named sensor; when omitted, the default is `obstacle1`. |

### Returns

- `True`: the current semantic state is blocked.
- `False`: the current semantic state is clear, or no valid value was obtained and the current API falls back to clear.

```python
if m.is_blocked():
    m.stop()
```

> `False` is not a transport-health check. It only represents the current Student API result.

## `block_state()`

```python
m.block_state(sensor=None) -> str
```

Return a readable semantic state:

```text
blocked
clear
```

### Parameters

Same as `is_blocked()`; `sensor=None` selects `obstacle1`.

### Returns

- `"blocked"`
- `"clear"`

The current implementation also falls back to `"clear"` when no valid value is available, so `clear` must not be used as proof that transport or sensor input is healthy.

## `on_blocked()`

```python
m.on_blocked(callback, sensor=None, period=20)
```

Run a callback when the state transitions from clear to blocked.

### Parameters

| Parameter | Type | Default | Description |
|---|---|---:|---|
| `callback` | callable | required | Function to run when the sensor enters blocked. |
| `sensor` | str \| None | `None` | Named sensor; omitted means `obstacle1`. |
| `period` | int | `20` | Runtime monitor update interval in ms; the current command path clamps the effective minimum to 10 ms. |

A non-callable callback raises `TypeError`.

The callback receives no argument:

```python
def blocked():
    print("BLOCKED")

m.on_blocked(blocked)
```

## `on_clear()`

```python
m.on_clear(callback, sensor=None, period=20)
```

Run a callback when the state transitions from blocked back to clear.

Parameters are the same as `on_blocked()`; the callback takes no argument and a non-callable callback raises `TypeError`.

## Baseline and transition behavior

The monitor reads the current state before monitoring begins. Therefore:

- registering `on_blocked()` / `on_clear()` does not itself create a transition event;
- callbacks run only on later state changes;
- repeated samples with the same semantic value do not repeatedly retrigger the same callback.

In High-Level MicroPython, blocked and clear callbacks for the same named sensor share a monitor; a later request for a faster `period` may restart that monitor at the faster rate. Host Python also starts a Runtime monitor, but its adapter should not be assumed to have identical internal monitor-management behavior.

## Execution lifecycle

| API | Host Python | High-Level MicroPython |
|---|---|---|
| `is_blocked()` | Waits synchronously for a Runtime read reply, up to about 0.8 s | Sends a read command and uses the current Runtime reply / cached semantic state |
| `block_state()` | Same | Same |
| `on_blocked()` / `on_clear()` | Events are received by the Host reader / callback dispatcher; the program must stay alive | Callbacks are serviced by the Scheduler; the event program must keep running |
| `m.run_forever()` | Should not be treated as a required Host API | Standard ending for event-driven examples |

High-Level MicroPython example:

```python
from mangobox import Mango

m = Mango()
m.on_blocked(lambda: print("BLOCKED"))
m.on_clear(lambda: print("CLEAR"))
m.run_forever()
```

For Host Python, the program only needs to remain alive after registration; it does not depend on `m.run_forever()`.

## Named sensors

The default sensor name is:

```text
obstacle1
```

Additional obstacle sensors are named and managed by Device Manager / Runtime configuration. Select one with `sensor="name"`:

```python
print(m.is_blocked("left"))
print(m.block_state("right"))
```

Learner code should not rebuild the raw GPIO driver or reimplement active-level inversion.

## Hardware / configuration notes

- Obstacle modules are typically digital inputs; active-high / active-low normalization belongs in Runtime / module configuration.
- Detection distance depends on the module sensitivity adjustment, target material, angle, and ambient light.
- Named-sensor strings must match Device Manager / Runtime configuration.
- Check capability when needed:

```python
print(m.supports("obstacle"))
```

## Example: stop on obstacle

```python
from mangobox import Mango

m = Mango()

def blocked():
    m.stop()
    m.led_all("red")

def clear():
    m.led_all("green")

m.on_blocked(blocked)
m.on_clear(clear)
m.forward(30)
m.run_forever()
```

This event lifecycle is the High-Level MicroPython pattern. Host Python uses the same callback API but only needs the main program to stay alive.

## Troubleshooting

### `block_state()` always returns `clear`

Check capability, module enablement, named-sensor configuration, wiring, active level, sensitivity, and real input. Do not assume that a `clear` return value proves the hardware path is healthy.

### Callbacks do not fire

Verify that the semantic state actually transitions. In High-Level MicroPython, make sure the Scheduler keeps running; in Host Python, make sure the main program does not exit immediately after registration.

### The state is inverted

Correct active-level configuration in Runtime / Device Manager instead of reversing `True / False` independently in each learner program.

## Related APIs

`is_blocked()`, `block_state()`, `on_blocked()`, `on_clear()`, `supports("obstacle")`, `run_forever()`, `stop()`, `forward()`
