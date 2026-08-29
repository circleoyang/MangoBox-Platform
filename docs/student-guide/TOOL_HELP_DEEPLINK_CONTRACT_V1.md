# MangoBox Tool → Documentation Deep-Link Contract v1

Status: integration contract; documentation/site-only

## 1. Purpose

Device Manager and Hardware Lab should be able to open the correct MangoBox documentation without asking the student to re-select information the tool already knows.

The contract intentionally separates two destinations:

1. **Tool help** — how to use Device Manager or Hardware Lab itself.
2. **Contextual Student API help** — documentation for the selected hardware / programming mode / software profile / module.

These are different responsibilities and must not be merged into one ambiguous Help action.

---

## 2. Destination A — Tool help

Tool help does not require a Student API programming mode.

Recommended route model:

```text
/{language}/tools/{tool}/{tool_version?}/{topic?}
```

Examples:

```text
/zh-TW/tools/device-manager/configure-modules
/en/tools/hardware-lab/clean-flash
/en/tools/hardware-lab/execution-mode
```

---

## 3. Destination B — Contextual Student API help

Use this when a tool is already showing or diagnosing a learner-facing module.

Required logical context:

```text
language
target
programming mode
compatibility profile
module
view
```

Recommended query-string form for the current static MVP:

```text
/docs/student-guide/site/?lang=zh-TW&target=mangox2-pico2w&mode=high_level_micropython&profile=mangox2-pico2w__hlmp__runtime-0.2.6-rc10&module=ir&view=troubleshooting
```

The production site may later use clean path routes, but the semantic fields should remain the same.

---

## 4. Allowed parameters

| Parameter | Meaning | Example |
|---|---|---|
| `lang` | UI/content language | `zh-TW` |
| `target` | Exact MangoBox target | `mangox2-pico2w` |
| `mode` | Programming mode | `high_level_micropython` |
| `profile` | Resolved compatibility-profile ID | `mangox2-pico2w__hlmp__runtime-0.2.6-rc10` |
| `module` | Canonical documentation module | `ir` |
| `view` | `guide`, `troubleshooting`, or `reference` | `troubleshooting` |

Optional non-secret device-state overlays may include `module_enabled`, configured `*_pin` values, `source`, and `tool_version`. These values help explain the connected device but must never be treated as canonical proof that an API exists.

---

## 5. Values that must not be placed in documentation URLs

Do not include Wi-Fi credentials, Gateway secrets, student/session identifiers, access tokens, API keys, email addresses, unnecessary device identifiers, full local filesystem paths, or student source code. COM port names should normally remain local as well.

---

## 6. Module configuration context

Useful troubleshooting context includes:

| Module | Device context |
|---|---|
| LED | `led_strip_pin`, `led_strip_leds` |
| Button | `button_pin` |
| IR | `ir_sensor_pin` on MangoX2; MangoLite onboard IR remains fixed GP22 |
| OLED | `oled_sda_pin`, `oled_scl_pin`, `oled_i2c_id`, `oled_addr` |
| Buzzer | `buzzer_pin` |
| Servo | `servo_pin` |
| PIR | `pir_sensor_pin` |
| Light | `light_sensor_pin` |
| Sound | `sound_sensor_pin` |
| Joystick | `ps2_vrx_pin`, `ps2_vry_pin`, `ps2_sw_pin` |

Passing these values is optional. If absent, the site renders generic documentation.

---

## 7. Device Manager integration policy

Device Manager is the preferred source for configuration-aware API help because it already knows the connected Runtime target and configuration.

Recommended actions:

```text
[Guide]
[Troubleshooting]
```

The selected target should come from Runtime metadata. Runtime version should come from the firmware/runtime identity data. Programming mode must be passed explicitly; do not infer Host Python merely because Device Manager itself is a desktop application.

---

## 8. Hardware Lab integration policy

Hardware Lab v0.2.0-rc3 is currently a **firmware and device-lifecycle diagnostic tool**, not a generic GPIO/ADC/Sensor signal-test tool.

Appropriate tool-help topics include target selection, Firmware Update, Clean Flash, Factory Reset-assisted deployment, Button + RESET maintenance gestures, execution-mode detection/switching, MicroUSB / Host UART / Gateway management paths, and diagnostic reporting.

For ordinary Student API signal problems, use:

```text
supports()/capability
→ module enablement
→ configured Pin
→ Device Manager Live Read / Monitor when supported
→ minimal raw diagnostic program
→ physical wiring / power
```

A Student API troubleshooting page should escalate to Hardware Lab only when evidence points to a lifecycle problem such as firmware/target mismatch, wrong execution mode, Recovery/Rescue, Clean Flash, management-transport failure, or post-flash lifecycle failure.

---

## 9. Compatibility profile resolution

Tools should prefer passing a resolved `profile` ID when enough version information is available. The first static MVP uses explicit profile IDs to avoid ambiguous matching.

Example:

```text
/docs/student-guide/site/?lang=zh-TW&target=mangox2-pico2w&mode=high_level_micropython&profile=mangox2-pico2w__hlmp__runtime-0.2.6-rc10&module=ir&view=troubleshooting&module_enabled=1&ir_sensor_pin=4&source=device_manager
```

The page should then preserve the selected hardware, programming mode, software profile, module, view, and safe device context.

---

## 10. Current implementation boundary

This contract is documentation/site-only. Actual Device Manager / Hardware Lab Help-button integration should be implemented and validated with the corresponding packaged-tool release process rather than assumed by the public documentation site.
