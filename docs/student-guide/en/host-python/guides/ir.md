# IR Remote — Host Python Guide

Host Python uses the Runtime structured JSON reply/event path for NEC IR. MangoLite has fixed onboard GP22 IR; MangoX2 uses an optional external receiver managed by `enabled_modules.ir_sensor` and `ir_sensor_pin`.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
print("IR supported =", m.supports("ir"))

while True:
    print("OK =", m.is_ir_pressed("ok"))
    time.sleep(0.1)
```

Supported keys: `1..9`, `0`, `*`, `#`, `up`, `down`, `left`, `right`, `ok`.

## Press / release events

```python
from mangobox import Mango
import time

m = Mango()

m.on_ir_pressed("ok", lambda: print("OK pressed"))
m.on_ir_released("ok", lambda: print("OK released"))

while True:
    time.sleep(1)
```

Host callbacks are delivered by the background reader/dispatch path. **IR callbacks do not require the MicroPython `m.run_forever()` loop**; the Host Python process only needs to remain alive.

The device Runtime owns NEC pulse decoding, repeat handling, and released-state inference. Host Python consumes semantic state/events rather than decoding raw pulse timing again.

## MangoLite vs MangoX2

- **MangoLite**: fixed onboard GP22 IR remains available independently of the historical optional `ir_sensor` switch.
- **MangoX2**: the live Runtime config must enable `ir_sensor`; `ir_sensor_pin` selects the external Signal GPIO.

## Troubleshooting

### `supports("ir")` is True but keys do not respond

`supports()` confirms the Host API path, not wiring health. On MangoX2 verify module enablement, pin, VCC/GND/Signal, and receiver orientation.

### Callbacks never fire

Make sure the Host process does not exit immediately, then verify that Runtime IR events are arriving. `m.run_forever()` is not required for Host IR callbacks.

## More

- [Host Python IR API Reference](../reference/ir.md)
