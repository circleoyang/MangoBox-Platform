# Host Python Obstacle API Reference

> **Availability**: the current `obstacle` capability is advertised only by MangoX2 Host Python profiles. MangoLite Host profiles do not currently advertise it.

## `is_blocked()`

```python
m.is_blocked(sensor=None) -> bool
```

Synchronously read the selected obstacle sensor. With no name, the default sensor is `obstacle1`.

## `block_state()`

```python
m.block_state(sensor=None) -> str
```

Return `"blocked"` or `"clear"`.

If a synchronous read does not obtain a valid value, the current API may fall back to `False` / `clear`, so `clear` is not a transport- or wiring-health check.

## `on_blocked()`

```python
m.on_blocked(callback, sensor=None, period=20)
```

Run `callback` when state transitions from clear to blocked.

## `on_clear()`

```python
m.on_clear(callback, sensor=None, period=20)
```

Run `callback` when state transitions from blocked to clear.

| Parameter | Description |
|---|---|
| `callback` | Must be callable. |
| `sensor` | Named sensor; `None` selects `obstacle1`. |
| `period` | Requested monitor period in ms; the current command path clamps it to at least 10 ms. |

## Host lifecycle

Host callbacks are delivered by the background reader/dispatch path and do not require the MicroPython `m.run_forever()` loop. The Python process itself must remain alive.

Monitor registration first reads the current state as a baseline, so registration itself does not generate a fake transition callback.

## Configuration

Sensor names, GPIO mapping, and active level belong to Runtime / Device Manager configuration. If semantics are reversed, fix the configuration or wiring rather than reversing results independently in each learner program.

## Related APIs

`is_blocked()`, `block_state()`, `on_blocked()`, `on_clear()`, `supports("obstacle")`
