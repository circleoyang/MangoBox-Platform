# IR Remote Guide

An IR remote can control a MangoBox project with navigation keys, OK, number keys, `*`, and `#`. The current canonical profiles expose the `ir` capability on MangoX2 and MangoLite in both High-Level MicroPython and Host Python; the hardware path differs by board.

## Check support

```python
from mangobox import Mango

m = Mango()
print(m.supports("ir"))
```

`True` means the selected target/mode profile exposes the IR Student API. It does not prove that an external receiver is wired correctly.

## Use OK to control LEDs

```python
from mangobox import Mango

m = Mango()

def ok_pressed():
    print("OK pressed")
    m.led_all("#00ff00")

def ok_released():
    print("OK released")
    m.led_off()

m.on_ir_pressed("ok", ok_pressed)
m.on_ir_released("ok", ok_released)

m.run_forever()
```

High-Level MicroPython must keep the Scheduler active, so callback examples normally end with `m.run_forever()`. Host Python receives Runtime IR events through the Host reader/dispatch path; do not apply the MicroPython event-loop requirement to Host programs.

## `is_ir_pressed()`

```python
if m.is_ir_pressed("up"):
    print("UP is held")
```

Host Python performs a synchronous Runtime state read. High-Level MicroPython reads held state maintained by the decoder, so a custom polling loop must continue servicing the Scheduler.

## MangoLite vs MangoX2

### MangoLite

- fixed onboard IR receiver
- current baseline uses GP22
- learner code does not create a raw GPIO receiver

### MangoX2

- optional external IR receiver
- `ir_sensor` must be enabled in Runtime configuration
- active GPIO comes from `ir_sensor_pin`
- Host Python and High-Level MicroPython share the same learner-facing key semantics

## Supported standard keys

```text
1 2 3
4 5 6
7 8 9
* 0 #
up left ok right down
```

Unknown keys raise `ValueError`; non-callable callbacks raise `TypeError`. On MangoX2, an IR API call may raise `RuntimeError` when the live Runtime config has IR disabled.

## Troubleshooting order

1. Confirm `m.supports("ir")`.
2. On MangoX2, verify `ir_sensor` is enabled and `ir_sensor_pin` matches wiring.
3. On MangoLite, make sure no raw GPIO/IRQ diagnostic is competing for the onboard receiver.
4. Test a minimal callback before combining IR with Motor/OLED/BLE behavior.
5. Use a raw edge diagnostic only after the semantic API path has been isolated; do not run raw IRQ ownership and the Student API receiver at the same time.

## Challenge

Use `up`, `down`, and `ok` to select LED colors or project states.

## More

- [IR Remote API Reference](../reference/ir.md)
