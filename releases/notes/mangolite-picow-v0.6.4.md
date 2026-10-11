# MangoLite Runtime — Pico W v0.6.4

## 中文

**正式版（Stable）**。適用於 MangoLite Runtime — Pico W。

### 主要更新

新增 Pot 與感測器 Change Callback Student API，保留 BLE Control v1 與 Motor/Drive 校正。

### 下載與 SHA-256

- `MangoLite_Runtime_v0.6.4_PicoW.uf2` — SHA-256 `480faa6a98a515ea863cdeb51a8dd111ad7313fcc3faa631333eb75cdb189779`

### 安裝方式

將對應 UF2 以 BOOTSEL 模式複製至指定 Pico 板；不同 Target 不可混用。

### 驗證範圍

- 正式版原始碼與檔案版本、SHA-256 由本機建置流程核對。
- MangoLite + Pico W: Pot/Light change + raw Logger PASS (RC4 representative hardware)
- 本次依專案負責人的決定採本機驗證作為發布依據，未以 GitHub Actions 作為封版門檻。

## English

**Stable release** for MangoLite Runtime — Pico W.

### Changes

新增 Pot 與感測器 Change Callback Student API，保留 BLE Control v1 與 Motor/Drive 校正。

### Downloads and SHA-256

- `MangoLite_Runtime_v0.6.4_PicoW.uf2` — SHA-256 `480faa6a98a515ea863cdeb51a8dd111ad7313fcc3faa631333eb75cdb189779`

### Installation

Copy the correct target UF2 to the Pico BOOTSEL USB volume. Do not interchange target images.

### Validation scope

- Exact stable output files and checksums were verified by local build tools.
- MangoLite + Pico W: Pot/Light change + raw Logger PASS (RC4 representative hardware)
- CI was explicitly waived as a release gate. This release does not claim green GitHub Actions.
