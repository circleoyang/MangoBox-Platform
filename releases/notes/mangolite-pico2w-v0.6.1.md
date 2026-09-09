# MangoLite Runtime v0.6.1 — Pico 2 W

## 中文

MangoLite Runtime v0.6.1 正式版，適用 MangoLite + Raspberry Pi Pico 2 W。此版本主要補齊 Ultrasonic 功能整合與 capability parity，並與 Device Manager v0.5.1 的模組顯示與設定流程對齊。

### 主要更新

- 補齊 MangoLite Ultrasonic runtime / Student API / handler 整合。
- 對齊 Pico W / Pico 2 W 的 Ultrasonic capability 行為。
- 支援 Device Manager v0.5.1 在 Ultrasonic 啟用後正確顯示對應裝置頁。
- 維持既有 MangoLite Student API、IR、Motor、RGB、Input、Recovery 與執行模式相容性。

### 驗證

- 本機 Windows clean build：PASS
- UF2 內嵌 Runtime version 驗證：PASS
- MangoLite + Pico 2 W 實機 smoke：PASS
- Device Manager v0.5.1 連線 / config / Ultrasonic GP17 / GP18 / 即時讀值 smoke：PASS

### 下載與 SHA-256

- `MangoLite_Runtime_v0.6.1_Pico2W.uf2`
  - SHA-256: `bc4eaeb6b702be8584e4afc5b31511f0de0082e6208e7b9b59f7cae6c366ba55`

更新韌體前，請先備份需要保留的學生程式與設定，並使用 Hardware Lab 選擇正確的 MangoLite + Pico 2 W target 後再燒錄。

## English

Stable MangoLite Runtime v0.6.1 for MangoLite + Raspberry Pi Pico 2 W. This maintenance release completes Ultrasonic runtime integration and capability parity, and aligns the firmware behavior with Device Manager v0.5.1.

### Highlights

- Completes MangoLite Ultrasonic runtime / Student API / handler integration.
- Aligns Ultrasonic capability behavior across Pico W and Pico 2 W targets.
- Supports correct Ultrasonic device-page visibility in Device Manager v0.5.1 after the module is enabled.
- Preserves existing MangoLite Student API, IR, Motor, RGB, Input, Recovery, and execution-mode compatibility.

### Validation

- Local Windows clean build: PASS
- Embedded UF2 Runtime-version validation: PASS
- MangoLite + Pico 2 W hardware smoke: PASS
- Device Manager v0.5.1 connection / config / Ultrasonic GP17 / GP18 / live-reading smoke: PASS

### Download and SHA-256

- `MangoLite_Runtime_v0.6.1_Pico2W.uf2`
  - SHA-256: `bc4eaeb6b702be8584e4afc5b31511f0de0082e6208e7b9b59f7cae6c366ba55`

Back up student files and settings before updating, and use Hardware Lab with the matching MangoLite + Pico 2 W target when flashing.
