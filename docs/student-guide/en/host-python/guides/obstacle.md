# Obstacle Sensor — Host Python Guide

The current `obstacle` capability is available on MangoX2 Host Python profiles. Host Student API supports named sensors, synchronous reads, and state-transition callbacks. MangoLite Host profiles do not currently advertise this capability.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
print("Obstacle supported =", m.supports("obstacle"))

while True:
    print(m.is_blocked(), m.block_state())
    time.sleep(0.2)
```

## Named sensor

```python
print(m.is_blocked("left"))
print(m.block_state("right"))
```

When no name is supplied, the default sensor is `obstacle1`.

## Events

```python
from mangobox import Mango
import time

m = Mango()
m.on_blocked(lambda: print("LEFT BLOCKED"), sensor="left")
m.on_clear(lambda: print("LEFT CLEAR"), sensor="left")

while True:
    time.sleep(1)
```

Host callbacks are delivered by the background reader/dispatch path and do not require the MicroPython `m.run_forever()` loop. Registration first establishes a current-state baseline, so the initial state is not misreported as a new transition.

If a synchronous read does not obtain a valid value, the current API may fall back to `False` / `clear`; therefore `clear` is not a transport-health signal.

## More

- [Host Python Obstacle API Reference](../reference/obstacle.md)
