# IR Remote API Reference

Engineering reference. Visible content should be filtered by target, programming mode and version.

## `on_ir_pressed()`

```python
on_ir_pressed(key: str, callback) -> None
```

Run a callback when a named NEC IR key transitions into the pressed state.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `key` | `str` | Key name such as `"ok"`, `"up"`, `"1"` or `"*"`. |
| `callback` | callable | Function invoked for the pressed transition. |

### Raises

- `ValueError` when `key` is not in the supported IR key map.
- `TypeError` when `callback` is not callable.
- `RuntimeError` on MangoX2 High Level MicroPython when the optional IR module is disabled.

MangoLite onboard IR does not use the legacy `enabled_modules.ir_sensor` switch as the Student API gate.

## `on_ir_released()`

```python
on_ir_released(key: str, callback) -> None
```

Run a callback when the key is considered released.

NEC repeat frames maintain the held state and should not flood repeated pressed callbacks. Release is inferred after repeat activity stops for the configured timeout.

## `is_ir_pressed()`

```python
is_ir_pressed(key: str) -> bool
```

Return whether the named key is currently held.

## Supported key names

Current standard 17-key NEC teaching remote mapping:

```text
1 2 3
4 5 6
7 8 9
* 0 #
up left ok right down
```

## Availability

| Target | High Level MicroPython | Host Python |
|---|---:|---:|
| MangoX2 + Pico | supported; optional receiver | do not currently advertise a complete Host IR learner path |
| MangoX2 + Pico 2 W | supported; optional receiver | do not currently advertise a complete Host IR learner path |
| MangoLite + Pico 2 W | supported; onboard receiver | Host capability still requires an actual learner-facing Host method |

A Runtime configuration key alone must never make Host IR appear in the documentation.

## Hardware/configuration notes

### MangoLite

- onboard IR receiver
- fixed GP22
- the Student API directly owns the receiver path

### MangoX2

- optional external IR receiver
- `enabled_modules.ir_sensor` must be `True`
- active GPIO/Pin is read from `ir_sensor_pin`
- the semantic IR path does not use the historical `ir_receiver_pin` as its MangoX2 Pin source

## Execution lifecycle

| API | High Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `on_ir_pressed()` / `on_ir_released()` | create/start the IR receiver and schedule receiver `update()` | required |
| `is_ir_pressed()` | reads held state maintained by the decoder; the decoder still needs Scheduler updates | a one-shot read is not a complete IR test |

IR callbacks therefore do not need a separate Button-style `start_button()` call, but the event loop must continue servicing Scheduler tasks.

If polling `is_ir_pressed()` manually, call `m.run_once()` regularly inside the custom loop, or prefer callbacks plus `m.run_forever()`. Do not treat a single `print(m.is_ir_pressed("ok"))` as a reliable receiver test.

## Example

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("OK")

m.on_ir_pressed("ok", pressed)
m.run_forever()
```

## Related APIs

`on_ir_released()`, `is_ir_pressed()`, `supports("ir")`, `capabilities()`, `run_once()`, `run_forever()`
