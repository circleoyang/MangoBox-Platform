# BLE Control Guide — High Level MicroPython

BLE Control lets a MangoLite receive controller input from the Dabble Gamepad over Bluetooth Low Energy (BLE). Your Student API program then decides what those inputs do: control RGB LEDs, the buzzer, a Servo, motors, or another project function.

> This page reflects the **verified MangoLite Runtime v0.6.3** behavior. It applies only to **MangoLite + Pico W / Pico 2 W using High Level MicroPython**. Do not treat MangoX2, non-wireless Pico, or Host Python as supported BLE Control targets yet.

## 30-second quick test

```python
from mangobox import Mango

m = Mango()

def up_pressed():
    print("UP pressed")


def up_released():
    print("UP released")

m.on_control_pressed("up", up_pressed)
m.on_control_released("up", up_released)

print("BLE name:", m.control_name())
print("Hold board Button GP3 for 10 seconds to pair")
m.run_forever()
```

After the program starts:

1. Hold the MangoLite onboard Button (GP3) for **10 seconds**.
2. The device opens an approximately **60-second** BLE pairing window.
3. In Dabble, connect to the BLE name printed by the program.
4. Open **Gamepad → Digital**.
5. Press and release `UP`. The Shell should print `UP pressed` and `UP released`.

Normal Runtime startup does not continuously advertise BLE. The 10-second Button gesture explicitly opens the pairing window, which helps prevent students from selecting the wrong board in a classroom with many powered devices.

## Digital Gamepad control names

MangoLite v0.6.3 implements these Dabble Gamepad Digital control names:

```text
start  select
triangle  circle  cross  square
up  down  left  right
```

The simplest callback APIs are:

```python
m.on_control_pressed("circle", callback)
m.on_control_released("circle", callback)
```

Press and release are separate events. If a project must move while a key is held and stop when it is released, register both callbacks.

## Use the D-pad for different LED effects

```python
from mangobox import Mango

m = Mango()

m.on_control_pressed("up", lambda: m.led_all("red"))
m.on_control_pressed("down", lambda: m.led_all("blue"))
m.on_control_pressed("left", lambda: m.breath("purple"))
m.on_control_pressed("right", lambda: m.rainbow())

m.run_forever()
```

BLE Control provides controller input only. It does not own RGB, Motor, Servo, or Buzzer behavior; those actions still use the existing Mango Student API.

## Analog Joystick

For Dabble **Gamepad → Analog / Joystick**, register:

```python
m.on_control_joystick(callback)
```

The callback receives `angle` and `radius`:

```python
def joystick_changed(angle, radius):
    print("angle =", angle, "radius =", radius)
```

Complete example:

```python
from mangobox import Mango

m = Mango()

def joystick_changed(angle, radius):
    print("angle =", angle, "radius =", radius)

m.on_control_joystick(joystick_changed)
m.run_forever()
```

The current Dabble Analog Gamepad reports angle in 15-degree steps and radius in the range `0..7`. Do not substitute an unverified `-100..100` range in teaching material.

## Generic control events

Advanced code can register the control and action directly:

```python
m.on_control("triangle", "press", callback)
m.on_control("triangle", "release", callback)
m.on_control("joystick", "value", joystick_callback)
```

The public v0.6.3 actions are:

```text
press
release
value
```

The optional `controller` argument defaults to `"primary"`. v0.6.3 still allows one active controller owner; keeping the selector in the API does not mean multiple phones may control the board concurrently today.

## Read the BLE name and connection state

```python
print(m.control_name())
print(m.control_connected())
```

- `control_name()` returns the effective BLE device name.
- `control_connected()` returns `True` when the primary controller is connected.

These calls lazily create the BLE Control runtime, but creating the runtime **does not automatically open the pairing window**.

## Why `m.run_forever()` is required

BLE callbacks depend on the Mango scheduler continuously updating the BLE runtime. Keep the event loop running:

```python
m.run_forever()
```

If `main.py` exits after registering callbacks, later phone input cannot continue to be processed.

## Connection and safety notes

BLE Control emits controller events and does not assume that every project is a vehicle. A disconnect therefore does not impose one universal Motor action on all projects.

If BLE controls motors or another moving mechanism, design an appropriate safe-stop policy in the learner program. The official Digital Car example also attempts to stop the motors when the program exits.

## Troubleshooting order

1. Verify MangoLite Runtime **v0.6.3 or a later compatible version**.
2. Verify the MCU is **Pico W or Pico 2 W**, not a non-wireless Pico.
3. Call at least one BLE Control API such as `on_control_pressed()` or `control_name()` so the BLE Control runtime is created.
4. Hold onboard Button GP3 for **10 seconds**. A normal short press remains available to the Student Button API.
5. In Dabble, connect to the name returned by `m.control_name()`.
6. Use **Gamepad → Digital** for button callbacks and **Gamepad → Analog / Joystick** for the joystick callback.
7. Keep `m.run_forever()` at the end of callback-based programs.
8. Holding the pairing gesture while already connected does not open another pairing window; v1 has one controller owner at a time.

After a disconnect, Runtime releases controller ownership and can return to the pairing/reconnect flow without reflashing firmware just because the phone disconnected.

## Verified examples

The Runtime contains learner-facing BLE Control examples including:

- `ble_button_basic.py`
- `ble_rgb_buttons.py`
- `ble_buzzer_gamepad.py`
- `ble_servo_control.py`
- `ble_joystick_hue_ring.py`
- `ble_car_digital.py`
- `ble_car_analog.py`

They are under `runtime/mangolite-pico2w/firmware/examples/` and can be used as the starting point for larger projects.

## Small challenge

Give `UP / DOWN / LEFT / RIGHT` four different LED effects, then use `CIRCLE` to play a short sound. Build it only from existing Student APIs; no BLE packet or UUID parsing is needed.

For exact signatures and version availability, see the [BLE Control API Reference](../reference/ble-control.md).
