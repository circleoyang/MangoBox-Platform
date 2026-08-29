# Button API Reference — Host Python

Applies to Host package `0.4.6` with a compatible Runtime.

## `read_button()`

```python
read_button() -> int | None
```

Host 0.4.6 sends a Runtime read command, waits for a fresh Button reply, and returns the current value. If no fresh reply arrives before timeout, the result may fall back to the latest known value or `None`.

Typical semantics:

- `0`: released
- `1`: pressed

## `on_pressed()` / `on_released()`

```python
on_pressed(sensor, callback) -> None
on_released(sensor, callback) -> None
```

Use `sensor="button"` for the board Button.

## `start_button()` / `stop_button()`

```python
start_button(period=100) -> None
stop_button() -> None
```

`start_button()` asks the Runtime to begin reporting Button state.

## Execution lifecycle

```text
Runtime Button event
→ Host UART listener
→ semantic pressed/released transition
→ callback thread
```

A callback program normally uses:

```python
m.on_pressed("button", callback)
m.start_button(100)
m.run_forever()
```

Here `run_forever()` keeps the PC process alive; it does not drive the Runtime sensor Scheduler.

A direct `read_button()` is synchronous and does not require `run_forever()`.

## Availability

Use `m.supports("button")` / `m.capabilities()`. Host capability discovery uses the Runtime configuration snapshot already captured during startup rather than opening a new probe path.
