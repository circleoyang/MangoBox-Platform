# MangoThonny v0.4.0

MangoThonny `v0.4.0` 是 MangoBox 教學用 Python / Physical Computing IDE 的首個 Stable Release baseline。

## 主要內容

- 以 Thonny Portable 為基礎的 MangoBox 教學環境。
- 內建 MangoBox Host Student API 與 canonical `mangobox` import。
- 保留 legacy `mangox2` import 相容性。
- HostPython 教學範例 01–20 與多媒體 / AI assets。
- Standard Teaching Packages v1。
- Mango App Exporter，可將桌面 Python 專案打包為 Windows 執行程式。
- MangoThonny 原生 Launcher、MangoBox ICON、繁體中文 Windows Installer。
- 支援 MangoX2 + Pico / Pico W / Pico 2 W，以及 MangoLite + Pico W / Pico 2 W。
- Pico W 為正式 target identity，不另開 Student API 分支。

## Installer writable-path isolation

正式版在封版驗證時修正 installed-mode writable-path isolation。安裝版將可寫入資料分離到：

- `%LOCALAPPDATA%\MangoBox\MangoThonny\user_data`
- `%LOCALAPPDATA%\MangoBox\MangoThonny\workspace`
- `%LOCALAPPDATA%\MangoBox\MangoThonny\cache`

因此正常執行、Exporter、Python bytecode 與 mypy cache 不再污染安裝目錄；解除安裝時可完整移除應用程式，同時依使用者選擇保留學習資料。

## 驗證狀態

Stable promotion 前已完成：

- Portable Build + Package Verification PASS
- GUI / native launcher PASS
- Host → Pico → Host PASS
- MangoX2 + Pico W target identity PASS
- Pico W Host LED 實機 sanity PASS
- Windows Installer build PASS
- 繁體中文 Installer PASS
- Start Menu / Desktop shortcut PASS
- installed writable-path isolation PASS
- preserve-data uninstall PASS
- reinstall / delete-settings uninstall PASS

目前 release-branch GitHub Actions 因 runner 額度未配置而記錄為 `CI NOT RUN / BLOCKED`；較早的 code-bearing Pico W parity baseline 已通過 MangoThonny Package Contract 與 Unified Student API CI。最終成品驗證由 Windows 本機完成。

## 正式檔案

### Portable

`MangoThonny-Portable-v0.4.0.zip`

SHA-256:

`24936c64a4b6b87ffe2969e4f7570227da4bfe89d313ab44ba44f05e4002ae16`

### Windows Installer

`MangoThonny-Setup-v0.4.0.exe`

SHA-256:

`01d4e994961220259c2ab593df6a043dc5a58a61e10868a746eac4820bc87c80`

## 建議使用方式

一般教學電腦建議使用 Windows Installer；需要免安裝或隨身環境時使用 Portable ZIP。
