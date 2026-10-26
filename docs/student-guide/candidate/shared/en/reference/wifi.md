# Wi-Fi API Reference

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## Availability and setup

The six wireless candidate HLMP targets share these signatures. The two non-wireless Pico targets return unsupported status. There is no MangoLite + non-wireless Pico candidate. Installing the API or constructing `Mango()` does not enable a radio. Host Python 0.4.6 does not include this facade.

## `wifi_status()`

```python
state = m.wifi_status()
```

Returns a `dict` without scanning or enabling Wi-Fi. Common fields: `supported: bool`, `connected: bool`, `active: bool`, `ipv4: str | None`, `state: str`, `status_code: int | None`, `student_owned: bool`. Wireless targets also return `hostname_applied: bool`; an unsupported optional hostname operation does not prevent association.

States are `unsupported/off/connecting/connected/wrong_password/ap_not_found/disconnected`. Unknown driver states never imply success. A real state transition may emit one existing semantic event; repeated unchanged queries do not emit one event per poll. Passwords are not returned.

## `wifi_connect()`

```python
result = m.wifi_connect(ssid=None, password=None, allow_open=False)
```

| Parameter | Type/default | Contract |
|---|---|---|
| `ssid` | `str | None`, `None` | Explicit SSID: 1–32 UTF-8 bytes, not characters |
| `password` | `str | None`, `None` | 8–63 printable ASCII characters; never persisted by this call |
| `allow_open` | `bool`, `False` | Passwordless access requires explicit `True` |

All-default arguments load the latest DM-saved `wifi_profile.sta_ssid/sta_password`; a missing real password is rejected. An explicit password without an SSID is rejected. Returns `{"started": True, "connected": bool}`: the request was accepted, and completion still requires polling.

Raises `ValueError` for invalid credentials/options. Raises `RuntimeError` for unsupported hardware, missing configuration, active AP, another connected/associating owner, or an outstanding request from this object. Driver exceptions can propagate. Do not call it on every loop iteration.

## `wifi_disconnect()`

```python
stopped = m.wifi_disconnect()
```

Returns `True` after releasing this object's STA association. It does not force `STA.active(False)`. Unsupported targets and connections not owned by this object raise `RuntimeError`; this is not a system-wide radio-off operation.

## `wifi_name()` and `wifi_set_name()`

```python
name = m.wifi_name(mode="ap")
name = m.wifi_set_name(name=None, mode="ap")
```

`mode` is `"ap"` or `"sta"`, default `"ap"`. `name` is a custom string; `None` restores the UID-derived default. Both return a `str`. The getter does not enable a radio. The setter requires both interfaces inactive, changes a RAM-only override, and neither persists configuration nor changes the router SSID. Invalid names/modes raise `ValueError`; unsupported hardware or active interfaces raise `RuntimeError`.

The STA hostname returned here is distinct from the router SSID supplied to `wifi_connect`.

## `wifi_ap_status()`

```python
ap = m.wifi_ap_status()
```

Returns `supported`, `active`, `student_owned` booleans and `ssid`. Wireless targets also include `ipv4: str | None`. The SSID is this object's planned name; it does not prove ownership of the currently active interface. Ownership is checked separately. No password is returned and no AP is started.

## `wifi_ap_start()` and `wifi_ap_stop()`

```python
result = m.wifi_ap_start()
stopped = m.wifi_ap_stop()
```

Start requires a previously provisioned AP password, wireless hardware, inactive STA/AP and no existing student AP owner. Returns `{"started": True, "active": True, "ipv4": ...}`. Preconditions fail with `RuntimeError` or configuration validation errors; driver failures may propagate.

Stop returns `True` only for the AP started by this object whose identity still matches. Missing ownership or takeover by another service raises `RuntimeError`. Starting AP does not install HTTP, a web console, pairing PIN or offline rules.

## Execution lifecycle

Read-only queries can run immediately. Use bounded status polling after requesting association while continuing other tasks through `run_once()` or `run_forever()`. Never wait indefinitely inside a callback or take over another radio owner. Explicitly release the connection this program created; do not assume `close()` shuts down all wireless services.

## Examples and related APIs

[Complete connection example](../guides/wifi.md) · [Clock reference](clock.md). `on_wifi_change()` is not an installed public facade in this snapshot; compare successive states instead of generating a planned callback name.

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/barepico/firmware/barepico/student_wifi_v2.py`
- `runtime/mangox2-pico/firmware/mangox2/student_wifi_v2.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_wifi_v2.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
