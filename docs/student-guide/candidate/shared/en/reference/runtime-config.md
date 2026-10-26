# Runtime Config API Reference: `m.config.get()`

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Use the Host profile documentation for Host Python interfaces and execution behavior.

## Availability

`m.config.get()` is available on the three MangoX2, two MangoLite and three BarePico candidate HLMP targets. See [Lifecycle Reference](lifecycle.md) for all eight IDs. It queries an existing Runtime object and is not a shared Host Python configuration API. It requires no wireless hardware or external device.

## Signature and parameters

`m.config.get(key, default=None)`

| Parameter | Type / default | Meaning |
|---|---|---|
| `key` | Configuration key `str`, required | One top-level key; dotted strings do not automatically traverse nested fields |
| `default` | Any Python value, default `None` | Returned only when the key is missing; never inserted into configuration |

Returns the current value with the type stored for that key. A missing key returns `default`. A present key whose value is `None` still returns `None`, not the default. Reading does not enable devices, create GPIO ownership, reload files or save settings.

The implementation delegates to an underlying dictionary's `get`; it adds no schema validation. A returned dict/list may be the original object, not a deep copy. The teaching contract requires read-only use: do not mutate returned objects to change live configuration.

## Named LED configuration contract

| Level | Field | Required check |
|---|---|---|
| Top level | `enabled_modules` | Must be a `dict` |
| Module | `enabled_modules["led_strip"]` | Module enabled |
| Top level | `led_strips` | `dict` keyed by actual configured names |
| Selected entry | `led_strips[name]` | Present `dict`; name matches DM exactly |
| Entry | `enabled` | Explicitly enabled |
| Entry | `leds` | Positive integer; do not accept a bool or numeric string as a valid count |
| Entry | `pin` | Configured integer GPIO; DM/Runtime separately validates allowed pins, reservations and conflicts |

This table does not establish one universal GPIO range or maximum LED count. Reading fields only reveals configuration content; creating or controlling the device still requires its API's checks. Shared teaching uses the formal `leds` field without guessing aliases or filling an unconditional fallback count.

`strip1` and `button1` are names, not guaranteed hardware. BarePico named external-device tables may be empty by default. Carrier entries also require name and enabled checks. Capitalization must match the configuration.

## Other keys and family differences

| Key / interface | Rule |
|---|---|
| `target` | Useful for configuration identity; not proof of deployed firmware or a hardware PASS |
| `enabled_modules` | Module switches; not proof that a method exists or wiring works |
| `buttons` | Named input configuration; check dictionary, name and enabled, then follow the family Reference for other fields |
| `event_logging` | Runtime logging configuration; not a tool for inventing records or diagnostic conclusions |
| `wifi_profile` | May contain SSIDs/passwords; never dump it into output, assignments or AI context |
| `config.set` | Exists on BarePico; no shared carrier contract with this name; outside this read-only student flow |

Families can describe similar devices with different keys. Do not infer missing fields from another family's schema. DM owns persistent configuration. Student code should not save, replace, restore or modify internal data directly. Configure new devices in DM, then recreate the program's Mango object.

## Errors, missing values and reload behavior

A missing ordinary key is not an error; `get` returns the default. An unhashable object used as a dictionary key can raise `TypeError`. Calling `.get()` on a malformed value or doing arithmetic with it can raise ordinary Python errors, so the Guide checks types first. The Guide's explicit `ValueError`/`RuntimeError` checks belong to the example; `config.get` does not perform those checks itself.

Configuration is loaded as part of Mango/Runtime setup; this query does not watch its file. Restart the program after DM changes and restart the device when DM requires it. Persisted-profile rereads in some Wi-Fi facades are service-specific, not a general live-sync feature of config.

The query has no callback and needs no Scheduler. If you start periodic work afterwards, follow [Scheduler Reference](scheduler.md) for driving and cleanup. `close()` ends the Mango session; it does not mean modified configuration was saved.

## Minimal complete example

```python
from mangobox import Mango

m = Mango()
try:
    target = m.config.get("target", "unknown")
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict):
        raise ValueError("enabled_modules must be a dictionary")
    print("target:", target)
    print("LED module enabled:", bool(modules.get("led_strip", False)))
finally:
    m.close()
```

For complete named-device validation and interactive selection, see the [Runtime Config Guide](../guides/runtime-config.md). The example prints only two required facts and uses no `as_dict()` or whole-config dump.

## Related interfaces

[Lifecycle](lifecycle.md) · [Scheduler](scheduler.md) · [DHT11 family differences](dht11.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/mangox2-pico/firmware/mangox2/runtime/config.py`
- `runtime/mangolite-pico2w/firmware/mangolite/runtime/config.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/barepico/firmware/barepico/config.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
