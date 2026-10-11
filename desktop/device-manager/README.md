# MangoBox Device Manager

Public product and release information. Current engineering source remains in the private MangoBox repository pending intentional migration.

## Current public stable release

- Version: `v0.5.3`
- Release: https://github.com/circleoyang/MangoBox-Platform/releases/tag/device-manager-v0.5.3
- Installer: `MangoBox_Device_Manager_v0.5.3_Setup.exe` — SHA-256 `7a17177e724828be4c1c94dce99855e70ec501954e91765f487de775b4ca2438`
- Portable: `MangoBox_Device_Manager_v0.5.3_Portable.zip` — SHA-256 `66fb81a81bebb24017c831c63efafc388010d309a755eff6fda311959c7853eb`
- Both packages were built from the same PyInstaller onedir tree.

## v0.5.3 scope

- Pot module configuration, monitoring and Student API Python examples.
- Light / Sound / Ultrasonic Distance / Joystick Change Callback examples and sampling-period constraints.
- Retains Motor Direction Calibration, GPIO settings, calibration and prior capability/navigation support.

## Supported Runtime targets

- MangoX2 + Pico / Pico W / Pico 2 W: `v0.2.9`
- MangoLite + Pico W / Pico 2 W: `v0.6.4`

## Verification scope

- Local offline verification and exact stable Installer/Portable build/hash checks completed.
- Representative RC4 Pot/Light hardware+Logger acceptance was performed with MangoX2 + Pico and MangoLite + Pico W.
- GitHub Actions explicitly were not a release gate; do not claim CI-green.
- Windows installed v0.5.3 launch/upgrade/uninstall smoke remains recommended.
- Other target/sensor combinations have not all been individually hardware-validated.

## Previous version

- Device Manager v0.5.2 remains available: https://github.com/circleoyang/MangoBox-Platform/releases/tag/device-manager-v0.5.2

## Publication policy

- Downloadable EXE/ZIP binaries are attached to component-specific public GitHub Releases.
- Keep public documentation and binaries separate from private engineering implementation.
- Never commit generated EXE/ZIP/UF2 artifacts to the website repository.
