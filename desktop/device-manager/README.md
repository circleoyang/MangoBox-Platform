# MangoBox Device Manager

Public product/release area for MangoBox Device Manager.

Current engineering source remains in the private MangoBox repository during migration.

## Current public release

- Device Manager: `v0.5.0`
- Tag: `device-manager-v0.5.0`
- Windows Installer: `MangoBox_Device_Manager_v0.5.0_Setup.exe`
- Windows Portable: `MangoBox_Device_Manager_v0.5.0_Portable.zip`
- Release status: Stable
- Portable SHA-256: `5619ceabcf2f5393df54898c5b2443a4927c70bae541bfd331d8bacd14cb0182`
- Installer SHA-256: `d011d45b2542c591632eadbc98c7f4d6aaddfbad8c38718b45ba431be84d4d80`

The Installer is the recommended download for normal Windows users. The Portable ZIP is provided for no-install and classroom deployment scenarios.

## Supported Stable target line

- MangoX2 + Pico — `mangox2-pico` — Runtime `v0.2.6`
- MangoX2 + Pico W — `mangox2-picow` — Runtime `v0.2.6`
- MangoX2 + Pico 2 W — `mangox2-pico2w` — Runtime `v0.2.6`
- MangoLite + Pico W — `mangolite-picow` — Runtime `v0.6.0`
- MangoLite + Pico 2 W — `mangolite-pico2w` — Runtime `v0.6.0`

## Public release policy

- Source migration will be intentional and component-scoped.
- User-downloadable binaries are attached to component-specific GitHub Releases.
- Installer and Portable packages should come from the same validated binary tree when the engineering release supports both forms.
- Do not commit generated portable ZIP/EXE packages into this directory.
- Online user documentation is published under `docs/` and the product guide under `desktop/device-manager/guide/`.

Tag format: `device-manager-vX.Y.Z`.
