# BarePico Named buttons and digital events — API Reference

> Source candidate: v0.1.0-rc6; BarePico Pico / Pico W / Pico 2 W; High-Level MicroPython. Source review does not claim Windows or physical-device acceptance in this update.

## Setup, targets and mode

Enable `enabled_modules.button` in DM and configure named external inputs in `buttons`: `enabled`, `pin`, `active`, `pull` and `debounce_ms`. `active` is 0 or 1, `pull` is `none/up/down`, and debounce is 0–5000 ms. BarePico has no fixed carrier button. The generic name `button` is usable with a single enabled input; use exact names when there are several.

## Methods, exact signatures and returns

Defaults are exactly those in the signatures below. Import with `from mangobox import Mango` and construct `m = Mango()`.

| Signature | Meaning | Returns |
| --- | --- | --- |
| `m.on(event_name, callback)` | Register a generic value callback. | `None` |
| `m.on_enter(sensor, callback)` | Register logical enter/pressed events. | `None` |
| `m.on_leave(sensor, callback)` | Register logical leave/released events. | `None` |
| `m.on_pressed(sensor, callback)` | Register a pressed handler; still start polling. | `None` |
| `m.on_released(sensor, callback)` | Register a released handler. | `None` |
| `m.read_button()` | Read the generic button. | Current value or `None` |
| `m.read_sensor(sensor)` | Read the current normalized value. | Current value or `None` |
| `m.start_button(period=100)` | Start polling the generic button. | `None` |
| `m.start_sensor(sensor, period=200)` | Start polling a named input. | `None` |
| `m.stop_button()` | Stop generic button polling. | `None` |
| `m.stop_sensor(sensor)` | Stop polling the selected input. | `None` |
| `m.when_pressed(sensor='button', callback=None)` | Convenience pressed registration; pass callback explicitly. | `None` |
| `m.when_released(sensor='button', callback=None)` | Convenience released registration. | `None` |

## Parameter types, ranges and defaults

| Parameter | Type and rules |
| --- | --- |
| `sensor` | `str`, the configured input name; name-free convenience methods require a uniquely resolvable button. |
| `callback` | Pressed/released/enter/leave handlers take no arguments. Generic on(event_name, callback) receives one value. Pass the function, without calling it. |
| `event_name` | A defined sensor event key; do not invent event names. |
| `period` | Polling interval, converted to an integer by the facade and constrained to 10–10000 ms. Polling and debounce are separate settings. |

## Events and lifecycle

Logical values are 1=pressed and 0=released, not raw GPIO levels. `read_sensor(name)` / `read_button()` performs a **fresh synchronous read**, updates the stored value through event processing, and then returns it. The normal hardware path returns `int` 0 or 1. The final dictionary `.get()` leaves a possible `None` result, but read errors can also propagate; they are not universally converted to None.

`start_sensor()` emits the current value synchronously before scheduling debounced scanning. If the button is already pressed, its state can transition from the initial zero and call the pressed handler before start returns. Prepare callback state first. Subsequent scanning emits stable changes. General `on(name, callback)` receives one value; pressed/released/enter/leave handlers take no arguments. Registering the same event key replaces its previous function.

Registration alone starts no background scan. Explicit `read_sensor()` also dispatches the general callback and applicable edge callbacks synchronously: **it is not a passive cache query**. It samples without waiting for debounce and resets the debouncer baseline, so do not repeatedly poll it alongside a running scanner. Event examples should register, start, then drive the event loop.

`stop_sensor()` stops scanning but retains callbacks and the last value. A later explicit read can still dispatch events. `when_pressed(..., callback=...)` / `when_released` require a callback and are not decorators. Registration/start/stop wrappers return `None`.

## Errors and diagnostic order

Hardware read/start/stop paths check disabled/closed state, ambiguous names and configuration, rejecting invalid GPIO, pull, active or period values. Registration with `on` / `on_enter` / `on_leave` only stores the callback and **does not validate callability in advance**. A bad handler can fail with `TypeError` during synchronous start/read or later dispatch. Convenience `when_*` methods explicitly raise `TypeError` when their callback is omitted. Pass a real callable and an exact name; successful registration is not hardware or callback validation.

For missing presses, check the profile, module/entry enablement, pin/active/pull, start and event loop, then wiring. Recreate Mango after configuration changes. Do not invert callback names to hide an incorrect active level.

## Complete minimal example

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("button", False):
        raise RuntimeError("Enable button in Device Manager")
    group = m.config.get("buttons", {})
    if not isinstance(group, dict):
        raise ValueError("Check the configured buttons table")
    items = {key: value for key, value in group.items()
             if isinstance(value, dict) and value.get("enabled", False)}
    name = None
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled buttons entry in Device Manager")
        name = next(iter(items))
    spec = items[name]

    print("Button:", name, "GPIO:", spec["pin"])
    previous = None
    for _ in range(15):
        value = m.read_sensor(name)
        if value != previous:
            print("Logical state:", value)
            previous = value
        time.sleep_ms(200)
finally:
    m.close()
```

## Related reading

[Guide](../guides/button.md) · [Lifecycle](../../../shared/en/guides/lifecycle.md) · [Runtime Config](../../../shared/en/reference/runtime-config.md)

## Reviewed source and validation

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/digital_input.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/digital_input.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

Reviewed source SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`. Examples received syntax and source-contract checks only; this update makes no hardware PASS claim.
