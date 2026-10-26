# OLED API Reference — candidate source

Availability: the selected MangoX2 0.2.10-rc2, MangoLite 0.6.5-rc2 or BarePico 0.1.0-rc6 High-Level MicroPython profile. Display, drawing and playback require an enabled OLED with valid hardware settings; BarePico uses an external display. `oled_media_list()` and `oled_media_info()` only read the filesystem and do not require an initialized or enabled physical OLED. This page does not establish Host Python or older stable support; the profile records the exact source commit and validation boundaries.

## Text, clearing and lifecycle

| Signature | Parameters and behavior | Return |
| --- | --- | --- |
| `m.text(text, x=0, y=0, size=1)` | Converts text to str; pixel coordinates; recommended scale 1..3 in quarter steps; lays out newline-separated text | Carrier: `None`; BarePico: command result `True` |
| `m.send_text(text, x=0, y=0, size=1)` | Compatible single-line entry; prefer `text()` in teaching | Carrier `None`; BarePico `True` |
| `m.clear()` | Alias of `clear_oled()` | Carrier `None`; BarePico `True` |
| `m.clear_oled()` | Clear the shared OLED | Carrier `None`; BarePico `True` |
| `m.clear_screen()` | Compatibility alias for clearing | Carrier `None`; BarePico `True` |
| `m.flash_text(text, x=0, y=0, size=1, period=500, duration=0)` | period/duration in ms; duration=0 continues; event loop required | Carrier `None`; BarePico `True` |
| `m.start_flash_text(text, x=0, y=0, size=1, period=500, duration=0)` | Compatible entry with the same arguments | Carrier `None`; BarePico `True` |

Size is a driver-limited scale, not an arbitrary font point size. Chinese text needs a prepared glyph cache. Long text is not automatically fitted to the screen. Keep `run_forever()` running or call `run_once()` from the foreground; use one loop strategy and never enter it recursively from a callback.

## Drawing widgets

| Signature | Types, ranges and behavior |
| --- | --- |
| `m.oled_progress(value, maximum=100, x=0, y=18, width=120, height=12)` | Shared usage: integer values/pixels, 1 ≤ maximum ≤ 10000 and 0 ≤ value ≤ maximum; width/height at least 3, rectangle within the display; redraws its progress screen |
| `m.oled_waveform(values, low=0, high=65535)` | Shared usage: 1..128 integer samples, each within low..high; 0 ≤ low < high ≤ 65535; low/high define the vertical scale |
| `m.oled_menu(entries, selected=0, size=1)` | 1..24 nonempty single-line strings, at most 24 characters each; valid zero-based selection; Chinese requires glyphs and sufficient width |
| `m.oled_pixel(x, y, color=1)` | x=0..127, y=0..63; color normalizes to 0 or 1 |
| `m.oled_line(x, y, x2, y2, color=1)` | Both endpoints must lie within the display |
| `m.oled_rect(x, y, width, height, color=1, fill=False)` | Positive width/height; entire rectangle within the display; fill chooses filled or outline |

Carrier methods return the dispatched command `dict`; BarePico returns `True` after handling. Neither proves visible output. Conversion errors may be raised by the facade; Carrier Runtime failures may instead be reported by its command path. Validate inputs and inspect the display rather than interpreting a truthy command dictionary as hardware success.

The drawing implementations differ. Carrier progress validates that the entire rectangle fits and has no 10000 maximum limit; BarePico limits maximum to 10000 and can report other geometry failures through the canvas path. Carrier waveforms require actual integer samples within low..high and spread them across the screen width. BarePico converts samples to integers, clips out-of-range values and uses one horizontal pixel per sample. Use the shared ranges above without relying on implicit conversion or identical pixel placement.

Menu layout also differs: BarePico ASCII at size=1 retains the six-row legacy menu. Carrier menus, and BarePico Chinese/other-scale menus, derive visible rows from glyph height and validate text width. `selected` always indexes the full entries list.

```python
from mangobox import Mango

m = Mango()
m.oled_menu(["Play", "Light", "Stop"], selected=1, size=1)
m.run_forever()
```

## RAM images and animation

