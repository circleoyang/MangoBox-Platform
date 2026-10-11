# MangoX2 Runtime — Pico W v0.2.9

## 中文

**正式版（Stable）**。適用於 MangoX2 Runtime — Pico W。

### 主要更新

新增 Pot 與感測器 Change Callback Student API，保留既有 Motor/Drive 功能。

### 下載與 SHA-256

- `MangoBox_Runtime_v0.2.9_MangoX2_PicoW.uf2` — SHA-256 `ee21000a4b32cc1ef6657ec629cfaa6925813d9247adc0d1dedede0eb00e9949`

### 安裝方式

將對應 UF2 以 BOOTSEL 模式複製至指定 Pico 板；不同 Target 不可混用。

### 驗證範圍

- 正式版原始碼與檔案版本、SHA-256 由本機建置流程核對。
- Target-specific full hardware regression not performed; family representative hardware tests completed
- 本次依專案負責人的決定採本機驗證作為發布依據，未以 GitHub Actions 作為封版門檻。

## English

**Stable release** for MangoX2 Runtime — Pico W.

### Changes

新增 Pot 與感測器 Change Callback Student API，保留既有 Motor/Drive 功能。

### Downloads and SHA-256

- `MangoBox_Runtime_v0.2.9_MangoX2_PicoW.uf2` — SHA-256 `ee21000a4b32cc1ef6657ec629cfaa6925813d9247adc0d1dedede0eb00e9949`

### Installation

Copy the correct target UF2 to the Pico BOOTSEL USB volume. Do not interchange target images.

### Validation scope

- Exact stable output files and checksums were verified by local build tools.
- Target-specific full hardware regression not performed; family representative hardware tests completed
- CI was explicitly waived as a release gate. This release does not claim green GitHub Actions.
