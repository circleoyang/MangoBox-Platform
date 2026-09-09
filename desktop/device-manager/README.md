# MangoBox Device Manager

Public product/release area for MangoBox Device Manager.

Current engineering source remains in the private MangoBox repository during migration.

## Current public release

- Device Manager: `v0.5.1`
- Tag: `device-manager-v0.5.1`
- Windows Installer: `MangoBox_Device_Manager_v0.5.1_Setup.exe`
- Windows Portable: `MangoBox_Device_Manager_v0.5.1_Portable.zip`
- Release status: Stable
- Portable SHA-256: `df40a9602546a655e69b3416b56738fa3a69807ccda4b58e731bb4f62b32ab9e`
- Installer SHA-256: `70b45ea75fc0f5e8d4f206fc54bddc79ee450b4fbb2e22b420be5d1bd1fd9484`

The Installer is the recommended download for normal Windows users. The Portable ZIP is provided for no-install and classroom deployment scenarios.

## v0.5.1 maintenance scope

- Fixes MangoLite Ultrasonic navigation visibility after the module is enabled in Pin Configuration.
- Aligns MangoLite + Pico W / Pico 2 W Ultrasonic capability parity.
- Consolidates capability/navigation ownership around the canonical resolver path.
- Aligns MangoX2 / MangoLite OLED as preinstalled/configurable modules whose hardware pages follow enable/disable state.
- Adds stable Windows AppUserModelID `MangoBox.DeviceManager` behavior for taskbar icon persistence.
- Exact Installer/Portable artifacts and representative hardware smoke were validated before publication.

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
