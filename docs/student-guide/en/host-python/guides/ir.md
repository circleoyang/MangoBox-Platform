# IR Remote — Host Python Guide

Host Python uses the current Runtime structured JSON reply/event path for NEC IR. MangoLite has fixed onboard GP22 IR; MangoX2 uses an optional external receiver gated by `enabled_modules.ir_sensor` and `ir_sensor_pin`.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
print('IR supported =', m.supports('ir'))
while True:
    print('OK =', m.is_ir_pressed('ok'))
    time.sleep(0.1)
```

Supported keys: `1..9`, `0`, `*`, `#`, `up`, `down`, `left`, `right`, `ok`.

## Press / release events

```python
from mangobox import Mango

m = Mango()
m.on_ir_pressed('ok', lambda: print('OK pressed'))
m.on_ir_released('ok', lambda: print('OK released'))
m.run_forever()
```

The device Runtime owns NEC decoding. Host Python consumes semantic state/events and does not decode pulse timing again.

## MangoLite vs MangoX2

- MangoLite: fixed onboard GP22 IR remains available independently of the historical optional `ir_sensor` switch.
- MangoX2: the live Runtime config must enable `ir_sensor`.

## More

- [Host Python IR API Reference](../reference/ir.md)
