# Nine-firmware OLED16 AI Context Builder

Developer: 歐陽芳泉

## Source and scope

Release `firmware-oled16-20261116`, source `353cc577c8d96e6d9fb945c60ed4f987823f3642`.
MangoX2 0.2.11, MangoLite 0.6.6, BarePico 0.1.1; each has Pico, Pico W and Pico 2 W.
The public entry is unchanged: `docs/student-guide/site/ai-context-builder.html`.

This updates the existing full bilingual firmware pack and adds MangoLite + Pico.
The existing historical High-Level MicroPython and Host Python modes remain separate and unchanged. This does not claim that the old Host mode is current or install the new Host incremental package.

## OLED contract

- Saved `.mbanim` files contain 1–16 frames; `.mbimg` has one frame.
- Existing manual RAM APIs still have four slots, numbered 0–3. Never infer 16 manual slots.
- `oled_play_media(name, duration=0)` and `oled_play_sequence(names, repeat=False, cycles=1)` retain their public signatures.
- Sequence preloading is bounded to 32768 bytes and has low-memory fallback. No promise of unconditional preloading or zero latency.
- File CRC32 v2, 128×64 MONO_VLSB, 1024 bytes/frame and 100–10000 ms file periods are preserved.
- Host UART long operations need the separate PR #172 waiting fix; ordinary calls and retry behavior must not be widened.

The default pack now uses schema 2, source-locked release metadata, exact nine-target membership, family/version/MCU/wireless validation and `RELEASED_PARTIAL_HARDWARE`. It fails closed on inconsistent metadata. The retired TEST_ONLY pack remains in Git history rather than being relabeled as hardware acceptance.

The complete multimodal v13.2 example remains intact with its historical provenance and limitations. Its original source and endurance status are not promoted by this documentation update. Source line numbers that no longer match the release are not presented as current.

## Verification

- Shared browser/Node renderer: 120 historical combinations.
- Current renderer: 18 target/language combinations and 12 invalid-input gates.
- Real OLED16 documentation assertions: 18 exports with limits and provenance.
- Offline controller: 36 fixture/real exports, byte parity for preview/download/copy/print, historical Host gates, malformed/missing-pack fail-closed and stale asynchronous fetch protection.
- Repository documentation coverage, search and reference-completeness checks.
- Real-browser and PDF acceptance must use the existing GitHub Actions workflow before publication. Offline DOM checks are not browser/PDF acceptance.

Published release evidence covers hardware testing for MangoLite + Pico W and MangoX2 + Pico only. The other seven combinations are not hardware-accepted. No new firmware build, flash, GPIO operation or production database write is performed by this work.
