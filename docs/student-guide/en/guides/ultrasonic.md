# Ultrasonic Distance Guide

The Ultrasonic API reads distance in centimeters. In supported profiles, MangoBox provides synchronous reads, Near/Far checks, event callbacks, and named sensors. Use the active target/mode profile and `m.supports("distance")` to confirm availability.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()

while True:
    print("cm =", m.distance())
    time.sleep(0.3)
```

`distance()` may return a number or `None`. `None` means there is no trustworthy valid measurement; it must not be treated as `0 cm`.

## Check whether an object is near

```python
if m.is_near(20):
    print("Object within 20 cm")
```

`is_near()` is a synchronous convenience check. When there is no valid measurement it currently returns `False`, so `False` may mean either "not near" or "no valid reading". Use `distance()` when that distinction matters.

## Near / Far events

```python
from mangobox import Mango

m = Mango()

m.on_near(20, lambda: print("NEAR"))
m.on_far(30, lambda: print("FAR"))

m.run_forever()
```

When both thresholds are used, Far must be greater than Near. The region between them provides hysteresis so small measurement changes do not repeatedly flip the state.

> High-Level MicroPython callback programs normally keep the Scheduler running with `m.run_forever()`. Host Python callbacks are dispatched by the Host reader/dispatch path, so the MicroPython lifecycle rule should not be copied blindly into Host programs.

## Named sensors

Configure Trigger/Echo pins and device names in Device Manager / Runtime, then select the sensor by name:

```python
print(m.distance("front"))
print(m.distance("rear"))
m.on_near(15, lambda: print("front near"), sensor="front")
```

Learner code should not recreate the GPIO driver for every project.

## Measurement limits

The current Host Student API normalizes invalid strings, timeouts, unparsable replies, and values outside 2–300 cm to `None`. Real-world usable distance also depends on the sensor, supply, target surface, angle, and mounting.

## Troubleshooting order

1. Confirm `m.supports("distance")`.
2. Test `m.distance()` by itself before adding Motor behavior.
3. If readings stay `None`, check Trigger/Echo, power, ground, and target direction.
4. For named sensors, verify the configured name exactly.
5. If readings jump, slow the update rate and stabilize the sensor/target geometry.
6. Add Near/Far callbacks only after raw distance is reliable.

## Small challenge

Use RGB LEDs to show zones:

- `<= 15 cm`: red
- `15–30 cm`: yellow
- `> 30 cm`: green
- `None`: LEDs off or an error indication

## More

- [Ultrasonic API Reference](../reference/ultrasonic.md)
