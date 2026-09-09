# MangoLite Runtime v0.6.1 — Pico W

## 中文

MangoLite Runtime v0.6.1 正式版，適用 MangoLite + Raspberry Pi Pico W。此版本主要補齊 Ultrasonic 功能整合與 capability parity，並與 Device Manager v0.5.1 的模組顯示與設定流程對齊。

### 主要更新

- 補齊 MangoLite Ultrasonic runtime / Student API / handler 整合。
- 對齊 Pico W / Pico 2 W 的 Ultrasonic capability 行為。
- 支援 Device Manager v0.5.1 在 Ultrasonic 啟用後正確顯示對應裝置頁。
- 維持既有 MangoLite Student API、IR、Motor、RGB、Input、Recovery 與執行模式相容性。

### 驗證

- 本機 Windows clean build：PASS
- UF2 內嵌 Runtime version 驗證：PASS
- MangoLite + Pico W 實機 smoke：PASS
- Device Manager v0.5.1 連線 / config / Ultrasonic GP17 / GP18 / 即時讀值 smoke：PASS

### 下載與 SHA-256

- `MangoLite_Runtime_v0.6.1_PicoW.uf2`
  - SHA-256: `9ad5ff6ad1c661d605448a3c9a210e64643cc1adca7df467932c3fe2dd164b43`

更新韌體前，請先備份需要保留的學生程式與設定，並使用 Hardware Lab 選擇正確的 MangoLite + Pico W target 後再燒錄。

## English

Stable MangoLite Runtime v0.6.1 for MangoLite + Raspberry Pi Pico W. This maintenance release completes Ultrasonic runtime integration and capability parity, and aligns the firmware behavior with Device Manager v0.5.1.

### Highlights

- Completes MangoLite Ultrasonic runtime / Student API / handler integration.
- Aligns Ultrasonic capability behavior across Pico W and Pico 2 W targets.
- Supports correct Ultrasonic device-page visibility in Device Manager v0.5.1 after the module is enabled.
- Preserves existing MangoLite Student API, IR, Motor, RGB, Input, Recovery, and execution-mode compatibility.

### Validation

- Local Windows clean build: PASS
- Embedded UF2 Runtime-version validation: PASS
- MangoLite + Pico W hardware smoke: PASS
- Device Manager v0.5.1 connection / config / Ultrasonic GP17 / GP18 / live-reading smoke: PASS

### Download and SHA-256

- `MangoLite_Runtime_v0.6.1_PicoW.uf2`
  - SHA-256: `9ad5ff6ad1c661d605448a3c9a210e64643cc1adca7df467932c3fe2dd164b43`

Back up student files and settings before updating, and use Hardware Lab with the matching MangoLite + Pico W target when flashing.
