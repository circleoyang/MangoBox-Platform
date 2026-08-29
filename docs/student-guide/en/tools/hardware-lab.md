# Hardware Lab Basics

Hardware Lab is MangoBox's **firmware and device-lifecycle diagnostic tool**. The current release is not a general-purpose Sensor/GPIO live-test tool. Its main responsibilities are:

- selecting the correct MangoBox target;
- firmware updates;
- Clean Flash (Factory Reset + firmware deployment);
- Button + RESET maintenance gestures;
- execution-mode detection and switching;
- MicroUSB / Host UART / Gateway management paths;
- diagnostic reporting.

> Hardware Lab v0.2.0-rc3 does **not** yet provide general GPIO/ADC/RGB/Buzzer/OLED/Servo/Sensor production tests. When an API troubleshooting page says to verify a real Pin signal, use the minimal diagnostic program in the documentation or a supported Device Manager Live Read / Monitor path. Do not assume Hardware Lab already contains every Sensor test.

---

## When should I use Hardware Lab?

Typical learner or classroom-maintenance situations include:

1. updating MangoX2 / MangoLite firmware;
2. checking an unknown execution mode;
3. recovering a board that did not return to the expected mode after an update;
4. performing a Clean Flash;
5. validating Recovery / Deep Rescue style gestures;
6. saving a diagnostic report before changing the device again.

If the problem is only "Why does my Light Sensor return no value?", start with that module's **Troubleshooting** page instead of performing a Clean Flash.

---

# 1. Select the correct hardware target first

Current Hardware Lab targets are:

```text
MangoLite + Pico 2 W
MangoX2 + Pico
MangoX2 + Pico 2 W
```

This matters because MCU family, Recovery Button, Host UART pins, Gateway support and firmware UF2 are not identical across targets.

| Target | MCU | Recovery Button | Host UART | Gateway |
|---|---|---|---|---|
| MangoLite + Pico 2 W | RP2350 | GP3 | GP4 TX / GP5 RX | Yes |
| MangoX2 + Pico | RP2040 | GP7 (pre-installed, removable) | GP12 TX / GP13 RX | No |
| MangoX2 + Pico 2 W | RP2350 | GP7 (pre-installed, removable) | GP12 TX / GP13 RX | Yes |

On MangoX2, GP7 is a removable pre-installed Button rather than a PCB-fixed control. If it has been removed, a Button + RESET gesture test is **N/A**, not FAIL.

---

# 2. Firmware Update — keep current settings

Use the normal firmware update when you want a newer Runtime without intentionally clearing the current device configuration.

Typical flow:

```text
Select target
   ↓
Select matching .uf2
   ↓
Firmware Update
   ↓
Hardware Lab validates target / MCU
   ↓
Enter UF2 bootloader
   ↓
Copy firmware
```

A normal firmware update does **not** guarantee that the board will reboot into MicroPython mode. The persisted `execution_mode` still matters.

---

# 3. Clean Flash — use only when a real reset is required

Clean Flash combines Factory Reset and firmware deployment.

It is appropriate when:

- configuration is badly inconsistent;
- you need a clean Runtime environment;
- a normal firmware update cannot resolve a lifecycle problem;
- a teacher needs to return equipment to a known classroom state.

Do not use Clean Flash as the first response to an ordinary sensor-wiring problem.

---

# 4. Button + RESET maintenance gestures

Hardware Lab can guide maintenance-gesture validation, but the PC-side timer is only a reference. Firmware determines the real gesture timing and behavior.

### MangoLite

GP3 and the maintenance cue hardware are board-fixed.

### MangoX2

GP7 and the RGB strip may be removed.

Therefore:

- the fixed onboard Buzzer is the more reliable cue;
- RGB is an extra cue only when the module is still installed;
- when GP7 is absent, the gesture test should be marked N/A.

---

# 5. Execution-mode detection and switching

MangoBox may use:

```text
micropython
host_uart
gateway
```

but not every target supports every mode.

For example, MangoX2 + Pico (RP2040) has no Wi-Fi and therefore has no Gateway mode.

Hardware Lab's `Auto` path probes management transports that make sense for the selected target instead of assuming all boards behave the same way.

---

# 6. Three common connection paths

## MicroUSB

Used for MicroPython REPL management, ROM-bootloader entry and selected firmware/mode-management paths.

If Thonny owns the same COM port, stop/release the connection first.

## Host UART

Use a 3.3 V USB-TTL adapter.

In addition to TX/RX, always connect:

```text
GND ↔ GND
```

Current Runtime UART baud rate:

```text
115200
```

Use the target-specific TX/RX pins shown by Hardware Lab. Do not mix MangoLite and MangoX2 UART pin assignments.

## Gateway

Only available on wireless-capable targets. MangoX2 + Pico (RP2040) has no Gateway path.

---

# 7. Save the Diagnostic Report before changing more things

Hardware Lab can record lifecycle diagnostics such as:

- target ID;
- MCU family;
- hardware-presence information;
- Recovery Button;
- UART pins;
- COM ports;
- Gateway configuration;
- selected firmware;
- Clean Flash mode;
- stable diagnostic code.

When reporting a difficult problem, a good rule is:

> **Save the JSON diagnostic report before changing device state again.**

This preserves evidence about the original failure state.

---

# 8. How do I diagnose Sensor / GPIO problems today?

For problems such as:

> "Why does my PIR / Light / Sound / IR / Joystick not respond?"

use this current flow:

```text
Student API supports() / capability
        ↓
module enabled?
        ↓
configured GPIO / Pin
        ↓
Device Manager Live Read / Monitor (when supported)
        ↓
minimal raw diagnostic program from the API docs
        ↓
physical VCC / GND / Signal wiring
```

A Digital input can be checked with `machine.Pin`; an ADC sensor can be checked with `machine.ADC` to see whether its raw value changes.

**Do not treat the current Hardware Lab as a general GPIO/ADC oscilloscope.** That can be a future capability, but documentation should not promise it until it exists.

---

# 9. Hardware Lab vs Device Manager

| Tool | Main purpose |
|---|---|
| Device Manager | module enablement, Pin configuration, configuration management, supported Live Read / Monitor, calibration |
| Hardware Lab | firmware, Clean Flash, Recovery, execution mode, management transports, lifecycle diagnostics |
| Student API documentation | learner programming and minimal diagnostic programs |

These tools complement one another rather than replacing one another.

---

## Related documentation

- [Device Manager Basics](device-manager.md)
- each API module's Troubleshooting view
- the Online Documentation target / mode / version selector
