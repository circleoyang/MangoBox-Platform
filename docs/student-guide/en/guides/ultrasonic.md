# Ultrasonic Distance Guide

The Ultrasonic API returns distance in centimeters. The current shared contract supports named multi-device configuration on MangoX2.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print('cm =', m.distance())
    time.sleep(0.3)
```

A missing or invalid echo may return `None`; do not treat a timeout as `0 cm`.

## Near check

```python
if m.is_near(20):
    print('Object within 20 cm')
```

## Near / Far events

```python
from mangobox import Mango

m = Mango()
m.on_near(20, lambda: print('NEAR'))
m.on_far(30, lambda: print('FAR'))
m.run_forever()
```

When both thresholds are used, the Far threshold must be greater than Near. This creates hysteresis and avoids repeated triggering near one boundary.

## Named sensors

```python
print(m.distance('front'))
print(m.distance('rear'))
m.on_near(15, lambda: print('front near'), sensor='front')
```

Names and Trigger/Echo pins are configured by Device Manager / Runtime.

## More

- [Ultrasonic API Reference](../reference/ultrasonic.md)
