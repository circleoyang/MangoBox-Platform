# BLE Control API Reference

Engineering reference for the public BLE Control surface. The interfaces below are taken from the **verified MangoLite Runtime v0.6.3** `student_api_ble_control.py` implementation and validated Dabble examples. They do not adopt the earlier unimplemented `Dabble(...)` draft style from the original contract.

## Availability

| Target / Mode | BLE Control v1 |
|---|---:|
| MangoLite + Pico W / High Level MicroPython | Supported (v0.6.3) |
| MangoLite + Pico 2 W / High Level MicroPython | Supported (v0.6.3) |
| MangoLite Host Python | Not advertised as supported |
| MangoX2 + Pico W / Pico 2 W | Not included in v1 yet |
| non-wireless Pico | Not applicable |

Canonical learner import:

```python
from mangobox import Mango
```

The BLE Control runtime is created lazily when a BLE Control API is first used. Normal Runtime startup does not automatically open the pairing window.

## `on_control()`

```python
m.on_control(control, action, callback, controller="primary")
```

Register one normalized BLE controller-event callback.

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `control` | `str` | Control name. Verified v0.6.3 Digital controls are listed below; the Analog joystick uses `"joystick"`. |
| `action` | `str` | One of `"press"`, `"release"`, or `"value"`. |
| `callback` | callable | Function called when the event occurs. |
| `controller` | `str` | Defaults to `"primary"`. v1 still has one active controller owner. |

### Returns

Returns the registered `callback`.

### Raises

- `TypeError` if `callback` is not callable.
- `ValueError` if `control` is empty or `action` is not `press/release/value`.

### Callback arguments

The beginner form for normal Digital `press/release` callbacks takes no arguments:

```python
def pressed():
    print("pressed")
```

For `control="joystick"` with `action="value"`, the standard callback form is:

```python
def changed(angle, radius):
    ...
```

Runtime also retains advanced value/event callback fallbacks, but teaching material should prefer the two verified forms above.

## `on_control_pressed()`

```python
m.on_control_pressed(control, callback, controller="primary")
```

Equivalent to:

```python
m.on_control(control, "press", callback, controller=controller)
```

Use this for Dabble Digital Gamepad press events.

## `on_control_released()`

```python
m.on_control_released(control, callback, controller="primary")
```

Equivalent to:

```python
m.on_control(control, "release", callback, controller=controller)
```

Use this when a button changes from pressed to released. Projects that move while a key is held should normally register both press and release callbacks.

## `on_control_joystick()`

```python
m.on_control_joystick(callback, controller="primary")
```

Equivalent to registering:

```python
m.on_control("joystick", "value", callback, controller=controller)
```

Standard callback:

```python
def changed(angle, radius):
    ...
```

For the v0.6.3 Dabble Analog Gamepad:

- `angle` is decoded in 15-degree steps;
- `radius` is `0..7`.

Do not confuse this BLE joystick callback with the physical PS2 Joystick `m.joystick()` API, which uses a different X/Y value contract.

## `control_name()`

```python
name = m.control_name()
```

Returns the effective BLE device name as `str`. If the BLE Control runtime has not been created yet, this call lazily creates it.

This call does not open the pairing window by itself.

## `control_connected()`

```python
connected = m.control_connected()
```

Returns `bool` indicating whether the primary BLE controller is currently connected.

## Supported Digital controls

The v0.6.3 Dabble adapter implements:

```text
start
select
triangle
circle
cross
square
up
down
left
right
```

Digital input emits `press` / `release` only when button state changes; holding a key does not continuously retrigger the press callback.

## Pairing lifecycle

MangoLite BLE Control v1 uses this normal-Runtime GP3 gesture:

```text
<7 s       no BLE system action
7-<10 s    warning feedback
>=10 s     open initial 60 s pairing window
```

Important rules:

- ordinary short GP3 presses remain available to the Student Button API;
- normal startup does not automatically open a pairing window;
- an already connected controller prevents opening a second controller owner;
- disconnect releases controller ownership;
- this runtime pairing gesture is separate from the Button + RESET Recovery / Deep Rescue boot gesture.

## Execution lifecycle

All callbacks depend on the BLE runtime scheduler task continuing to run. Standard learner programs therefore end with:

```python
m.run_forever()
```

`Mango.close()` integrates BLE Control cleanup and attempts to stop the BLE runtime when it has been created.

## Logging

BLE Control input is emitted through the Student API canonical event path as `sensor_event` with component `ble_control`; the payload contains controller, control, value, and adapter=`dabble`. This is Runtime behavior and students do not need to construct the event schema themselves.

## Minimal example

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("UP")

m.on_control_pressed("up", pressed)
print("BLE name:", m.control_name())
m.run_forever()
```

## Related APIs

`run_forever()`, `close()`, the existing RGB/Buzzer/Servo/Motor Student APIs, and the [BLE Control Guide](../guides/ble-control.md).
