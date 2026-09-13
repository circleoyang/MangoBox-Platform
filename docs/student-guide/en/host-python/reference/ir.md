# Host Python IR API Reference

> **Availability**: MangoThonny Host 0.4.6 provides the current learner-facing IR API. MangoLite uses fixed onboard IR; MangoX2 uses an optional external receiver and rejects use when live Runtime config has IR disabled.

## `is_ir_pressed()`

```python
m.is_ir_pressed(key) -> bool
```

Synchronously request the current Runtime IR state and return `True` when the selected key is currently pressed/held.

Unknown key names raise `ValueError`.

## `on_ir_pressed()`

```python
m.on_ir_pressed(key, callback)
```

Run `callback` when the NEC key transitions to pressed.

## `on_ir_released()`

```python
m.on_ir_released(key, callback)
```

Run `callback` when the key transitions to released.

Non-callable callbacks raise `TypeError`.

## Host lifecycle

Host IR callbacks are delivered by the background reader/dispatch path. Registering a callback asks Runtime to start the IR monitor; Host Python does **not** need the MicroPython `m.run_forever()` loop for IR callbacks.

The Python process must remain alive, for example:

```python
from mangobox import Mango
import time

m = Mango()
m.on_ir_pressed("ok", lambda: print("OK"))

while True:
    time.sleep(1)
```

## Key names

```text
1 2 3 4 5 6 7 8 9 * 0 # up left ok right down
```

Names are normalized to lowercase.

## Target gate

### MangoLite

Fixed onboard IR is not gated by `enabled_modules.ir_sensor`.

### MangoX2

If the live Runtime snapshot reports `ir_sensor=false`, the Host API raises `RuntimeError`. The active GPIO is managed by `ir_sensor_pin`.

## Related APIs

`is_ir_pressed()`, `on_ir_pressed()`, `on_ir_released()`, `supports("ir")`
