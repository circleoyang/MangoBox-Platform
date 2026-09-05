# Line Tracking Guide

Line Tracking uses two digital sensors and resolves them into `none`, `left`, `right`, or `both`.

> MangoX2 defaults Line Tracking to GP12/GP13, which conflicts with current Host UART ownership. Therefore this capability is currently shown only for High-Level MicroPython profiles.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.line_left(), m.line_right(), m.line_state())
    time.sleep(0.2)
```

## State events

```python
from mangobox import Mango

m = Mango()

def changed(state):
    print('state =', state)

m.on_line_change(changed)
m.on_line_left(lambda: print('LEFT'))
m.on_line_right(lambda: print('RIGHT'))
m.on_line_both(lambda: print('BOTH'))
m.on_line_clear(lambda: print('NONE'))
m.run_forever()
```

`on_line_change()` receives the new state string; the four state-specific callbacks receive no argument.

Before combining this sensor with motor control, verify left/right semantics and physical sensor height independently.

## More

- [Line Tracking API Reference](../reference/line_tracking.md)
