# Device Manager Basics

Device Manager is used for **MangoX2 / MangoLite configuration and maintenance**. It helps you confirm what the Runtime currently accepts before returning to MangoThonny/Python to build a project with the Student API.

> This page follows the current public `v0.5.0-rc8` multi-target design. The Traditional-Chinese Windows Installer is recommended for normal users; use the Portable ZIP when a no-install deployment is preferred.

The main combinations recognized by `v0.5.0-rc8` include:

```text
MangoX2 + Pico
MangoX2 + Pico 2 W
MangoX2 + Pico W
MangoLite + Pico 2 W
MangoLite + Pico W
```

---

# 1. What can Device Manager do?

Common learner tasks include:

- connect MangoX2 / MangoLite;
- confirm target and Runtime/firmware information;
- enable or disable optional modules;
- configure GPIO/Pin assignments;
- apply settings and read them back;
- use Live Read / Monitor where the selected version supports it;
- perform implemented calibration/maintenance for Light, Sound, Joystick and similar modules;
- import, export, or restore configuration;
- inspect Student API / JSON previews where provided.

Device Manager does **not** replace the Student API. After configuration, return to MangoThonny/Python to write the project.

---

# 2. Choose the correct connection path

Two common management paths are used today.

## A. MicroUSB / Pico

Uses the Pico USB connection and MicroPython REPL/RuntimeConfig management path.

This supports a one-cable classroom workflow.

### Do not let two programs own the same COM port

If Thonny/MangoThonny currently owns the Pico COM port, Device Manager may not be able to use it simultaneously.

Recommended flow:

```text
stop the current program
→ release/disconnect the device in Thonny
→ connect with Device Manager
```

When configuration is complete, return to Thonny/MangoThonny.

## B. Runtime UART

Uses a USB-to-TTL adapter connected to the Runtime UART.

MangoLite and MangoX2 do not use the same UART pins. Follow the selected target's current tool/hardware documentation rather than reusing another board's pin assignment.

Always share ground:

```text
GND ↔ GND
```

Current Runtime UART baud rate is `115200`.

In `v0.5.0-rc8`, when MangoX2 returns from `MicroUSB / Pico` to `Runtime UART`, Device Manager waits through the normal Runtime reboot and then performs one readiness/config refresh round instead of repeatedly reading the same device information.

---

# 3. After connecting, confirm device identity first

Do not change pins immediately.

First verify:

```text
Target
Runtime / firmware version
Connection path
Configuration read succeeded
```

Distinguish among:

```text
MangoX2 + Pico
MangoX2 + Pico 2 W
MangoX2 + Pico W
MangoLite + Pico 2 W
MangoLite + Pico W
```

because IR, Button, UART and other hardware rules can differ by target.

> An open COM port is not proof that the Runtime is ready. Runtime replies/system-info style handshakes are the meaningful readiness evidence.

---

# 4. Standard module-configuration flow

For an external IR Sensor, for example:

```text
Choose IR
   ↓
Enable
   ↓
Choose Pin
   ↓
Apply settings
   ↓
Read config again
   ↓
Confirm the same values were accepted
   ↓
Run the Student API
```

If Device Manager reports:

```text
IR enabled = True
IR Pin = GP4
```

the physical module must also use:

```text
IR OUT / Signal → GP4
```

Configuration and wiring must agree.

---

# 5. Understanding Pin Config

Device Manager should treat the **Runtime's current configuration as the source of truth** instead of maintaining a second hidden GPIO default map.

Learners should verify both:

### ① The displayed setting

For example:

```text
Servo → GP10
Light Sensor → GP26 (AD0)
Sound Sensor → GP27 (AD1)
IR → GP4
```

`v0.5.0-rc8` mirrors the Pico ADC silkscreen labels in the UI:

```text
GP26 (AD0)
GP27 (AD1)
GP28 (AD2)
```

`AD0 / AD1 / AD2` are presentation aliases. Canonical Runtime configuration values remain GPIO `26 / 27 / 28`.

