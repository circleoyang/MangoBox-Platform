# Device Manager Basics

Device Manager is MangoBox's **day-to-day device configuration, calibration, and live-monitoring tool**. The current public stable release is **v0.5.0**, aligned with the five Runtime targets published on 2026-09-06:

```text
MangoX2 + Pico       → Runtime v0.2.6
MangoX2 + Pico W     → Runtime v0.2.6
MangoX2 + Pico 2 W   → Runtime v0.2.6
MangoLite + Pico W   → Runtime v0.6.0
MangoLite + Pico 2 W → Runtime v0.6.0
```

Use the Windows Installer for normal installations or the Portable ZIP for no-install deployment. Stable downloads and SHA-256 values are listed in the [MangoBox Download Center](../../../../releases/).

---

# 1. What Device Manager is for

Common learner tasks include:

- connect MangoX2 / MangoLite;
- identify the target, MCU, and Runtime version;
- enable or disable optional modules;
- configure GPIO / Pin assignments;
- apply settings and read them back;
- use Read Once / Monitor where supported;
- calibrate supported modules such as Light, Sound, and Joystick;
- import, export, and restore configuration;
- inspect Student API / JSON previews where available.

Device Manager does **not** handle firmware flashing, Clean Flash, Factory Reset, Recovery, or Deep Rescue. Those device-lifecycle tasks belong to Hardware Lab v0.3.0.

---

# 2. Connection paths

## MicroUSB / Pico

Uses the Pico's native USB connection and the MicroPython / RuntimeConfig management path. If MangoThonny currently owns the same COM port, stop the program and release the device connection before opening Device Manager.

## Runtime UART

Uses a 3.3 V USB-to-TTL adapter at `115200` baud. Always share ground:

```text
GND ↔ GND
```

MangoX2 and MangoLite use different Host UART pins. Follow the currently selected target in Device Manager instead of reusing another board's pin assignment.

---

# 3. Confirm device identity first

Before changing pins or module settings, verify:

```text
Target
MCU family
Runtime / Firmware version
Active connection path
Whether config was read successfully
```

Device Manager v0.5.0 passed identity / system-info / config sanity checks against all five stable Runtime targets. The UI should match the actual board and Runtime currently connected.

---

# 4. Standard module-configuration flow

For an external IR module, for example:

```text
choose IR
→ Enable
→ choose Pin
→ Apply
→ read config back
→ confirm the value
→ run the Student API
```

Configuration and physical wiring must agree. API availability is also separate from the module's current Enable state.

---

# 5. GPIO / Pin and ADC labels

Device Manager treats the Runtime config as the configuration source of truth. ADC labels match the board silkscreen:

```text
GP26 (AD0)
GP27 (AD1)
GP28 (AD2)
```

`AD0 / AD1 / AD2` are UI labels; canonical Runtime GPIO values remain `26 / 27 / 28`.

---

# 6. MangoLite and MangoX2 differences

The same Student API semantics may map to different board hardware. For example:

- **MangoLite IR** is a fixed onboard GP22 function.
- **MangoX2 IR** is an optional external module whose pin is configurable.
- **MangoX2 OLED / RGB / Button** are standard pre-installed modules, not PCB-mounted components.

Select the correct target first, then verify Enable state, pin assignment, and physical wiring.

---

# 7. Read Once / Monitor and calibration

When a module page provides live reading, use it to confirm the Runtime path before rewriting a full project. A useful troubleshooting order is:

```text
Student API supports()
→ module Enable state
→ GPIO / Pin
→ Device Manager Read Once / Monitor
→ minimal raw diagnostic
→ VCC / GND / Signal wiring
→ calibration
```

For Light, Sound, Joystick, and other calibrated modules, confirm that the raw signal behaves correctly before calibrating.

---

# 8. Import / Export / Restore

- **Export / Backup** saves the current configuration.
- **Import** applies selected settings back to the device.
- **Restore / Defaults** performs a broader configuration change and should be used with awareness of its scope.

If the Runtime itself must be rebuilt or Recovery / Deep Rescue is required, use Hardware Lab instead.

---

# 9. Online Documentation integration

Device Manager can deep-link the current environment into MangoBox Online Documentation, including:

```text
language
target
programming mode
Runtime version
module
module_enabled
configured Pin
```

The online documentation now follows the five stable Runtime targets and filters Student API content by the selected stable compatibility profile.

## Related documentation

- [Hardware Lab Basics](hardware-lab.md)
- [Device Manager v0.5.0 full installation and user guide](../../../../desktop/device-manager/guide/)
- [MangoBox Download Center](../../../../releases/)
- Module Guide / Troubleshooting / API Reference pages
