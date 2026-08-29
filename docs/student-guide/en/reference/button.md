# Button API Reference

Engineering reference. Visible content should be filtered by target, programming mode and version.

## `read_button()`

```python
read_button() -> int | None
```

Read the current digital state of the onboard Button. In High Level MicroPython this is the board-button convenience path over `read_sensor("button")`.

Typical return values:

- `0` — released
- `1` — pressed
- `None` — no valid state available yet in an implementation path

## `on_pressed()`

```python
on_pressed(sensor: str, callback) -> None
```

Register a callback for the transition from released to pressed. Use `sensor="button"` for the board Button.

## `on_released()`

```python
on_released(sensor: str, callback) -> None
```

Register a callback for the transition from pressed to released.

## `start_button()` / `stop_button()`

```python
start_button(period: int = 100) -> None
stop_button() -> None
```

Start or stop periodic Button monitoring.

## Execution lifecycle

| API | High Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `read_button()` | Immediate one-time read | not required |
| `on_pressed()` / `on_released()` | Register callbacks only; they do not start Button polling | required, and call `start_button()` first |
| `start_button()` | Registers a periodic Scheduler monitoring task | Scheduler must keep running |
| `stop_button()` | Removes the monitoring task immediately | not required |

This is an important current difference from IR/PIR/Light/Sound/Joystick callback APIs: **Button callback registration still requires an explicit `start_button()` or corresponding `start_sensor()` call.**

Host Python lifecycle is owned by the host process, transport and current Host API implementation. Device-side lifecycle instructions must not be copied blindly into a Host-only page.

## Availability

| Target | High Level MicroPython | Host Python |
|---|---:|---:|
| MangoX2 + Pico | supported | supported for compatible Host/Runtime versions |
| MangoX2 + Pico 2 W | supported | supported for compatible Host/Runtime versions |
| MangoLite + Pico 2 W | supported | resolved from Host package + Runtime capabilities |

## Configuration notes

External named Buttons may additionally depend on:

- GPIO/Pin assignment
- pull-up/pull-down mode
- active level
- debounce settings

Diagnostics should use the live Device Manager configuration and physical wiring.

## Example

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("pressed")

m.on_pressed("button", pressed)
m.start_button(100)
m.run_forever()
```

## Related APIs

`read_sensor()`, `start_sensor()`, `stop_sensor()`, `when_pressed()`, `when_released()`, `run_forever()`
