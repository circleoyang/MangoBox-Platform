# MangoLite Runtime — Pico 2 W v0.6.4

## 中文

**正式版（Stable）**。適用於 MangoLite Runtime — Pico 2 W。

### 主要更新

新增 Pot 與感測器 Change Callback Student API，保留 BLE Control v1 與 Motor/Drive 校正。

### 下載與 SHA-256

- `MangoLite_Runtime_v0.6.4_Pico2W.uf2` — SHA-256 `92cfe6bf077adb7e181275446d0e12771d71c3f6159e67e3afc1e0a8d0ae4ede`

### 安裝方式

將對應 UF2 以 BOOTSEL 模式複製至指定 Pico 板；不同 Target 不可混用。

### 驗證範圍

- 正式版原始碼與檔案版本、SHA-256 由本機建置流程核對。
- Target-specific full hardware regression not performed; family representative hardware tests completed
- 本次依專案負責人的決定採本機驗證作為發布依據，未以 GitHub Actions 作為封版門檻。

## English

**Stable release** for MangoLite Runtime — Pico 2 W.

### Changes

新增 Pot 與感測器 Change Callback Student API，保留 BLE Control v1 與 Motor/Drive 校正。

### Downloads and SHA-256

- `MangoLite_Runtime_v0.6.4_Pico2W.uf2` — SHA-256 `92cfe6bf077adb7e181275446d0e12771d71c3f6159e67e3afc1e0a8d0ae4ede`

### Installation

Copy the correct target UF2 to the Pico BOOTSEL USB volume. Do not interchange target images.

### Validation scope

- Exact stable output files and checksums were verified by local build tools.
- Target-specific full hardware regression not performed; family representative hardware tests completed
- CI was explicitly waived as a release gate. This release does not claim green GitHub Actions.
