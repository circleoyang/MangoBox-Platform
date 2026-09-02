# PIR Motion — Host Python Guide

Host Python uses Runtime state replies plus `motion_detected` / `motion_cleared` semantic events. It does not read GPIO directly from the PC.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
print('Motion supported =', m.supports('motion'))
while True:
    print(m.is_motion_detected())
    time.sleep(0.2)
```

## Events

```python
from mangobox import Mango

m = Mango()
m.on_motion_detected(lambda: print('MOTION'))
m.on_motion_cleared(lambda: print('CLEAR'))
m.run_forever()
```

`is_motion_detected()` performs a synchronous read without permanently enabling streaming. Callback registration starts the Runtime monitor.

PIR is config-gated. If the live Runtime snapshot reports `enabled_modules.pir_sensor=false`, Host API use is rejected rather than bypassing Runtime configuration.

## More

- [Host Python PIR API Reference](../reference/pir.md)
