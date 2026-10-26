# External RGB strips on BarePico

> Candidate source: BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26. Source review is not hardware acceptance.

## 1. What you can do and prepare

Use colors for state feedback, address individual pixels, or run built-in effects. BarePico has no MangoX2/MangoLite carrier strip; the Pico status LED is not this WS2812B API. Enable `enabled_modules.led_strip` in Device Manager (DM), then configure named `led_strips` entries with `enabled`, `pin`, `leds` and `power`. Select `current_led_setting` in DM when several strips are enabled.

## 2. 30-second quick test

Run this after connecting the configured strip. It reads the DM name and pixel count, shows red for one second at no more than 20% or the configured power, then turns off.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("led_strip", False):
    raise RuntimeError("Enable led_strip in Device Manager first")
items = {name: spec for name, spec in m.config.get("led_strips", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_led_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled led_strips entry in Device Manager")
    name = next(iter(items))
spec = items[name]

try:
    m.brightness(min(20, spec.get("power", 50)), strip=name)
    m.led_all("red", strip=name)
    print("Strip:", name, "GPIO:", spec["pin"], "LEDs:", spec["leds"])
    time.sleep_ms(1000)
finally:
    m.led_off(strip=name)
    m.close()
```

## 3. What to observe

The selected strip should show red and then turn off. The Shell reports the selected name, GPIO and pixel count. A command returning without an exception is not proof of visible light. Pixel indices start at 0; the last index is `leds - 1`. In this source, `led_clear()` stops effect/expiry tasks for that strip and writes black pixels; `led_off()` also stops and clears.

## 4. Common uses

Use `led_all()` for a status color and `led()` or `led_range()` for individual pixels. Built-in `rainbow()` and `breath()` effects need a running event loop: call `run_once()` in the foreground or use `run_forever()`. Use one approach. `led_range(start, end, ...)` includes both endpoints and swaps reversed endpoints. Positive duration on static colors restores the prior frame; animation expiry only stops updates and leaves the last frame. Before replacing an effect, call `led_off()` for that strip to remove old tasks. A new effect does not automatically cancel every other effect. Read the Scheduler guide for custom animation; never re-enter the scheduler from a callback.

## 5. Complete interactive example

Type r, g, b or o in the Shell to select red, green, blue or off; type q to finish. These are static colors, so blocking on keyboard input does not pause an active animation. Each color change issues one command.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("led_strip", False):
    raise RuntimeError("Enable led_strip in Device Manager first")
items = {name: spec for name, spec in m.config.get("led_strips", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_led_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled led_strips entry in Device Manager")
    name = next(iter(items))
spec = items[name]

colors = {"r": "red", "g": "green", "b": "blue", "o": "off"}
try:
    m.brightness(min(20, spec.get("power", 50)), strip=name)
    while True:
        command = input("r / g / b / o / q: ").strip().lower()
        if command == "q":
            break
        if command in colors:
            m.led_all(colors[command], strip=name)
            print("Color:", colors[command])
finally:
    m.led_off(strip=name)
    m.close()
```

## 6. Target/mode notes and troubleshooting

For BarePico Pico/Pico W/Pico 2 W with candidate High-Level MicroPython v0.1.0-rc6. This is not Host Python support or hardware acceptance. BarePico has no `supports()` method. `capabilities()` reports board identity; it does not prove that external modules are attached.

Diagnose in order: profile → aggregate enable → named-entry enable → configured GPIO and the real DIN wire → pixel count → power and common ground. Do not connect the signal to DOUT. After changing GPIO or pixel count, stop and recreate `Mango()`. If several strips are enabled without a selected default, this example stops and asks you to select one in DM.

## 7. Small challenge

Add y for yellow. Then use `spec["leds"]` to calculate the final pixel index and light only that pixel. Do not assume a fixed pixel count or GPIO.

[API Reference](../reference/led.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
