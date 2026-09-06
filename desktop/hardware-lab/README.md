# MangoBox Hardware Lab

Public product/release area for MangoBox Hardware Lab.

Current Hardware Lab scope centers on firmware and device lifecycle: target identification, firmware update, Clean Flash, Factory Reset-assisted deployment, maintenance gestures, execution-mode management, transport management and diagnostic reporting.

General GPIO/ADC/Sensor production testing is not advertised until an implemented, versioned Hardware Lab release provides it.

## Public release policy

- Source migration will be intentional and component-scoped.
- Portable packages belong in GitHub Releases.
- Do not commit generated ZIP/EXE packages into this directory.

Planned tag format: `hardware-lab-vX.Y.Z`.

## v0.3.0

Windows 64-bit Installer and Portable; five targets; one-UF2 Teacher Profile deployment. Profile v1 remains the default; Profile v2 remains opt-in experimental.

[Downloads](../../releases/) · [Installation and usage](guide/)
