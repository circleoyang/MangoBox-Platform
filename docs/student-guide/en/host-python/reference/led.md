# RGB LED API Reference — Host Python

Applies to Host package `0.4.6` with a resolver-approved compatible Runtime.

## `led_all()`

```python
led_all(color="#ffffff", duration=0, strip=None) -> None
```

## `led()` / `led_range()`

```python
led(index, color="#ffffff", duration=0, strip=None) -> None
led_range(start, end, color="#ffffff", duration=0, strip=None) -> None
```

## `brightness()`

```python
brightness(power=30, duration=0, strip=None) -> None
```

## `rainbow()` / `breath()`

```python
rainbow(period=20, duration=0, strip=None) -> None
breath(color="#ff00ff", period=50, duration=0, strip=None) -> None
```

## `led_off()`

```python
led_off(strip=None) -> None
```

## Execution lifecycle

Host methods send commands to the Runtime through `send_command()`. Continuous LED effects are executed by the Runtime Scheduler.

| API | Host `m.run_forever()` |
|---|---:|
| static LED output | not required |
| brightness | not required |
| Runtime effects | not required to drive the animation |
| stop / clear | not required |

Host `run_forever()` keeps the PC process alive for incoming events; it is not the LED animation loop.

## Availability

Use `m.supports("led")`, `m.capabilities()`, and the selected Host + Runtime compatibility profile. Configuration keys alone do not establish API support.

## Diagnostics

Do not use PC-side `machine.Pin`. Inspect enablement, pin assignment, and LED count through Device Manager / the Runtime configuration snapshot.
