# IR Remote API Reference

> **Availability**: the current canonical profiles expose the `ir` capability on MangoX2 and MangoLite in both High-Level MicroPython and Host Python. MangoLite uses an onboard receiver; MangoX2 uses an optional external receiver gated by Runtime configuration.

Canonical import:

```python
from mangobox import Mango
m = Mango()
```

## `on_ir_pressed()`

```python
m.on_ir_pressed(key, callback)
```

Run `callback` when a named NEC teaching-remote key enters the pressed state.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `key` | str | Standard key name such as `"ok"`, `"up"`, `"1"`, or `"*"`. |
| `callback` | callable | No-argument callback. |

### Raises

- unknown key: `ValueError`
- non-callable callback: `TypeError`
- MangoX2 IR disabled in live Runtime config: `RuntimeError`

## `on_ir_released()`

```python
m.on_ir_released(key, callback)
```

Run `callback` when the key leaves the held/pressed state.

NEC repeat frames maintain held state; they should not flood repeated pressed callbacks. Release is inferred when repeat activity stops according to the receiver timeout.

## `is_ir_pressed()`

```python
m.is_ir_pressed(key) -> bool
```

Return whether the named IR key is currently held.

### Host Python

Host 0.4.6 sends `{"target":"ir","action":"read"}`, waits for the Runtime state reply, and returns whether the requested key matches the current held state.

### High-Level MicroPython

Reads decoder-maintained held state. A custom polling loop must continue servicing the Scheduler so the decoder can update.

## Supported standard key names

```text
1 2 3
4 5 6
7 8 9
* 0 #
up left ok right down
```

## Execution lifecycle

| API | High-Level MicroPython | Host Python |
|---|---|---|
| `on_ir_pressed()` / `on_ir_released()` | create/start receiver; Scheduler must keep running | register Host callbacks; reader/dispatch receives Runtime events |
| `is_ir_pressed()` | read decoder held state | synchronous Runtime state read |

MicroPython callback programs normally end with:

```python
m.run_forever()
```

Host Python does not need a separate MicroPython scheduler loop for IR callbacks.

## Hardware / configuration notes

### MangoLite

- onboard IR receiver
- current baseline GP22
- onboard availability is not gated by legacy `enabled_modules.ir_sensor`

### MangoX2

- optional external receiver
- `enabled_modules.ir_sensor` must be enabled
- active GPIO comes from `ir_sensor_pin`

## Troubleshooting

### `supports("ir")` is True but nothing happens

`supports()` confirms the API path, not electrical health. On MangoX2 check enable state, GPIO, VCC/GND/Signal, receiver orientation, and remote compatibility.

### Held key repeatedly fires pressed callbacks

Canonical semantics should treat NEC repeat frames as held-state maintenance rather than new presses. Verify that learner code is using the Student API instead of raw repeat frames.

### Host and MicroPython examples differ

The learner-facing method names are the same, but lifecycle differs: Host uses reader/dispatch; MicroPython uses Scheduler/decoder updates.

## Related APIs

`on_ir_pressed()`, `on_ir_released()`, `is_ir_pressed()`, `supports("ir")`, `capabilities()`, `run_once()`, `run_forever()`