### ② The real Signal wire

If the UI says `GP4` while the sensor is physically connected to `GP17`, correct Python code still cannot receive the signal.

---

# 6. Do not mix MangoLite and MangoX2 hardware rules

The same feature name may represent different hardware.

### MangoLite + Pico 2 W / Pico W IR

The IR receiver is fixed onboard hardware on:

```text
GP22
```

It should not be presented like an arbitrary external IR pin.

### MangoX2 + Pico / Pico 2 W / Pico W IR

IR is optional and High Level MicroPython uses:

```text
enabled_modules.ir_sensor
ir_sensor_pin
```

Therefore Device Manager displays the current `ir_sensor_pin`, not MangoLite's fixed GP22.

---

# 7. Using Live Read / Monitor

When a page provides Live Read / Monitor, use it as a quick high-level path check.

For a Button, for example:

```text
released → 0
pressed  → 1
```

If Live Read changes correctly, Runtime configuration and the high-level read path are probably healthy.

If it does not respond, do not rewrite the full project first. Check:

```text
enablement
→ configured Pin
→ minimal raw diagnostic
→ physical wiring / power
```

> Live Read / Monitor support varies by module and Runtime version. Documentation must only promise controls that the selected Device Manager/Runtime combination really implements.

---

# 8. Correct troubleshooting order for a Sensor

For a Light Sensor:

```text
1. m.supports("light")
2. light_sensor enabled?
3. light_sensor_pin = ?
4. Device Manager config / Live Read (when supported)
5. minimal machine.ADC raw test
6. AO / VCC / GND physical wiring
7. raw changes but 0–100 is poor → calibration
```

Use `machine.Pin` for a small digital-input check where appropriate.

This helps separate:

```text
API / Runtime issue
configuration issue
Pin / wiring issue
calibration issue
project-logic issue
```

---

# 9. Import / Export / Restore

Think of these as different operations:

- **Export / backup** — save the current settings;
- **Import** — apply selected settings to a device;
- **Restore / Defaults** — broader configuration changes that require understanding their effect.

Full restore behavior may depend on Runtime version, so production documentation should resolve instructions by Device Manager version + Runtime version.

---

# 10. OLED font-management differences by connection mode

In `v0.5.0-rc8`, the OLED Font Manager keeps the existing Chinese-glyph analysis/upload path in both connection modes, but the persistent `Current Student Custom Font Cache` read/clear management block is shown only in `MicroUSB / Pico`.

```text
Runtime UART
→ glyph analysis/upload remains available
→ persistent font-cache management block is hidden

MicroUSB / Pico
→ full persistent font-cache management block is shown
```

This is a UI availability decision; it does not remove other Runtime UART OLED capabilities.

---

# 11. When should I switch from Device Manager to Hardware Lab?

Use Hardware Lab when the problem is no longer just one Sensor/Pin and instead involves:

```text
unknown firmware
possible target / MCU mismatch
wrong execution_mode
Recovery / Rescue
Clean Flash
unexpected mode after an update
MicroUSB / Host UART / Gateway lifecycle-management path
```

See [Hardware Lab Basics](hardware-lab.md).

The current Hardware Lab focuses on firmware and device lifecycle; it is not a general GPIO/ADC Sensor tester.

---

# 12. Relationship to Student API documentation

A future Device Manager module page can provide:

```text
[Guide]
[Troubleshooting]
```

and pass known context into Online Documentation:

```text
language
target
programming mode
Runtime version
module
module_enabled
configured Pin
```

For example, MangoX2 IR configured on GP4 can open directly at:

> MangoX2 + Pico 2 W → High Level MicroPython → IR → Troubleshooting → configured GP4

without asking the learner to choose everything again.

## Related documentation

- [Hardware Lab Basics](hardware-lab.md)
- each module's Troubleshooting view
- [Tool → Documentation Deep-Link Contract](../../TOOL_HELP_DEEPLINK_CONTRACT_V1.md)
