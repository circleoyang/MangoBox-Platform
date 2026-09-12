# MangoBox Device Manager

Public product/release area for MangoBox Device Manager.

Current engineering source remains in the private MangoBox repository during migration.

## Current public release

- Device Manager: `v0.5.2`
- Tag: `device-manager-v0.5.2`
- Windows Installer: `MangoBox_Device_Manager_v0.5.2_Setup.exe`
- Windows Portable: `MangoBox_Device_Manager_v0.5.2_Portable.zip`
- Release status: Stable
- Portable SHA-256: `e4b435b88ee2fa55720c537c329a1d09b128387e722fe21f92e2415ecaa529da`
- Installer SHA-256: `7c6373914dee3efe192e434d00fcb91686b89c159496f6943e4296f90a88aabb`

The Installer is the recommended download for normal Windows users. The Portable ZIP is provided for no-install and classroom deployment scenarios.

## v0.5.2 stable scope

- Adds cross-board Motor Direction Calibration for all five supported Runtime targets.
- Supports logical wheel mapping through `drive.left_motor` / `drive.right_motor`.
- Supports independent per-wheel inversion through `drive.left_inverted` / `drive.right_inverted`.
- Keeps raw M1/M2 channel diagnostics separate from vehicle-level Forward / Backward / Tank / Arc / Spin semantics.
- Applies updated Drive configuration on the next Drive command without requiring reboot.
- Retains the v0.5.1 capability/navigation resolver alignment, OLED visibility behavior, and MangoLite optional-module parity.

## Supported Stable target line

- MangoX2 + Pico — `mangox2-pico` — Runtime `v0.2.8`
- MangoX2 + Pico W — `mangox2-picow` — Runtime `v0.2.8`
- MangoX2 + Pico 2 W — `mangox2-pico2w` — Runtime `v0.2.8`
- MangoLite + Pico W — `mangolite-picow` — Runtime `v0.6.3`
- MangoLite + Pico 2 W — `mangolite-pico2w` — Runtime `v0.6.3`

## Validation

- Device Manager full local regression: `213 PASS`.
- Stable Portable / Installer package build: PASS.
- Exact stable Windows install / launch / shortcut icon / uninstall visual smoke: PASS.
- Representative MangoX2 Motor Direction Calibration hardware smoke: PASS.

## Public release policy

- Source migration will be intentional and component-scoped.
- User-downloadable binaries are attached to component-specific GitHub Releases.
- Installer and Portable packages should come from the same validated binary tree when the engineering release supports both forms.
- Do not commit generated portable ZIP/EXE packages into this directory.
- Online user documentation is published under `docs/` and the product guide under `desktop/device-manager/guide/`.

Tag format: `device-manager-vX.Y.Z`.
