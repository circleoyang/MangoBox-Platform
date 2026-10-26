# BLE / Dabble: trigger code from phone controls

> Only the selected MangoLite or BarePico Pico W/Pico 2 W High-Level MicroPython candidate profiles install these APIs. The reviewed MangoX2 source does not install the BLE Student API. Plain Pico and Host Python cannot use these examples.

## 1. What you can do

Receive Dabble Digital Gamepad button transitions and Analog Joystick values without parsing BLE packets. There is one `primary` controller; the selector parameter does not imply simultaneous multi-phone control.

Enable BLE Control in DM. BarePico can use an explicitly configured named button for the pairing gesture. Without one, use the manual pairing API; no GP3 is assumed. MangoLite retains its GP3 hold gesture and reuses the Runtime's board button, RGB and buzzer for pairing feedback; keep those settings valid too.

## 2. A 30-second test

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("Triangle pressed")

m.on_control_pressed("triangle", pressed)
print("BLE name:", m.ble_name())
m.ble_pairing_open(seconds=60)
try:
    m.run_forever()
finally:
    m.close()
```

Open Dabble, select the printed device name, connect and press Triangle in Gamepad. Reading `ble_name()` or `ble_status()` does not itself open advertising; `ble_pairing_open()` is the explicit action.

## 3. What to observe

The Shell reports each Triangle press. A button callback normally takes no arguments; a joystick callback takes `angle, radius`. An open pairing window is different from a connected phone. Read `ble_status()["connected"]` for the current connection state.

## 4. Common uses

| Input | Use | Callback |
| --- | --- | --- |
| Button press | Choose a mode or effect | `def pressed():` |
| Button release | End a temporary action | `def released():` |
| Analog Joystick | Direction and intensity | `def moved(angle, radius):` |
| Pairing time remaining | Countdown/status display | Low-frequency `ble_status()` reading |

Dabble radius is 0..7 and angle is in degrees. This is not the physical PS2 joystick's x/y percentage contract.

## 5. Complete interaction: Triangle turns a strip on, Cross turns it off

Configure an enabled RGB strip named `strip1`. Callbacks request a change; the foreground performs it after `run_once()`.

```python
from mangobox import Mango

m = Mango()
pending = None

def light_on():
    global pending
    pending = "on"

def light_off():
    global pending
    pending = "off"

m.on_control_pressed("triangle", light_on)
m.on_control_pressed("cross", light_off)
m.ble_pairing_open(60)
try:
    while True:
        m.run_once()
        action = pending
        pending = None
        if action == "on":
            m.led_all("cyan", strip="strip1")
        elif action == "off":
            m.led_off(strip="strip1")
finally:
    try:
        m.led_off(strip="strip1")
    finally:
        m.close()
```

This example uses light for feedback. Physical-motion projects require their own limits and connection-loss stop behavior; a working callback is not a complete safety system.

## 6. Setup, lifecycle and troubleshooting

Pairing defaults to 60 seconds and accepts 1..120 seconds. The event loop advances the countdown; long blocking sleeps interfere. Interpret `pairing_remaining_s` as a waiting-to-pair countdown only while `pairing_open=True`; it is not a forced-disconnection timer for a connected phone. `ble_pairing_close()` closes an unconnected window and does not forcibly disconnect an established controller.

The default name contains a short device suffix. A custom name is session-local and is not automatically saved to Flash. Rename only while BLE is stopped, without an active connection or advertising.

Check target/runtime, DM BLE enablement, the named pairing button, explicit pairing opening, the selected Dabble device, and event-loop progress. Successful registration does not prove a correctly spelled control name or enabled BLE: a misspelled `triangle` may register without an immediate exception but never receive a matching event. On BarePico without a physical pairing button, start with manual pairing instead of assuming GP3.

## 7. Small challenge

Read `ble_status()` once per second. Show a message only when connection state changes, and display `pairing_remaining_s`. Explain the different side effects of reading status and opening pairing, and why reopening pairing on every loop iteration is inappropriate.

See [BLE API Reference](../reference/ble-control.md).
