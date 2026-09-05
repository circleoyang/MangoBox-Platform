# MangoBox Device Manager

Public product/release area for MangoBox Device Manager.

Current engineering source remains in the private MangoBox repository during migration.

## Current public release

- Device Manager: `v0.5.0-rc8`
- Tag: `device-manager-v0.5.0-rc8`
- Windows Installer: `MangoBox_Device_Manager_v0.5.0-rc8_Setup.exe`
- Windows Portable: `MangoBox_Device_Manager_v0.5.0-rc8_Portable.zip`
- Release status: Release Candidate (pre-release)

The Installer is the recommended download for normal Windows users. The Portable ZIP is provided for no-install and classroom deployment scenarios.

## Public release policy

- Source migration will be intentional and component-scoped.
- User-downloadable binaries are attached to component-specific GitHub Releases.
- Installer and Portable packages should come from the same validated binary tree when the engineering release supports both forms.
- Do not commit generated portable ZIP/EXE packages into this directory.
- Online user documentation is published under `docs/` and the product guide under `desktop/device-manager/guide/`.

Tag format: `device-manager-vX.Y.Z`.
