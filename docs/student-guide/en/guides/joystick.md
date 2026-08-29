# Joystick guide

A joystick normally contains an X axis, a Y axis, and a push switch. MangoBox maps X/Y to about `-100` to `100`, with the released center normally near `0, 0`.

## 30-second test

```python
from mangobox import Mango
import time

m = Mango()
while True:
    x, y = m.joystick()
    print(x, y, m.is_joystick_pressed())
    time.sleep(0.2)
```

`m.joystick()` and `m.is_joystick_pressed()` read the current state directly, so this polling pattern does not require `m.run_forever()`.

Release the stick during first use so the center can be established. Recalibrate when needed:

```python
m.calibrate_joystick()
```

`calibrate_joystick()` is also a one-time direct operation and does not need `run_forever()`.

## Push-switch event

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("Joystick pressed")
    m.bee()

m.on_joystick_pressed(pressed)
m.run_forever()
```

`on_joystick_pressed()` / `on_joystick_released()` start the Joystick watcher. Later state updates are Scheduler-driven, so callback-style code requires `m.run_forever()`. No separate `start_sensor()` call is required.

## If the center is not 0, 0

```python
from mangobox import Mango

m = Mango()
print("Joystick supported:", m.supports("joystick"))
print("Joystick enabled:", m.config.get("enabled_modules", {}).get("ps2"))
print("X ADC pin:", m.config.get("ps2_vrx_pin"))
print("Y ADC pin:", m.config.get("ps2_vry_pin"))
print("SW pin:", m.config.get("ps2_sw_pin"))
print("Deadzone:", m.config.get("ps2_deadzone"))
```

Verify `VRx → ps2_vrx_pin`, `VRy → ps2_vry_pin`, `SW → ps2_sw_pin`, plus VCC/GND. X and Y must use ADC-capable GPIOs.

If direct polling shows changing X/Y and switch values but callbacks never fire, first confirm the callback example reaches `m.run_forever()`.

## Raw ADC diagnostic

```python
from machine import ADC
from mangobox import Mango
import time

m = Mango()
x_adc = ADC(m.config.get("ps2_vrx_pin"))
y_adc = ADC(m.config.get("ps2_vry_pin"))

while True:
    print(x_adc.read_u16(), y_adc.read_u16())
    time.sleep(0.2)
```

Both values should change as the stick moves. If only one axis changes, check the other axis wiring first.

## More

- [Joystick API Reference](../reference/joystick.md)
- [Device Manager](../tools/device-manager.md)
- [Hardware Lab](../tools/hardware-lab.md)
