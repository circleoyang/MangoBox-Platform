# Ultrasonic Distance — Host Python Guide

MangoX2 Host API supports synchronous distance reads, Near/Far events, and named multi-ultrasonic sensors. The existing legacy CSV Runtime reply remains compatible; the new structured sensor bridge does not replace that parser path.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.distance())
    time.sleep(0.3)
```

No valid echo may return `None`.

## Named sensor

```python
print(m.distance('front'))
print(m.distance('rear'))
```

## Near / Far events

```python
m.on_near(20, lambda: print('NEAR'), sensor='front')
m.on_far(30, lambda: print('FAR'), sensor='front')
m.run_forever()
```

Far must be greater than Near when both thresholds are used.

The current shared Host contract primarily applies to MangoX2. MangoLite legacy ultrasonic fields are not promoted to a current Host capability from configuration alone.

## More

- [Host Python Ultrasonic API Reference](../reference/ultrasonic.md)
