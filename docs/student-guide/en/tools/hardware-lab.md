# Hardware Lab Basics

Hardware Lab is MangoBox's **firmware and device-lifecycle tool**. The current public stable release is **v0.3.0**, aligned with the five Runtime targets published on 2026-09-06:

```text
MangoX2 + Pico       → Runtime v0.2.6
MangoX2 + Pico W     → Runtime v0.2.6
MangoX2 + Pico 2 W   → Runtime v0.2.6
MangoLite + Pico W   → Runtime v0.6.0
MangoLite + Pico 2 W → Runtime v0.6.0
```

Hardware Lab handles Firmware Update, Clean Flash, Factory Reset assistance, Recovery / Deep Rescue, execution modes, management transports, and diagnostic reports. Normal GPIO / Pin configuration, calibration, and sensor monitoring belong to Device Manager v0.5.0.

Stable downloads and SHA-256 values are listed in the [MangoBox Download Center](../../../../releases/).

---

# 1. Select the correct target first

In v0.3.0, first select MangoX2 / MangoLite, then select Pico / Pico W / Pico 2 W. The five stable targets differ as follows:

| Target | MCU | Recovery Button | Host UART | Gateway |
|---|---|---|---|---|
| MangoX2 + Pico | RP2040 | GP7 (standard pre-installed, removable) | GP12 TX / GP13 RX | No |
| MangoX2 + Pico W | RP2040 | GP7 (standard pre-installed, removable) | GP12 TX / GP13 RX | Yes |
| MangoX2 + Pico 2 W | RP2350 | GP7 (standard pre-installed, removable) | GP12 TX / GP13 RX | Yes |
| MangoLite + Pico W | RP2040 | GP3 | GP4 TX / GP5 RX | Yes |
| MangoLite + Pico 2 W | RP2350 | GP3 | GP4 TX / GP5 RX | Yes |

The MangoX2 GP7 button is a removable pre-installed module rather than a fixed PCB-mounted component. If it has been removed, a Button + RESET gesture test should be treated as N/A rather than FAIL.

---

# 2. Firmware Update

Use a normal Firmware Update when you want to update the Runtime while preserving the current device configuration:

```text
select Target
→ select the exact matching UF2
→ Firmware Update
→ confirm Target / MCU
→ enter UF2 bootloader
→ copy firmware
→ wait for reboot and status verification
```

All five stable UF2 files are independent targets. Do not interchange them just because two targets use the same MCU family.

---

# 3. Clean Flash

Use Clean Flash only when the device environment really needs to be rebuilt, for example when:

- configuration is badly inconsistent;
- a normal Firmware Update does not recover the device;
- a teacher needs to return classroom hardware to a known deployment state;
- a full Factory Reset + firmware deployment workflow is required.

Do not use Clean Flash as the first response to an ordinary module problem.

---

# 4. Recovery / Deep Rescue gestures

Maintenance gestures are interpreted by the Runtime; the PC timer is only an operational guide.

- **MangoLite** uses GP3 + RESET.
- **MangoX2** uses GP7 + RESET; GP7 is a removable pre-installed module.

The general progression is normal boot, Recovery after a longer hold, and Deep Rescue after a still longer hold. Follow Hardware Lab and the current stable Runtime status rather than relying only on the timer.

---

# 5. Execution modes

MangoBox may use:

```text
micropython
host_uart
gateway
```

Not every target provides every mode. A standard Raspberry Pi Pico has no Wi-Fi, so **MangoX2 + Pico does not provide Gateway mode**. Pico W / Pico 2 W targets can use the Gateway path.

---

# 6. Management connections

## MicroUSB

Used for MicroPython / REPL management, bootloader access, and some firmware / mode operations. If MangoThonny owns the same COM port, stop the program and release the connection first.

## Host UART

Use a 3.3 V USB-to-TTL adapter at `115200` baud and always share ground:

```text
GND ↔ GND
```

MangoX2 and MangoLite use different UART pins, so follow the selected target.

## Gateway

Available only on Wi-Fi targets. Standard MangoX2 + Pico has no Gateway path.

---

# 7. Diagnostic Report

When a lifecycle problem occurs, save the JSON diagnostic report before making larger device changes. A report may include:

- target / MCU;
- Runtime identity;
- Recovery Button state;
- Host UART pins;
- COM port;
- Gateway configuration;
- selected UF2;
- execution mode;
- Clean Flash / Recovery state;
- stable diagnostic code.

---

# 8. Sensor / GPIO troubleshooting

For a PIR / Light / Sound / IR / Joystick problem, do not start with Clean Flash. Use this order instead:

```text
Student API supports()
→ module Enable state
→ GPIO / Pin
→ Device Manager Read Once / Monitor
→ minimal raw diagnostic
→ VCC / GND / Signal wiring
→ calibration
```

Hardware Lab v0.3.0 remains a firmware / lifecycle tool, not a general GPIO / ADC oscilloscope.

---

# 9. Tool responsibilities

| Tool | Primary role |
|---|---|
| MangoThonny v0.4.0 | Python / MicroPython teaching, Host Student API, project development and export |
| Device Manager v0.5.0 | Module Enable state, pins, configuration, calibration, Read Once / Monitor |
| Hardware Lab v0.3.0 | Firmware, Clean Flash, Recovery, execution mode, lifecycle diagnostics |

## Related documentation

- [Device Manager Basics](device-manager.md)
- [Hardware Lab v0.3.0 full installation and user guide](../../../../desktop/hardware-lab/guide/)
- [MangoBox Download Center](../../../../releases/)
- Online Documentation target / mode / stable-version selector
