# OLED API Reference

Engineering reference. Start with the [OLED guide](../guides/oled.md) for learner-oriented usage.

## `clear_oled()`

```python
clear_oled() -> None
```

Clears the OLED.

## `text()`

```python
text(text, x=0, y=0, size=1) -> None
```

| Parameter | Type | Description |
|---|---|---|
| `text` | `str` | Text to display. High Level MicroPython supports `\n` line breaks. |
| `x` | `int` | X coordinate. |
| `y` | `int` | Y coordinate. |
| `size` | `int` | Text scale. |

## `flash_text()`

```python
flash_text(text, x=0, y=0, size=1, period=500, duration=0) -> None
```

Starts a flashing-text effect.

## Execution lifecycle

Current High Level MicroPython OLED semantics differ by target:

| Target / API | Current behavior | `m.run_forever()` |
|---|---|---:|
| MangoLite + Pico 2 W `clear_oled()` / `text()` (Runtime 0.6.0-rc22) | commands enter the OLED queue and are serviced by Scheduler | **currently required** |
| MangoX2 + Pico / Pico 2 W `clear_oled()` / `text()` (Runtime 0.2.6-rc10) | handler uses the immediate path | not required |
| `flash_text()` | continuous Scheduler-driven flashing | required |

To keep one learner example working across hardware, the current Guide temporarily includes `m.run_forever()` after static OLED output.

An approved deferred Runtime task will make MangoLite static `clear_oled()` and `text()` immediate, aligning them with MangoX2. Remove the temporary static-OLED `run_forever()` requirement only after the Runtime is built and all three hardware paths are validated.

`flash_text()` remains Scheduler-driven after that alignment.

## Availability

Availability is resolved from target, programming mode, software versions, Runtime module enablement, and the actual Student API method set. MangoLite OLED is optional; MangoX2 normally enables OLED in its default profile. Host Python documentation must not infer support from a Runtime config key alone.

## Configuration

```text
enabled_modules.oled
oled_i2c_id
oled_sda_pin
oled_scl_pin
oled_addr
oled_width
oled_height
```

## Related

`supports("oled")`, `clear_oled()`, `text()`, `flash_text()`, `run_forever()`
