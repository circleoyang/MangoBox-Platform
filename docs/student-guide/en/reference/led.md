# RGB LED API Reference

Engineering reference. The future resolver should filter visible content by target, programming mode and version.

## `led_all()`

```python
led_all(color: str = "#ffffff", duration: int = 0, strip: str | None = None) -> None
```

Set every LED on the selected strip to the same color.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `color` | `str` | Supported color name or `#RRGGBB`. |
| `duration` | `int` | Runtime duration argument; `0` means no automatic end time is requested. |
| `strip` | `str | None` | LED strip name; `None` uses the current default strip. |

### Raises

`ValueError` when the color is neither a supported name nor a valid `#RRGGBB` value.

## `led()`

```python
led(index: int, color: str = "#ffffff", duration: int = 0, strip: str | None = None) -> None
```

Control one LED by index.

## `led_range()`

```python
led_range(start: int, end: int, color: str = "#ffffff", duration: int = 0, strip: str | None = None) -> None
```

Control a range of LEDs.

## `led_off()`

```python
led_off(strip: str | None = None) -> None
```

Stop active LED effects and clear the strip.

## `brightness()`

```python
brightness(power: int = 30, duration: int = 0, strip: str | None = None) -> None
```

Set LED brightness/power level.

## `rainbow()` / `breath()`

```python
rainbow(period: int = 20, duration: int = 0, strip: str | None = None) -> None
breath(color: str = "#ff00ff", period: int = 50, duration: int = 0, strip: str | None = None) -> None
```

Start high-level effects handled by the Runtime Scheduler rather than requiring a learner-written blocking loop.

## Execution lifecycle

| API / usage | High Level MicroPython behavior | `m.run_forever()` |
|---|---|---:|
| `led()` / `led_all()` / `led_range()` with `duration=0` | Immediate LED-frame write | not required |
| `brightness(..., duration=0)` | Immediate | not required |
| `led_off()` | Immediate stop and clear | not required |
| static LED API with `duration > 0` | output is immediate, later restore is scheduled | required if the timed restore must occur |
| `rainbow()` / `breath()` | continuous Scheduler effect | required |
| meteor / color wipe / sparkle / fire flicker | continuous Scheduler effect | required |

This means “the LEDs light correctly” and “the animation keeps moving” are different tests. If static `led_all()` works but an effect is frozen, inspect the event loop before suspecting GPIO wiring.

## Availability

| Target | High Level MicroPython | Host Python |
|---|---:|---:|
| MangoX2 + Pico | supported | supported for compatible Host/Runtime versions |
| MangoX2 + Pico 2 W | supported | supported for compatible Host/Runtime versions |
| MangoLite + Pico 2 W | supported | resolved from Host package + Runtime capabilities |

## Hardware/configuration notes

- MangoX2 currently defaults the onboard strip to GP6 with 8 LEDs, but configurable installations should use the live configuration.
- MangoLite currently uses the fixed onboard strip on GP2 with 6 LEDs.
- External strips should always follow the device's current configuration rather than a memorized Pin value.

## Example

Immediate:

```python
from mangobox import Mango

m = Mango()
m.led_all("#0088ff")
```

Scheduler-driven:

```python
from mangobox import Mango

m = Mango()
m.rainbow()
m.run_forever()
```

## Related APIs

`select_led_strip()`, `led_show_one()`, `led_show_all()`, `led_show_range()`, `led_clear()`, `led_start_rainbow()`, `led_start_breathing()`, `run_forever()`
