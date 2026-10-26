# BLE / Dabble API Reference — candidate source

Availability: MangoLite 0.6.5-rc2 and BarePico 0.1.0-rc6 on Pico W/Pico 2 W, High-Level MicroPython. MangoX2, plain Pico and Host Python are excluded. Receiving controls and opening pairing require BLE enabled in DM; status/name queries can describe a disabled service. An enabled service is still different from an established controller connection.

## Event registration

| Signature | Parameters and callbacks | Return / errors |
| --- | --- | --- |
| `m.on_control(control, action, callback, controller="primary")` | control string; action is `press`, `release` or `value`; callable callback | Returns callback; blank control or invalid action: `ValueError`; non-callable: `TypeError`; other setup/initialization errors follow the family implementation |
| `m.on_control_pressed(control, callback, controller="primary")` | Press shortcut; use a zero-argument button callback | Returns callback; same errors |
| `m.on_control_released(control, callback, controller="primary")` | Release shortcut; use a zero-argument button callback | Returns callback; same errors |
| `m.on_control_joystick(callback, controller="primary")` | Callback receives `(angle, radius)`; Dabble angle uses 15-degree steps and radius 0..7, with zero centered | Returns callback; same errors |

Registration replaces the callback at the same `(controller, control, action)` key. Only primary is currently supported; a different string does not create a second physical connection. The underlying non-joystick dispatcher has compatibility fallbacks, but teaching examples use zero arguments to avoid confusing an internal callback `TypeError` with signature selection.

Digital Gamepad controls are `start`, `select`, `triangle`, `circle`, `cross`, `square`, `up`, `down`, `left` and `right`; use `on_control_joystick()` for the joystick. Control names are converted to strings, trimmed and lowercased, without validation against a complete list of known controls. A nonempty misspelling can therefore register successfully but never match an event.

Disabled-module behavior differs: BarePico removes the newly registered callback and raises `RuntimeError`; MangoLite can retain the callback registration while no enabled service dispatches events. Both families reject `ble_pairing_open()` when BLE is disabled. Check `ble_status()["enabled"]` instead of inferring enablement from registration success.

```python
from mangobox import Mango

m = Mango()

def moved(angle, radius):
    print(angle, radius)

m.on_control_joystick(moved)
m.ble_pairing_open(60)
try:
    m.run_forever()
finally:
    m.close()
```

Use this print only for short observation, not as per-packet research logging. Keep callbacks short; perform complex mode changes in the foreground after `run_once()` returns.

## Names and status

| Signature | Return and side effects |
| --- | --- |
| `m.control_name()` | Effective name, str; may create the lazy runtime observer but does not open advertising |
| `m.ble_name()` | Alias of `control_name()` |
| `m.control_connected()` | bool: whether primary is connected |
| `m.ble_status()` | dict: enabled, connected, advertising, pairing_open, pairing_remaining_s, state, name; does not pair automatically |
| `m.ble_set_name(name=None)` | Effective name, str; None restores the UID-derived default; trimmed nonempty string, at most 20 UTF-8 bytes; RAM-only |

Renaming requires a stopped/disabled runtime with no connection or advertising; otherwise it raises `RuntimeError`. Invalid names raise `ValueError`. Twenty UTF-8 bytes is not twenty Chinese characters. Status/name access still checks wireless capability and runtime settings; it is not a context-free global operation.

Queries can create the lazy runtime and its Scheduler task. MangoLite reuses its board button, RGB and buzzer for pairing feedback. BarePico reuses a configured named pairing button and starts its polling if needed. These initialization effects do not open BLE advertising. `pairing_remaining_s` can retain a value while connected; interpret it with `pairing_open`, not as a connection-expiry deadline.

## Pairing window

| Signature | Parameters / return | Behavior |
| --- | --- | --- |
| `m.ble_pairing_open(seconds=60)` | Integer 1..120 seconds; bool indicating whether opened | Explicit advertising/pairing action; disabled DM setup is rejected; the event loop advances its countdown |
| `m.ble_pairing_close()` | bool | Closes only an unconnected window; False if not pairing or already connected; does not eject an established controller |

MangoLite retains its GP3 hold gesture: warning at seven seconds and opening at ten. BarePico `ble_control.pairing_button` references a DM named button with its active/pull/debounce settings. None means manual API only, with no assumed GP3. This configuration is not an invented `ble_open_pairing(button=...)` method.

## Lifecycle, logging and related APIs

Drive the runtime with `run_forever()` or foreground `run_once()`. `close()` stops this Mango's service. Never recursively enter the scheduler from a callback or use `scheduler.clear()` to stop one module.

Meaningful press/release and connect/disconnect transitions may use existing `@@MANGO_EVENT@@` events. Do not fabricate the marker or log every raw joystick packet. Repeated status queries should not create per-query research events.

Related: `on_control()`, `ble_status()`, `ble_pairing_open()`, `run_once()`, `run_forever()` and the [BLE Guide](../guides/ble-control.md). Documentation checks do not establish phone pairing, radio coexistence or physical-board acceptance.
