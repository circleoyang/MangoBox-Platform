# MangoBox Device Manager v0.5.2

## 中文

Device Manager v0.5.2 是五個正式 Runtime target 的 Motor Direction Calibration 正式版，支援 MangoX2 + Pico / Pico W / Pico 2 W，以及 MangoLite + Pico W / Pico 2 W。

### 主要更新

- 新增跨板 Motor Direction Calibration。
- 支援 `drive.left_motor`、`drive.right_motor`、`drive.left_inverted`、`drive.right_inverted`。
- 可校正左右馬達通道交換與單側車輪反向，不需要修改學生程式。
- Drive 設定儲存後可在下一個 Drive command 直接套用，不需重新開機。
- 延續 MangoLite Line Tracking / Obstacle capability parity 與既有五 target 管理功能。

### 驗證

- Device Manager full regression：213 PASS。
- Stable Portable / Installer build：PASS。
- Windows stable visual smoke：PASS。
- 代表性 MangoX2 Motor Direction Calibration 實機 smoke：PASS。

### Windows 下載與 SHA-256

- `MangoBox_Device_Manager_v0.5.2_Setup.exe`
  - SHA-256: `7c6373914dee3efe192e434d00fcb91686b89c159496f6943e4296f90a88aabb`
- `MangoBox_Device_Manager_v0.5.2_Portable.zip`
  - SHA-256: `e4b435b88ee2fa55720c537c329a1d09b128387e722fe21f92e2415ecaa529da`

Installer 與 Portable 來自同一份已驗證的 PyInstaller binary tree。

## English

Device Manager v0.5.2 is the stable five-target Motor Direction Calibration release for MangoX2 + Pico / Pico W / Pico 2 W and MangoLite + Pico W / Pico 2 W.

### Highlights

- Adds cross-board Motor Direction Calibration.
- Supports logical wheel mapping and independent per-wheel inversion through `drive.left_motor`, `drive.right_motor`, `drive.left_inverted`, and `drive.right_inverted`.
- Corrects swapped motor channels or reversed wheel installation without changing learner programs.
- Drive configuration takes effect on the next Drive command after save without reboot.
- Retains existing five-target management behavior and MangoLite Line Tracking / Obstacle capability parity.

### Validation

- Full Device Manager regression: 213 PASS.
- Stable Portable / Installer build: PASS.
- Windows stable visual smoke: PASS.
- Representative MangoX2 Motor Direction Calibration hardware smoke: PASS.

### Downloads and SHA-256

- `MangoBox_Device_Manager_v0.5.2_Setup.exe`
  - SHA-256: `7c6373914dee3efe192e434d00fcb91686b89c159496f6943e4296f90a88aabb`
- `MangoBox_Device_Manager_v0.5.2_Portable.zip`
  - SHA-256: `e4b435b88ee2fa55720c537c329a1d09b128387e722fe21f92e2415ecaa529da`
