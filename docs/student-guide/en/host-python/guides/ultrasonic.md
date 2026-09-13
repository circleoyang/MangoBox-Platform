# Ultrasonic Distance — Host Python Guide

MangoThonny Host 0.4.6 currently exposes the `distance` Student API on both MangoX2 and MangoLite Host profiles. It supports synchronous reads, Near/Far events, and named sensors. Physical module presence, enable state, and Trigger/Echo configuration still come from Runtime / Device Manager.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
print("Distance supported =", m.supports("distance"))

while True:
    print("cm =", m.distance())
    time.sleep(0.3)
```

No valid echo may return `None`. Do not treat `None` as `0 cm`.

## Named sensor

```python
print(m.distance("front"))
print(m.distance("rear"))
```

Trigger/Echo pins and device names belong to Runtime / Device Manager; learner code selects a device with `sensor="name"`.

## Near / Far events

```python
from mangobox import Mango
import time

m = Mango()

m.on_near(20, lambda: print("NEAR"), sensor="front")
m.on_far(30, lambda: print("FAR"), sensor="front")

while True:
    time.sleep(1)
```

Host callbacks are delivered by the background reader/dispatch path and do not require the MicroPython `m.run_forever()` loop. If Near and Far are both configured, Far must be greater than Near.

## Host measurement semantics

- `distance()` waits for the matching Runtime reply rather than relying only on an old cached value.
- Timeout, empty/unparsable replies, and values outside the current Host valid range are normalized to `None`.
- `is_near()` returns `False` when there is no valid measurement, so `False` is not a transport-health check.
- Near/Far monitoring uses short-term filtering and hysteresis.

## Troubleshooting

1. Confirm `m.supports("distance")`.
2. Test `m.distance()` before combining it with Motor behavior.
3. Persistent `None`: check Trigger/Echo, power, common ground, target direction, and sensor name.
4. No callback: make sure the Python process remains alive and Runtime streaming events are arriving.

## More

- [Host Python Ultrasonic API Reference](../reference/ultrasonic.md)
