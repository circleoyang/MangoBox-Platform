# MangoBox Platform

MangoBox AI 精準教學平台的公開產品入口與發布 repository。

This repository is the public product surface for the MangoBox AI precision-teaching platform.

## What belongs here

- Official website and product introduction
- Online Documentation (`zh-TW` / `en`)
- Device Manager public source / release information
- Hardware Lab public source / release information
- MangoX2 and MangoLite firmware release information
- Runtime / Host / Gateway public components when intentionally migrated
- Examples and public schemas

## Repository structure

```text
MangoBox-Platform/
├─ index.html                  # public platform landing page
├─ assets/brand/               # approved, locked brand assets
├─ docs/                       # online documentation
├─ desktop/
│  ├─ device-manager/
│  └─ hardware-lab/
├─ firmware/
│  ├─ mangox2/
│  └─ mangolite/
├─ runtime/                    # reserved for intentional public migration
├─ host/                       # reserved for intentional public migration
├─ gateway/                    # reserved for intentional public migration
├─ examples/
└─ releases/                   # release policy / indexes; binaries live in GitHub Releases
```

## Development and publication workflow

The existing private `circleoyang/MangoBox` repository remains the active engineering source while migration is performed component-by-component.

For now:

1. Runtime, firmware and desktop-tool changes are developed and validated in the private engineering repo.
2. Student documentation is authored and reviewed with the implementation there.
3. Approved public documentation is published here.
4. Release binaries such as UF2 and portable ZIP files belong in **GitHub Releases**, not in Git history.
5. Components move into this public monorepo only through an explicit migration task; do not copy whole development trees casually.

The long-term goal is to reduce duplicate maintenance while keeping hardware validation and public releases controlled.

## Documentation

The first public Online Documentation release is under [`docs/student-guide/site/`](docs/student-guide/site/).

It resolves documentation by:

`Language → Hardware → Programming Mode → Software Version → Module → Guide / Troubleshooting / API Reference`

Supported languages:

- 繁體中文 (`zh-TW`)
- English (`en`)

## Release policy

Do not commit generated UF2/ZIP/EXE release packages into normal source directories. Use component-specific Git tags and GitHub Releases, for example:

- `mangox2-vX.Y.Z`
- `mangolite-vX.Y.Z`
- `device-manager-vX.Y.Z`
- `hardware-lab-vX.Y.Z`
- `gateway-vX.Y.Z`

## Brand assets

Approved MangoBox brand files are copied from the locked design source without visual modification. See `assets/brand/README.md`.
