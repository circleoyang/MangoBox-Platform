# MangoLite Runtime v0.6.0-rc22

**Channel:** Release Candidate  
**Target:** MangoLite + Raspberry Pi Pico 2 W (RP2350)

## Release assets

The public GitHub Release should contain:

- `MangoLite_Runtime_v0.6.0-rc22_Pico2W.uf2`
- `SHA256SUMS.txt`

## Build provenance

The validated engineering UF2 was produced by GitHub Actions from MangoBox engineering commit:

`9b1e189818b28ad04c7b76468321211c160c1b9a`

The engineering build record identifies the UF2 path as:

`runtime/mangolite-pico2w/releases/v0.6.0-rc22/MangoLite_Runtime_v0.6.0-rc22_Pico2W.uf2`

## Validation status

- CI-built UF2: present in the engineering release folder.
- Runtime version: v0.6.0-rc22.
- Hardware validation: this release remains an RC; public notes should only claim hardware behaviors that have explicit engineering validation records.

## Installation

1. Put the Raspberry Pi Pico 2 W into BOOTSEL mode.
2. Copy `MangoLite_Runtime_v0.6.0-rc22_Pico2W.uf2` to the mounted RPI-RP2 drive.
3. Allow the board to reboot automatically.
4. Verify the Runtime version after reboot before classroom use.

## Important

This build is for MangoLite with Raspberry Pi Pico 2 W / RP2350. Do not use it for MangoX2 or Raspberry Pi Pico / RP2040.
