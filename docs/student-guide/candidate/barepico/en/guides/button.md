# External buttons on BarePico

> Candidate source: BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26. Source review is not hardware acceptance.

## 1. What you can do and prepare

Read a button or react to press/release transitions. BarePico does not assume an onboard button or GP3. Enable `enabled_modules.button` and configure named `buttons` entries with `pin`, `enabled`, `pull`, `active` and `debounce_ms` in DM. The introductory programs require exactly one enabled button; use explicit configured names when handling several.

## 2. 30-second quick test

Run this three-second readout and press/release the button. The printed value is the Student API logical state.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("button", False):
    raise RuntimeError("Enable button in Device Manager first")
items = {name: spec for name, spec in m.config.get("buttons", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = None
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled buttons entry in Device Manager")
    name = next(iter(items))
spec = items[name]

try:
    print("Button:", name, "GPIO:", spec["pin"], "active:", spec.get("active", 1))
    for _ in range(30):
        print(m.read_sensor(name))
        time.sleep_ms(100)
finally:
    m.close()
```

## 3. What to observe

Logical `1` means pressed; `0` means released. This differs from the raw GPIO level: a pull-up button may read raw 0 when pressed, while the configured `active` setting normalizes it to logical 1. The quick test reads immediately without waiting for debounce; background start_sensor() scanning applies debounce. If values never change, check active level and wiring before callbacks.

## 4. Common uses

Use `read_sensor(name)` for a fresh synchronous reading. For events, register `on_pressed(name, callback)` and `on_released(name, callback)`, then start_sensor and keep the loop moving. Generic read_button/start_button aliases require one enabled button.

start_sensor() first emits the current value synchronously, so an already pressed button can invoke a handler before start returns. Prepare callback state first. read_sensor() also dispatches registered handlers and resets the debouncer baseline; do not repeatedly poll alongside a running scanner.

## 5. Complete interactive example

This press counter keeps callbacks short: each callback records a pending transition; the foreground updates the counter after `run_once()` returns. Keep this structure when later adding LED or audio transitions.

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("button", False):
    raise RuntimeError("Enable button in Device Manager first")
items = {name: spec for name, spec in m.config.get("buttons", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = None
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled buttons entry in Device Manager")
    name = next(iter(items))
spec = items[name]

pending = None
count = 0

def pressed():
    global pending
    pending = "pressed"

def released():
    global pending
    pending = "released"

m.on_pressed(name, pressed)
m.on_released(name, released)
try:
    m.start_sensor(name, period=30)
    while True:
        m.run_once()
        if pending is not None:
            event = pending
            pending = None
            if event == "pressed":
                count += 1
            print(event, "press count:", count)
        time.sleep_ms(10)
finally:
    try:
        m.stop_sensor(name)
    finally:
        m.close()
```

## 6. Target/mode notes and troubleshooting

This guide describes BarePico High-Level MicroPython v0.1.0-rc6 candidate source. `capabilities()` does not prove button configuration, and BarePico has no `supports()`.

Diagnose: target → aggregate/named enable → GPIO and actual signal wire → pull and active level → DM configuration and physical presses. If the quick read changes but events do not, check `start_sensor()`, names and the event loop. For a raw `machine.Pin` test, stop the Mango program and use a separate minimal program with the same pin and pull; never run two GPIO owners together. Restart after pin changes.

## 7. Small challenge

Count releases as well as presses. Check the first press, release and second press in order. For two buttons, register two real names from `buttons`; do not rely on the ambiguous generic `button` alias.

[API Reference](../reference/button.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
