# Obstacle Sensor Guide

The Obstacle API converts digital obstacle input into `blocked` / `clear` semantics and supports named sensors.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.block_state())
    time.sleep(0.2)
```

Boolean form:

```python
print(m.is_blocked())
```

## Events

```python
from mangobox import Mango

m = Mango()
m.on_blocked(lambda: print('BLOCKED'))
m.on_clear(lambda: print('CLEAR'))
m.run_forever()
```

## Named sensors

```python
print(m.is_blocked('left'))
print(m.is_blocked('right'))
m.on_blocked(lambda: print('left blocked'), sensor='left')
```

Without a name, the default is `obstacle1`.

If the state looks inverted, check active-low configuration, wiring, and the module sensitivity adjustment before inverting values in application code.

## More

- [Obstacle API Reference](../reference/obstacle.md)
