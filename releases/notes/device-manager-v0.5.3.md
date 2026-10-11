# MangoBox Device Manager v0.5.3

## 中文

**正式版（Stable）**。適用於 MangoBox Device Manager。

### 主要更新

新增 Pot 感測設定、監看與 Student API Python 範例，支援 Light / Sound / Distance / Joystick Change Callback 範例。保留原有 Motor Direction Calibration；Installer 與 Portable 由同一份建置產出。

### 下載與 SHA-256

- `MangoBox_Device_Manager_v0.5.3_Setup.exe` — SHA-256 `7a17177e724828be4c1c94dce99855e70ec501954e91765f487de775b4ca2438`
- `MangoBox_Device_Manager_v0.5.3_Portable.zip` — SHA-256 `66fb81a81bebb24017c831c63efafc388010d309a755eff6fda311959c7853eb`

### 安裝方式

Windows：一般使用者建議下載 Installer，免安裝／教室部署使用 Portable。

### 驗證範圍

- 正式版原始碼與檔案版本、SHA-256 由本機建置流程核對。
- 裝置管理器本機建置與封裝 PASS；正式安裝／啟動／解除安裝視覺 smoke 尚待確認。
- 本次依專案負責人的決定採本機驗證作為發布依據，未以 GitHub Actions 作為封版門檻。

## English

**Stable release** for MangoBox Device Manager.

### Changes

新增 Pot 感測設定、監看與 Student API Python 範例，支援 Light / Sound / Distance / Joystick Change Callback 範例。保留原有 Motor Direction Calibration；Installer 與 Portable 由同一份建置產出。

### Downloads and SHA-256

- `MangoBox_Device_Manager_v0.5.3_Setup.exe` — SHA-256 `7a17177e724828be4c1c94dce99855e70ec501954e91765f487de775b4ca2438`
- `MangoBox_Device_Manager_v0.5.3_Portable.zip` — SHA-256 `66fb81a81bebb24017c831c63efafc388010d309a755eff6fda311959c7853eb`

### Installation

Use the Windows Installer for ordinary deployment, or Portable ZIP for no-install/classroom use.

### Validation scope

- Exact stable output files and checksums were verified by local build tools.
- Windows installed-app smoke is recommended and is not yet recorded as PASS.
- CI was explicitly waived as a release gate. This release does not claim green GitHub Actions.
