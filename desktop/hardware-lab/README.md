# MangoBox Hardware Lab

Public product/release area for MangoBox Hardware Lab.

Current Hardware Lab scope centers on firmware and device lifecycle: target identification, firmware update, Clean Flash, Factory Reset-assisted deployment, maintenance gestures, execution-mode management, transport management and diagnostic reporting.

General GPIO/ADC/Sensor production testing is not advertised until an implemented, versioned Hardware Lab release provides it.

## Current public release

- Hardware Lab: `v0.3.1`
- Tag: `hardware-lab-v0.3.1`
- Windows Installer: `MangoBox_Hardware_Lab_v0.3.1_Setup.exe`
- Windows Portable: `MangoBox_Hardware_Lab_v0.3.1_Portable.zip`
- Release status: Stable

Hardware Lab desktop `v0.3.1` keeps the accepted v0.3.0 deployment semantics. The current five-target Runtime bundle baseline is:

- MangoX2 + Pico — Runtime `v0.2.8`
- MangoX2 + Pico W — Runtime `v0.2.8`
- MangoX2 + Pico 2 W — Runtime `v0.2.8`
- MangoLite + Pico W — Runtime `v0.6.3`
- MangoLite + Pico 2 W — Runtime `v0.6.3`

The Hardware Lab desktop version is intentionally independent from Runtime family versions. Advancing Runtime artifacts does not require a Hardware Lab desktop version bump when target IDs, transports and deployment contracts remain unchanged.

## Public release policy

- Source migration will be intentional and component-scoped.
- Portable packages belong in GitHub Releases.
- Do not commit generated ZIP/EXE packages into this directory.

Tag format: `hardware-lab-vX.Y.Z`.

[Downloads](../../releases/) · [Installation and usage](guide/)
