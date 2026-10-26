# Wi-Fi guide: confirm the connection before using the network

> Candidate API documentation | source snapshot: 2026-10-26 | High-Level MicroPython for the selected candidate profile only. This page is not a stable release or an eight-target hardware acceptance record. Host Python 0.4.6 does not advertise these new interfaces.

## 1. What can you build?

A Pico W or Pico 2 W can join an existing access point as a station (STA), for example to obtain time through NTP. It can also explicitly start its own access point (AP). An active AP is not proof of Internet access and does not automatically provide the MangoBox web console.

The shared interface covers the six wireless MangoX2, MangoLite and BarePico candidate targets. MangoX2 + Pico and BarePico + Pico report unsupported hardware. A BarePico W still has the wireless hardware of its MCU even though it has no carrier board.

## 2. A 30-second read-only test

```python
from mangobox import Mango

m = Mango()
try:
    state = m.wifi_status()
    print("supported:", state["supported"])
    print("connected:", state["connected"])
    print("state:", state["state"])
finally:
    m.close()
```

This program does not scan networks, enable STA/AP or request a password. Do not print the entire configuration for diagnostics: it may contain saved credentials.

## 3. What should you observe?

| State | Meaning | Next action |
|---|---|---|
| `unsupported` | No wireless hardware on this target | Use non-network features or trusted host time |
| `off` | STA is inactive | Configure credentials and explicitly request a connection |
| `connecting` | Association has started | Keep polling; do not submit repeated connect calls |
| `connected` | STA reports an established connection | Continue with NTP or another network task |
| `wrong_password` / `ap_not_found` | A recognized driver failure | Check saved credentials and the local access point |
| `disconnected` | No connection or an unrecognized driver state | Inspect the situation; do not assume success |

`started=True` means a request was accepted. It does not mean the device is connected.

## 4. Common uses and configuration

Save the real STA SSID/password in Device Manager before calling `m.wifi_connect()` without arguments. A default SSID is not a default working password. The API rejects an unprovisioned profile.

`wifi_name("sta")` returns this Pico's hostname, not the router SSID. `wifi_name("ap")` returns the planned Pico AP name. The default name includes a device suffix to distinguish classroom boards; that suffix is not a password.

## 5. Complete example: bounded connection monitoring

Prerequisites: valid saved STA credentials and no conflicting AP or association owner. This test waits for about 15 seconds and disconnects only a connection it started. An already connected external owner is observed without being taken over.

```python
from mangobox import Mango
import time

m = Mango()
try:
    state = m.wifi_status()
    if not state["supported"]:
        raise RuntimeError("This target has no Wi-Fi")

    if not state["connected"]:
        m.wifi_connect()  # Use the real STA credentials saved by Device Manager.

    started_at = time.ticks_ms()
    previous = None
    while time.ticks_diff(time.ticks_ms(), started_at) < 15000:
        m.run_once()
        state = m.wifi_status()
        if state["state"] != previous:
            print("Wi-Fi:", state["state"])
            previous = state["state"]
        if state["connected"]:
            print("Connection confirmed")
            break
        if state["state"] in ("wrong_password", "ap_not_found"):
            raise RuntimeError("Check the saved Wi-Fi profile in Device Manager")
        time.sleep_ms(50)
    else:
        raise RuntimeError("Wi-Fi connection timed out")
finally:
    if m.wifi_status().get("student_owned", False):
        m.wifi_disconnect()
    m.close()
```

`run_once()` keeps existing cooperative tasks moving. The short delay avoids a busy loop. Put a subsequent network operation after the confirmed connection and before the cleanup; do not start NTP while association is still pending.

## 6. Target/mode notes and troubleshooting

Check the selected candidate profile, MCU and `supported` flag first. Then check Device Manager credentials and AP/STA ownership, followed by the real access point and signal conditions.

`wifi_disconnect()` does not force STA inactive. Consequently, starting AP immediately afterward may still fail with `STA is active`. Do not bypass ownership protection with another `network.WLAN` instance; use the management workflow or restart and choose one network role.

AP requires an explicitly provisioned password and an explicit `wifi_ap_start()`. A student Mango object cannot stop another Gateway/Mobile Hub AP. Do not include credentials in submitted work.

These are device-side APIs. The new facade and MicroPython timing helpers are not advertised for Host Python 0.4.6.

## 7. Small challenge

Print only when the connection state changes. Then extend the program using the [clock guide](clock.md), keeping “network connected” and “time synchronized” as separate results.

[Wi-Fi API Reference](../reference/wifi.md)

## Sources and validation scope

Reviewed against MangoBox source `f875289b5698f0e61faf64196b1165a3b18f2bd5`:

- `runtime/barepico/firmware/barepico/student_wifi_v2.py`
- `runtime/mangox2-pico/firmware/mangox2/student_wifi_v2.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_wifi_v2.py`

Python code blocks received syntax checks. Measurements, audio, networking and physical behavior still require validation on the selected firmware and hardware.
