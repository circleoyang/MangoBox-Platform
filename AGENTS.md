# MangoBox Platform — Collaboration Rules

These rules apply to human contributors and AI coding agents.

## Branch and review discipline

1. Do not edit `main` directly for normal development work.
2. One task = one branch / one focused PR.
3. Do not change unrelated files.
4. Prefer squash merge for focused feature/documentation PRs unless history needs to be preserved.

## Public API and compatibility

5. Preserve public Student API behavior unless an explicit change is approved.
6. Target, programming mode and software version are part of the documentation contract.
7. A configuration key does not prove that an API is implemented.
8. A disabled optional module does not mean that its API does not exist.
9. Host Python and High Level MicroPython documentation must remain mode-specific when execution behavior differs.

## Hardware truthfulness

10. Never claim hardware PASS unless the relevant behavior was tested on representative physical hardware.
11. CI/code review PASS and hardware PASS are separate states.
12. Firmware changes that alter hardware behavior require an explicit hardware-validation record before final release.

## Documentation

13. Behavior changes must update related documentation in the same workstream when practical.
14. Traditional-Chinese learner documentation targets junior-high-school readability or above.
15. Preserve established technical terms when forced translation harms meaning, e.g. GPIO（General-Purpose Input/Output，通用輸入輸出）, Pin（腳位）, Runtime（執行環境）, callback（回呼函式）, event loop（事件迴圈）, firmware（韌體）.
16. Keep learner Guide, Troubleshooting and engineering API Reference conceptually separate.
17. Never publish an API for a target/mode/version profile that does not have a complete learner path.

## Release artifacts

18. Do not commit generated UF2, EXE or large portable ZIP release packages into normal source history.
19. Publish user-downloadable binaries through GitHub Releases with component-specific tags.
20. Keep release notes, compatibility metadata and checksums with releases where appropriate.

## Security and privacy

21. Never commit secrets, credentials, private keys, tokens, student data, identifiable classroom logs or private research datasets.
22. Public repository content must be reviewed for private/internal-only material before migration from the engineering repo.

## Brand assets

23. Do not redraw, recolor, crop, auto-trace or regenerate approved MangoBox brand assets unless an explicit design task requests it.
24. UI surfaces should reference canonical brand assets rather than create duplicate visual variants.

## Current migration rule

25. `circleoyang/MangoBox` remains the active private engineering source during the transition.
26. Move components into this public repository intentionally, one component at a time, with a migration note and ownership decision.
27. Until migration is completed, public-site/documentation publication must not silently replace the private implementation source of truth.
