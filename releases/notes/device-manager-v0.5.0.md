# MangoBox Device Manager v0.5.0

MangoBox Device Manager `v0.5.0` is the first Stable release of the current v0.5 desktop device-management line.

## Scope

Device Manager is the routine MangoBox configuration and diagnostics tool for:

- MangoX2 / MangoLite device detection and Runtime identity;
- Pico, Pico W and Pico 2 W target alignment;
- Runtime UART and MicroUSB / Pico connection modes;
- module enable/disable and GPIO / Pin configuration;
- config read/update/replace/restore workflows;
- supported calibration and live monitoring;
- Student API preview / Runtime JSON preview;
- live Traditional Chinese / English UI switching.

Firmware flashing, Clean Flash, Factory Reset-assisted deployment, Recovery / Deep Rescue and full firmware lifecycle diagnostics remain the responsibility of MangoBox Hardware Lab.

## Supported Stable target line

- MangoX2 + Pico — `mangox2-pico` — Runtime `v0.2.6`
- MangoX2 + Pico W — `mangox2-picow` — Runtime `v0.2.6`
- MangoX2 + Pico 2 W — `mangox2-pico2w` — Runtime `v0.2.6`
- MangoLite + Pico W — `mangolite-picow` — Runtime `v0.6.0`
- MangoLite + Pico 2 W — `mangolite-pico2w` — Runtime `v0.6.0`

## Stable validation

The Stable release is a release-promotion of the validated `v0.5.0-rc8` functional baseline. No new Device Manager functional path was introduced solely for the Stable version bump.

Final Stable release gates completed on Windows:

- local source / contract suite: `88 passed`;
- live i18n / font visibility / Runtime UART restore suite: `5 passed`;
- Stable Qt title smoke: PASS;
- Portable package build: PASS;
- Traditional-Chinese Windows Installer build: PASS;
- Installer launch, Start Menu shortcut, desktop shortcut, icon, About/version, zh → en → zh switching and uninstall: PASS;
- Portable launch: PASS;
- five-target identity + `system/info` + `config/get` sanity: PASS;
- representative MangoX2 + Pico W Runtime UART / MicroUSB / RGB smoke: PASS;
- representative MangoLite + Pico W Runtime UART / RGB / onboard IR / config smoke: PASS.

GitHub Actions attempts during the Stable promotion could not allocate a runner and executed no steps; this was recorded as CI NOT RUN / BLOCKED rather than a source-test failure. The equivalent local source gates above passed.

## Windows packages

- `MangoBox_Device_Manager_v0.5.0_Setup.exe` — recommended
- `MangoBox_Device_Manager_v0.5.0_Portable.zip`

SHA-256:

- Portable: `5619ceabcf2f5393df54898c5b2443a4927c70bae541bfd331d8bacd14cb0182`
- Installer: `d011d45b2542c591632eadbc98c7f4d6aaddfbad8c38718b45ba431be84d4d80`

Both artifacts are generated from the same PyInstaller onedir tree. The Installer is per-user, Traditional Chinese only, and uses the canonical MangoBox Device Manager application icon.

## Notes

The existing rc7 / rc8 hardware-validation evidence remains the provenance for unchanged module behavior. The Stable release adds final exact-artifact and five-target promotion checks; it does not retroactively relabel unexecuted hardware tests as newly passed.