| Signature | Parameters, return and errors |
| --- | --- |
| `m.upload_image(bitmap, slot=0)` | Exactly 1024 bytes/bytearray in 128×64 MONO_VLSB format; integer slot 0..3; returns `True` after dispatch; invalid type, size or slot raises `ValueError` |
| `m.show_image(bitmap=None, slot=0)` | Optional bitmap uploads first; otherwise shows a ready slot; Carrier returns command dict, BarePico `True`; incomplete slots cannot be shown |
| `m.start_image_loop(frames, period=500, duration=0)` | list/tuple with 2..4 slot indices or bitmaps; the resulting slots must be distinct; period=100..10000 ms; nonnegative duration, 0 continuous; Carrier returns command dict, BarePico `True` |
| `m.stop_image_loop()` | Removes this display's animation tasks; does not delete Flash files or necessarily clear the visible frame; Carrier `None`, BarePico `True` |

A bitmap is pixel data, not PNG/JPEG file bytes. Slots must be distinct, but identical bitmap contents may occupy different slots. A bitmap is uploaded to the slot matching its position in frames, so check for collisions when combining bitmaps and existing indices. Earlier uploads can occur before a later input error; failure does not guarantee unchanged RAM slots. The runtime displays the first frame when starting; subsequent frames and timed stopping require Scheduler progress.

For cross-family animation, use `duration=0` or at least 10 ms. BarePico requires a Scheduler task period of at least 10 ms. With a multi-frame duration of 1..9 ms, the first frame and animation task can already exist before scheduling the stop task raises `ValueError`; automatic stopping is then not guaranteed. Explicitly stop playback and close Mango during cleanup.

## `oled_media_list()`

Signature: `m.oled_media_list()`. Returns a sorted `list[str]` of valid `.mbimg`/`.mbanim` names. A missing directory is an empty library. More than 16 directory entries ending in these extensions raises `RuntimeError` before the additional filename-validity filter. Listing checks names, not file contents or CRC, and does not initialize an OLED.

## `oled_media_info()`

Signature: `m.oled_media_info(name)`. name is str; a missing extension becomes `.mbanim`. Returns `name`, `frames`, `period_ms`, `width=128`, `height=64`, `verified=True`. It validates the whole file without changing the display. verified refers only to file format and CRC.

## `oled_play_media()`

Signature: `m.oled_play_media(name, duration=0)`. duration must be an integer 0..3600000 ms. After full validation, frames go through the existing RAM image API. One frame is displayed; 2..4 frames start animation. Returns `name`, `frames`, `period_ms`, `started=True`. A single image does not disappear after duration; duration limits multi-frame playback.

For multi-frame playback across families, select 0 or 10..3600000 ms to avoid the BarePico 1..9 ms stop-task limit above. The 5000 ms examples on this page are within the shared range.

## `oled_stop_media()`

Signature: `m.oled_stop_media()`. Delegates to `stop_image_loop()` with that target's return behavior. It does not delete or rewrite media. Repeated stop/status calls must not become per-frame event logging.

## Shared media rules, errors and example

Files live under `/mb_oled/`. Stems contain 1..24 ASCII letters, digits, hyphens or underscores and cannot start with an underscore. Paths and arbitrary extensions are rejected. The v2 format uses `MBIM\x02`/`MBAN\x02`, 1024 bytes per frame, at most four frames, period 100..10000 ms and CRC32.

- Invalid name, format, size or CRC: `ValueError`.
- Missing file or filesystem failure: `OSError`.
- Matching `.part`/`.bak`: `RuntimeError`; complete the media transaction in DM.
- Disabled OLED, conflicting pins, I2C or glyph failure: fix settings according to the Runtime error path.

```python
from mangobox import Mango

m = Mango()
name = "welcome.mbanim"
if name not in m.oled_media_list():
    raise RuntimeError("Save welcome.mbanim in Device Manager first")
info = m.oled_media_info(name)
m.oled_play_media(name, duration=5000)
try:
    while True:
        m.run_once()
finally:
    try:
        m.oled_stop_media()
    finally:
        m.close()
```

Related: `text()`, `show_image()`, `start_image_loop()`, `run_once()`, `run_forever()` and the [OLED Guide](../guides/oled.md). DM owns media writes/deletion. This profile does not invent `oled_play_sequence()` or `play_animation()` aliases.
