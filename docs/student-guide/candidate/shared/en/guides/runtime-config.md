# Runtime Config guide: read DM settings and select named devices

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Use the Host profile documentation for Host Python interfaces and execution behavior.

## 1. What can you build?

DM stores strip names, GPIO assignments, LED counts and enabled flags. Reading them with `m.config.get()` lets one behavior program adapt to different projects. After configuring a 12-LED strip, the program reads its `leds` value instead of maintaining a second hard-coded count.

This Runtime query interface is available on all eight candidate HLMP targets. Reading configuration and controlling hardware are separate steps: a key does not prove that a device is connected, a GPIO is conflict-free or an API is installed. Host mode does not inherit the nested `m.config` interface on this page.

## 2. A 30-second test: inspect one named strip

Prerequisite: enable the LED strip module in DM, add and enable a strip named `strip1`, save valid `pin` and `leds` values, and restart the program. Change only `name` if your device uses another name. BarePico has no default `strip1` to assume.

```python
from mangobox import Mango

def read_strip(m, name):
    if not isinstance(name, str) or not name:
        raise ValueError("Choose a configured strip name")
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("led_strip", False):
        raise RuntimeError("Enable the LED strip module in Device Manager")
    strips = m.config.get("led_strips", {})
    if not isinstance(strips, dict):
        raise ValueError("led_strips must be a dictionary")
    spec = strips.get(name)
    if not isinstance(spec, dict):
        raise ValueError("Unknown strip name: " + name)
    if spec.get("enabled") is not True:
        raise RuntimeError("Enable the selected strip in Device Manager")
    count = spec.get("leds")
    pin = spec.get("pin")
    if type(count) is not int or count < 1:
        raise ValueError("leds must be a positive integer")
    if type(pin) is not int:
        raise ValueError("The strip needs a configured GPIO")
    return pin, count

m = Mango()
try:
    name = "strip1"  # Use the exact name saved in Device Manager.
    pin, count = read_strip(m, name)
    print("strip:", name, "GPIO:", pin, "LEDs:", count)
finally:
    m.close()
```

`read_strip` is an ordinary function in this student program, not a new Mango API. It reads the fields required for this task and prints only the name, GPIO and count. It neither writes configuration nor dumps a configuration object that may contain network credentials.

## 3. What should you observe?

A valid configuration prints the same name, GPIO and LED count as DM. For `Unknown strip name`, check capitalization and whether DM saved it. For a disabled error, check both the module switch and the selected entry's `enabled` flag.

`leds` must be a positive integer, not `True`, `"12"` or zero. The example validates explicitly instead of silently converting bad configuration with `int()`. The pin check here only validates its type; allowed GPIOs, reserved pins and ownership conflicts remain the responsibility of DM/Runtime target validation.

## 4. Common use and data shape

| Question | Read | Use |
|---|---|---|
| Is the module enabled? | `led_strip` in `enabled_modules` | Check the module switch first |
| Which named strip? | The exact name inside `led_strips` | Select explicitly rather than assuming the first entry is the intended device |
| Is this entry enabled? | Its `enabled` field | Correct disabled settings in DM |
| How many LEDs and which GPIO? | Its `leds` and `pin` fields | Validate types, then calculate index limits and inspect the configuration |

Modules do not all use the same shape. Named `buttons` and `led_strips` differ from a single `dht11_pin`; consult the current family Reference. Do not invent `m.led_count()`, `m.led_info()` or shared configuration keys that are absent from the source.

`get()` reads the current Mango configuration object. It does not reread DM's file on each call and provides no general live-reload contract. Restart the program after hardware configuration changes, and restart the device when DM requires it. Some Wi-Fi facades have their own persisted-profile refresh path; that does not make all modules update automatically.

## 5. Complete interactive example: validate your LED index

Enter a configured strip name, then an LED index. Indices start at zero, so the last index is `leds - 1`. This program validates the selection first; a later strip-control step should use the same name and count.

```python
from mangobox import Mango

def read_strip(m, name):
    if not isinstance(name, str) or not name:
        raise ValueError("Choose a configured strip name")
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("led_strip", False):
        raise RuntimeError("Enable the LED strip module in Device Manager")
    strips = m.config.get("led_strips", {})
    if not isinstance(strips, dict):
        raise ValueError("led_strips must be a dictionary")
    spec = strips.get(name)
    if not isinstance(spec, dict):
        raise ValueError("Unknown strip name: " + name)
    if spec.get("enabled") is not True:
        raise RuntimeError("Enable the selected strip in Device Manager")
    count = spec.get("leds")
    pin = spec.get("pin")
    if type(count) is not int or count < 1:
        raise ValueError("leds must be a positive integer")
    if type(pin) is not int:
        raise ValueError("The strip needs a configured GPIO")
    return pin, count

m = Mango()
try:
    name = input("Configured strip name: ").strip()
    pin, count = read_strip(m, name)
    print("Valid indices: 0 to", count - 1)
    index = int(input("Which LED index do you want to use? "))
    if not 0 <= index < count:
        raise ValueError("Index is outside the configured strip")
    print("Selection:", name, "index:", index, "GPIO:", pin)
finally:
    m.close()
```

Choosing another name changes the allowed range according to its `leds` value. This configuration inspector starts no continuing task, so it needs no `run_forever()`. In a longer project, finish such interactive setup before scheduling starts so waiting for `input()` does not block event processing.

## 6. Families, read/write responsibility and troubleshooting

MangoX2 and MangoLite have different carrier defaults and reserved pins. BarePico requires explicit external-device configuration. Do not copy another family's default GPIOs or assume its names exist. See the [Lifecycle Reference](../reference/lifecycle.md) for all target IDs.

A nested dict or list returned by `get()` may be the internal object itself. Read-only use here is a programming rule, not a promise of an immutable proxy. Do not assign into `spec`, change enabled flags or write configuration files. DM owns adding, naming, calibrating and saving devices; the student program selects and uses them. BarePico `config.set` is also not a shared carrier method.

Diagnose in this order: target/API, enabled module, name/GPIO, minimal DM test, then wiring and power. Print only fields required for the current question. A `wifi_profile` can contain credentials; never dump the whole configuration for debugging.

## 7. Small challenge

Create two names with different LED counts in DM. Confirm that the inspector accepts the last index and rejects the next index for each name. Then use the validated `count` in your own animation calculations, keeping control bound to the same named device. Do not modify Runtime to bypass disabled-device or GPIO-conflict errors.

[Runtime Config API Reference](../reference/runtime-config.md) · [Scheduler](scheduler.md) · [Lifecycle](lifecycle.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/runtime/config.py`
- `runtime/mangolite-pico2w/firmware/mangolite/runtime/config.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/barepico/firmware/barepico/config.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
