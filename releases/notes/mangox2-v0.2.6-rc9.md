# MangoX2 Runtime v0.2.6-rc9

**Channel:** Release Candidate  
**Targets:** MangoX2 + Raspberry Pi Pico (RP2040), MangoX2 + Raspberry Pi Pico 2 W (RP2350)

## Release assets

The public GitHub Release should contain:

- `MangoBox_Runtime_v0.2.6-rc9_MangoX2_Pico.uf2`
- `MangoBox_Runtime_v0.2.6-rc9_MangoX2_Pico2W.uf2`
- `SHA256SUMS.txt`

## Build provenance

The validated engineering artifacts were produced by GitHub Actions from MangoBox engineering commit:

`730c92ad9e7f598737889000ad9fbb8866926812`

The engineering build record identifies both Pico / RP2040 and Pico 2 W / RP2350 targets and lists the two UF2 files as the rc9 release artifacts.

## Validation status

- CI build: PASS according to the engineering release record.
- Dual-target UF2 artifacts: present in the engineering release folder.
- Hardware validation: this release remains an RC; public notes must not imply full hardware certification beyond the hardware tests recorded in the engineering repository.

## Installation

1. Put the Raspberry Pi Pico / Pico 2 W into BOOTSEL mode.
2. Copy the UF2 matching the exact board target to the mounted RPI-RP2 drive.
3. Allow the board to reboot automatically.
4. Verify the Runtime version after reboot before classroom use.

## Important

Use the Pico UF2 only for Raspberry Pi Pico / RP2040. Use the Pico 2 W UF2 only for Raspberry Pi Pico 2 W / RP2350.
