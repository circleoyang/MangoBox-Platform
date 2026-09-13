# Ultrasonic API Reference

> **Availability**: the `distance` capability is currently advertised by MangoX2 and MangoLite High-Level MicroPython / Host Python profiles. Physical availability still depends on the active hardware, Runtime configuration, and module state.

Canonical import:

```python
from mangobox import Mango
m = Mango()
```

## `distance()`

```python
m.distance(sensor=None) -> float | None
```

Synchronously read distance in **cm**.

| Parameter | Type | Default | Description |
|---|---|---:|---|
| `sensor` | str \| None | `None` | Named ultrasonic sensor; omit it to use the current default device. |

### Returns

- Valid measurement: `float`; the current Host path normalizes to 0.1 cm.
- Invalid / missing measurement: `None`.

The current Host Student API treats timeout, empty/none/null replies, unparsable values, and values outside 2–300 cm as invalid.

## `is_near()`

```python
m.is_near(distance_cm, sensor=None) -> bool
```

Read the current distance and return whether it is `<= distance_cm`.

`distance_cm` must be greater than 0. With no valid measurement, the current API returns `False`; therefore `False` is not a transport-health signal.

## `on_near()`

```python
m.on_near(distance_cm, callback, period=100, sensor=None)
```

Run `callback` when the measurement enters the Near region.

| Parameter | Default | Description |
|---|---:|---|
| `distance_cm` | required | Near threshold in cm; must be `> 0`. |
| `callback` | required | Must be callable. |
| `period` | `100` | Monitor update interval in ms. The current Host path clamps the actual monitor period to at least 60 ms. |
| `sensor` | `None` | Named sensor. |

## `on_far()`

```python
m.on_far(distance_cm, callback, period=100, sensor=None)
```

Run `callback` when the measurement enters the Far region. If Near and Far are both configured, **Far must be greater than Near** or the API raises `ValueError`.

## Hysteresis

For example:

```python
m.on_near(20, near)
m.on_far(30, far)
```

- `<= 20 cm`: Near
- `>= 30 cm`: Far
- `20–30 cm`: preserve the current region

This hysteresis is intentional and reduces repeated triggering around one boundary.

## Event lifecycle

High-Level MicroPython callback programs keep the Scheduler running with:

```python
m.run_forever()
```

Host Python events are received by the Host reader/dispatch path; do not treat the MicroPython `run_forever()` requirement as a Host requirement.

## Named sensors

Trigger/Echo GPIO and names belong in Device Manager / Runtime configuration. Learner code selects a device with `sensor="name"`.

```python
print(m.distance("front"))
m.on_near(15, callback, sensor="front")
```

## Troubleshooting

### `distance()` always returns `None`

Check power, common ground, Trigger/Echo mapping, target direction, and the selected sensor name. Do not convert timeout to `0 cm`.

### Near/Far callbacks chatter

Use two different thresholds with Far > Near. If necessary, slow the update rate or improve the mounting geometry.

### Named sensor does not respond

Verify that the name matches Runtime / Device Manager configuration exactly. Do not rebuild the pin driver inside each learner program.

## Related APIs

`distance()`, `is_near()`, `on_near()`, `on_far()`, `supports("distance")`, `run_forever()`
