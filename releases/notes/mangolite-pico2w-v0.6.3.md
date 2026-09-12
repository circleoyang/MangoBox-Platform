# MangoLite Runtime v0.6.3 — MangoLite + Pico 2 W

## 中文

MangoLite Runtime v0.6.3 是 BLE Control v1 與 Motor Direction Calibration 的正式版。

### 主要更新
- 支援 Dabble Gamepad Digital control。
- 支援 Analog Joystick angle / radius callback。
- 提供 BLE Control Student API callback。
- 提供 Digital Car / Analog Car 範例。
- 支援 `drive.left_motor` / `drive.right_motor` 與左右輪獨立 inversion 校正。
- BLE 與 UART 可在同一 Runtime loop 共存；一般開機不主動 advertising，長按板載 GP3 約 10 秒開啟配對視窗。
- 斷線時會清理 BLE 控制狀態，避免輸出殘留。

### 驗證
- Pico W / Pico 2 W exact stable build：PASS。
- BLE Digital / Analog control、disconnect cleanup、Student API examples：RC line 實機驗證 PASS。
- Motor Direction Calibration：PASS。

### 下載與 SHA-256
- `MangoLite_Runtime_v0.6.3_Pico2W.uf2`
  - SHA-256: `0e84fcba9b8e9d3aee1622c770e2c712e7ad25cbf1b7172657c1c90e44977476`

## English

MangoLite Runtime v0.6.3 is the stable BLE Control v1 and Motor Direction Calibration release.

### Highlights
- Supports Dabble Digital Gamepad control.
- Supports analog joystick angle / radius callbacks.
- Provides learner-facing BLE Control Student API callbacks.
- Includes Digital Car / Analog Car examples.
- Adds logical left/right motor mapping with independent per-wheel inversion.
- BLE and UART coexist in the same Runtime loop. Normal startup does not advertise; hold the onboard GP3 button for about 10 seconds to open the pairing window.
- BLE disconnect cleanup clears active control state.

### Validation
- Exact stable builds for Pico W / Pico 2 W: PASS.
- BLE Digital / Analog control, disconnect cleanup and Student API examples: hardware-validated on the RC line.
- Motor Direction Calibration: PASS.

### Download and SHA-256
- `MangoLite_Runtime_v0.6.3_Pico2W.uf2`
  - SHA-256: `0e84fcba9b8e9d3aee1622c770e2c712e7ad25cbf1b7172657c1c90e44977476`
