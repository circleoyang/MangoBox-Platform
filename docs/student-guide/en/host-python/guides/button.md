# Button — Host Python Guide

Host Python can read the Button synchronously or react to press/release callbacks.

## Direct read

```python
from mangobox import Mango

m = Mango()
print(m.read_button())
```

In Host 0.4.6, `read_button()` sends a read command and waits for the Runtime reply before returning the current value.

Typical values:

```text
0 = released
1 = pressed
```

A synchronous read does not require `m.run_forever()`.

## Press/release events

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("Button pressed")
    m.led_all("yellow")

def released():
    print("Button released")
    m.led_off()

m.on_pressed("button", pressed)
m.on_released("button", released)
m.start_button(100)
m.run_forever()
```

On the Host side:

- `start_button(100)` asks the Runtime to report Button state;
- the background UART listener receives events;
- callbacks run in Host threads;
- `run_forever()` mainly keeps the PC process alive so events can continue arriving.

## If events do not work

First test synchronous reads. If reads work but callbacks do not, check callback registration, `start_button()`, and whether the PC process remains alive. If reads also remain fixed, inspect Button enablement, pin configuration, and wiring in Device Manager.

See [Host Python Button API Reference](../reference/button.md).
