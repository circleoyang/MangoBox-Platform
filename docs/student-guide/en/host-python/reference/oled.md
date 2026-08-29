# OLED API Reference — Host Python

Applies to Host package `0.4.6` with a compatible Runtime.

## `clear_oled()`

```python
clear_oled() -> None
```

## `text()`

```python
text(text, x=0, y=0, size=1) -> None
```

The Host may extract/upload required CJK glyphs and supports `\n` multi-line text.

## `flash_text()`

```python
flash_text(text, x=0, y=0, size=1, period=500, duration=0) -> None
```

## Execution lifecycle

Host OLED behavior differs from High Level MicroPython:

- static `text()` may upload font glyphs and use deferred `show_text` + render in hardware mode;
- a Host `threading.Timer` coalesces deferred renders;
- `close()` flushes a pending render;
- `flash_text()` delegates the continuing effect to the Runtime.

Static Host OLED output therefore does not require `m.run_forever()` to become visible, and Runtime flashing is not driven by the Host event loop.

## Availability

Use `m.supports("oled")` plus the selected compatibility profile. On MangoLite Host, OLED can be API-supported while currently disabled on the connected device; these are separate states.

## Configuration

Inspect OLED enablement, I2C bus, SDA/SCL pins, and address through Device Manager / the Runtime configuration snapshot. Do not use PC-side `machine.I2C`.
