# Host Python Ultrasonic API Reference

> **Availability**: MangoThonny Host 0.4.6 advertises the `distance` capability on current MangoX2 and MangoLite Host profiles. Physical sensor presence and Trigger/Echo configuration still belong to Runtime / Device Manager.

## `distance()`

```python
m.distance(sensor=None) -> float | None
```

Synchronously read distance in cm. Host waits for the matching Runtime reply generation; invalid/missing measurements return `None`.

The current Host path normalizes timeout, empty/unparsable replies, and values outside 2–300 cm to `None`.

## `is_near()`

```python
m.is_near(distance_cm, sensor=None) -> bool
```

Return whether the current valid distance is `<= distance_cm`. The threshold must be greater than 0. With no valid measurement, the current API returns `False`.

## `on_near()`

```python
m.on_near(distance_cm, callback, period=100, sensor=None)
```

Run `callback` when the filtered distance enters the Near region.

## `on_far()`

```python
m.on_far(distance_cm, callback, period=100, sensor=None)
```

Run `callback` when the filtered distance enters the Far region. If Near and Far are both configured, Far must be greater than Near or the API raises `ValueError`.

## Parameters

| Parameter | Description |
|---|---|
| `distance_cm` | Threshold in cm; must be `> 0`. |
| `callback` | Must be callable. |
| `period` | Requested monitor period in ms; current Host monitoring clamps the actual period to at least 60 ms. |
| `sensor` | Named sensor; `None` uses the current default device. |

## Host event lifecycle

Host callbacks are delivered by the background reader/dispatch path and do not require the MicroPython `m.run_forever()` loop. The Python process itself must remain alive.

Near/Far streaming uses a short recent-value window and median filtering before transition logic is applied.

## Hysteresis

```python
m.on_near(20, near)
m.on_far(30, far)
```

- `<= 20`: Near
- `>= 30`: Far
- `20–30`: preserve the current region

## Named sensors

```python
print(m.distance("front"))
m.on_near(15, callback, sensor="front")
```

Trigger/Echo pins and names are Runtime / Device Manager configuration; learner code should not recreate the raw driver.

## Related APIs

`distance()`, `is_near()`, `on_near()`, `on_far()`, `supports("distance")`
