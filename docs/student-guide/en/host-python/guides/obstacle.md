# Obstacle Sensor — Host Python Guide

MangoX2 Host API supports named obstacle sensors, synchronous reads, and blocked/clear callbacks.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.is_blocked(), m.block_state())
    time.sleep(0.2)
```

## Named sensor

```python
print(m.is_blocked('left'))
print(m.block_state('right'))
```

## Events

```python
m.on_blocked(lambda: print('LEFT BLOCKED'), sensor='left')
m.on_clear(lambda: print('LEFT CLEAR'), sensor='left')
m.run_forever()
```

Host establishes a current-state baseline before transition callbacks, so initial registration is not misreported as a state change.

MangoLite legacy obstacle configuration is not automatically promoted to a current Host capability.

## More

- [Host Python Obstacle API Reference](../reference/obstacle.md)
