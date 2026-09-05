# MangoBox Device Manager v0.5.0-rc8

## 中文

MangoBox Device Manager v0.5.0-rc8 是目前建議使用的 Windows Release Candidate。此版本在既有 MangoX2 / MangoLite 裝置管理能力上，加入 Pico W target 對齊、即時中英文切換、ADC 腳位絲印標示，以及更乾淨的 Runtime UART 恢復流程，並正式提供 Installer 與 Portable 兩種 Windows 發布形式。

### 支援平台與裝置

- Windows 64-bit
- MangoX2 + Raspberry Pi Pico
- MangoX2 + Raspberry Pi Pico 2 W
- MangoX2 + Raspberry Pi Pico W
- MangoLite + Raspberry Pi Pico 2 W
- MangoLite + Raspberry Pi Pico W

### 下載檔案

**一般使用者建議：Installer**

- `MangoBox_Device_Manager_v0.5.0-rc8_Setup.exe`
- 全繁體中文安裝／解除安裝介面
- 安裝後建立開始選單捷徑，可選桌面捷徑

**免安裝：Portable**

- `MangoBox_Device_Manager_v0.5.0-rc8_Portable.zip`
- 解壓後直接執行 `MangoBox_Device_Manager_v0.5.0-rc8.exe`

兩個下載檔皆附獨立 SHA-256 檢查檔。

### 主要更新

- 支援辨識 `mangox2-picow` 與 `mangolite-picow`，沿用既有 MangoX2 / MangoLite family capability semantics，不另外複製一套功能。
- 中文／English 可在目前頁面即時切換，不需重建視窗或重新連線。
- GPIO 顯示對齊板上絲印：`GP26 (AD0)`、`GP27 (AD1)`、`GP28 (AD2)`。
- OLED「目前學生自訂字庫」管理區塊僅在 `MicroUSB / Pico` 模式顯示；Runtime UART 仍保留既有字模分析／寫入能力。
- MangoX2 從 `MicroUSB / Pico` 回到 `Runtime UART` 時，改為單次 boot grace / auto-connect round，避免重複送出多次 `system/info` 與 `config/get`。
- Installer 與 Portable 由同一份 PyInstaller onedir binary tree 產生，避免兩種發布形式內容不一致。
- Installer、安裝後程式、開始選單、桌面捷徑與 Windows Installed Apps 使用 MangoBox Device Manager 官方 App ICON。

### 驗證

- Device Manager source / contract / Qt startup CI：PASS
- Live i18n / transition CI：PASS
- MangoLite + Pico W target / config identity：實機 PASS
- MangoX2 + Pico W target / config identity：實機 PASS
- Windows Installer：建置、繁中安裝、啟動、捷徑、解除安裝 PASS
- Windows Portable：解壓、直接啟動 PASS

既有硬體功能路徑沿用 v0.5.0-rc7 已完成的驗證；rc8 未把未重測項目重新標示成新的硬體 PASS。

### 安裝方式

**Installer**

1. 下載 `MangoBox_Device_Manager_v0.5.0-rc8_Setup.exe`。
2. 執行安裝程式並依繁體中文精靈完成安裝。
3. 從開始選單或桌面捷徑啟動 MangoBox Device Manager。

**Portable**

1. 下載 `MangoBox_Device_Manager_v0.5.0-rc8_Portable.zip`。
2. 完整解壓縮到一般資料夾。
3. 執行 `MangoBox_Device_Manager_v0.5.0-rc8.exe`。

若 Windows SmartScreen 第一次執行時出現提示，請先確認檔案來自 MangoBox 官方 GitHub Release，再依 Windows 提示選擇是否執行。

### 版本狀態

**Release Candidate (RC)**。建議目前開發、測試與教學環境使用，尚未標示為 Stable。

---

## English

MangoBox Device Manager v0.5.0-rc8 is the current recommended Windows Release Candidate. It adds Pico W target parity, live Traditional Chinese / English switching, ADC silkscreen aliases, a cleaner Runtime UART restoration flow, and official Installer + Portable Windows packages while preserving the existing MangoX2 / MangoLite management model.

### Supported platforms and targets

- Windows 64-bit
- MangoX2 + Raspberry Pi Pico
- MangoX2 + Raspberry Pi Pico 2 W
- MangoX2 + Raspberry Pi Pico W
- MangoLite + Raspberry Pi Pico 2 W
- MangoLite + Raspberry Pi Pico W

### Downloads

**Recommended for most users: Installer**

- `MangoBox_Device_Manager_v0.5.0-rc8_Setup.exe`
- Traditional-Chinese-only setup and uninstall UI
- Start Menu shortcut and optional desktop shortcut

**No-install option: Portable**

- `MangoBox_Device_Manager_v0.5.0-rc8_Portable.zip`
- Extract and run `MangoBox_Device_Manager_v0.5.0-rc8.exe`

Separate SHA-256 checksum files are provided for both packages.

### Highlights

- Recognizes `mangox2-picow` and `mangolite-picow` through the existing MangoX2 / MangoLite family capability semantics.
- Live Traditional Chinese / English switching without rebuilding the current page or reconnecting the device.
- ADC GPIO labels match the board silkscreen: `GP26 (AD0)`, `GP27 (AD1)`, `GP28 (AD2)`.
- The persistent custom-font-cache management block is shown only in `MicroUSB / Pico`; Runtime UART retains the existing glyph analysis/upload path.
- MangoX2 `MicroUSB / Pico -> Runtime UART` restoration now uses one boot-grace / auto-connect round and avoids repeated `system/info` / `config/get` bursts.
- Installer and Portable packages are produced from the same PyInstaller onedir binary tree.
- Setup, installed app, Start Menu, desktop shortcut and Windows Installed Apps use the canonical MangoBox Device Manager App ICON.

### Validation

- Device Manager source / contract / Qt startup CI: PASS
- Live i18n / transition CI: PASS
- MangoLite + Pico W target / config identity: physical-device PASS
- MangoX2 + Pico W target / config identity: physical-device PASS
- Windows Installer build / localized install / launch / shortcuts / uninstall: PASS
- Windows Portable extraction / direct launch: PASS

Existing hardware-functional paths retain the previously recorded v0.5.0-rc7 validation baseline; rc8 does not relabel unchanged, un-retested paths as a new hardware PASS.

### Installation

**Installer**

1. Download `MangoBox_Device_Manager_v0.5.0-rc8_Setup.exe`.
2. Run the setup wizard and complete the installation.
3. Launch MangoBox Device Manager from the Start Menu or desktop shortcut.

**Portable**

1. Download `MangoBox_Device_Manager_v0.5.0-rc8_Portable.zip`.
2. Extract the ZIP to a normal folder.
3. Run `MangoBox_Device_Manager_v0.5.0-rc8.exe`.

If Windows SmartScreen appears on first launch, first verify that the file came from the official MangoBox GitHub Release before choosing whether to run it.

### Release status

**Release Candidate (RC)**. Recommended for current development, testing, and classroom use; it has not yet been designated Stable.
