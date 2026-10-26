# OLED: text, progress and saved animation

> For the selected MangoX2, MangoLite or BarePico High-Level MicroPython candidate profile. This page does not apply to Host Python. Source review is separate from physical display acceptance.

## 1. What you can do

Use the 128×64 OLED for text, menus, progress, waveforms and animation. Text, drawing, RAM images and saved media share one display. Stop an older continuously updating display task before starting another owner.

Enable OLED in Device Manager and check SDA, SCL, I2C address and wiring. BarePico has no onboard display. Its first OLED operation creates the explicitly configured external display; do not create a second I2C driver.

## 2. A 30-second test

```python
from mangobox import Mango

m = Mango()
m.clear()
m.text("Hello Mango", x=0, y=0, size=1)
m.run_forever()
```

Start with ASCII text so wiring and missing Chinese glyphs are separate questions. Keep the event loop running for queued or scheduled display work. Do not immediately close Mango after sending a frame.

## 3. What to observe

`Hello Mango` appears at the top left. The visible coordinates are x=0..127 and y=0..63. This candidate supports font scales from 1 to 3 in quarter steps. Larger text needs more space; the screen does not become larger when the font grows.

## 4. Common uses

| Use | API | Preparation |
| --- | --- | --- |
| Text | `text()` | Enabled OLED; prepared glyphs for Chinese |
| Percentage | `oled_progress(value)` | Value between 0 and maximum |
| Waveform | `oled_waveform(values)` | 1..128 integers, each within low..high |
| Menu | `oled_menu(entries, selected=0)` | Nonempty entries and a zero-based selection |
| Program-created image | `show_image(bitmap)` | A 1,024-byte MONO_VLSB buffer |
| DM-saved media | `oled_play_media(name)` | Explicitly saved to Pico Flash |

The four image slots are in RAM and disappear after power loss. DM `.mbimg`/`.mbanim` assets under `/mb_oled/` persist in Flash. A saved file does not play itself on boot: the student's program must call playback.

## 5. Complete interaction: a knob controls progress

Configure and enable a potentiometer named `pot1` in DM. The callback records a value; the foreground updates the display after `run_once()` returns. This avoids re-entering the Scheduler through nested callbacks.

```python
from mangobox import Mango

m = Mango()
pending = None

def changed(value):
    global pending
    pending = value

m.on_pot_change(changed, threshold=2, period=100, name="pot1")
try:
    while True:
        m.run_once()
        if pending is not None:
            value = pending
            pending = None
            m.oled_progress(value, maximum=100)
finally:
    m.close()
```

The progress widget redraws its screen. A separate scheduled text writer would compete for the same display; design one update flow for a combined dashboard.

### Play an animation saved by DM

Save `welcome.mbanim` with at most four frames, then run:

```python
from mangobox import Mango

m = Mango()
print(m.oled_media_list())
info = m.oled_media_info("welcome")
print(info["frames"], info["period_ms"])
m.oled_play_media("welcome", duration=5000)
try:
    while True:
        m.run_once()
finally:
    try:
        m.oled_stop_media()
    finally:
        m.close()
```

`welcome` expands to `welcome.mbanim`; an image needs its explicit extension, such as `logo.mbimg`. The runtime validates CRC32 first. `verified=True` means file validation succeeded, and `started=True` means playback was requested; neither proves that a physical screen showed the expected pixels. Listing and file-info queries only read Flash and do not initialize an OLED. Actual playback requires a valid, enabled display.

## 6. Target, mode and troubleshooting

Advanced drawing, RAM images and Flash media in this page belong to the selected candidate. Older stable profiles may still reserve `show_image()` without implementing it. A matching method name does not establish version compatibility.

Chinese menus use previously prepared glyphs. Prepare those glyphs in DM and check text width at the selected scale. Do not replace the display driver to work around missing glyphs.

Check the profile API, enabled module, I2C configuration, DM's existing display operations, the minimal ASCII test, and finally power/GND/SDA/SCL. Animation stuck on its first frame usually calls for checking the event loop and competing display work.

An empty media list may mean that data was sent only to RAM. Incomplete `.part`/`.bak` transactions, invalid CRC or pre-v2 formats must be handled in DM; student programs should not delete files to repair them.

## 7. Small challenge

Save two animations and switch with a button. Let its callback select the next file and let the foreground call `oled_play_media()`. Explain which data lives in Flash, which work needs the Scheduler, and why restarting the same file on every loop iteration prevents normal playback.

See [OLED API Reference](../reference/oled.md) for signatures and return differences.
