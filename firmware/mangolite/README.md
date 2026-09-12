# MangoLite Runtime

正式版 / Stable: v0.6.3

- [MangoLite + Pico W](https://github.com/circleoyang/MangoBox-Platform/releases/tag/mangolite-picow-v0.6.3)
- [MangoLite + Pico 2 W](https://github.com/circleoyang/MangoBox-Platform/releases/tag/mangolite-pico2w-v0.6.3)

v0.6.3 是 MangoLite 的 BLE Control v1 與 Motor Direction Calibration 正式版。BLE Control 支援 Dabble Gamepad Digital control、Analog Joystick angle/radius callback、Student API callback，以及 Digital Car / Analog Car 教學範例；一般開機不主動 advertising，長按板載 GP3 約 10 秒才開啟配對視窗，BLE 可與既有 UART Runtime loop 共存。

Motor Direction Calibration 支援 `drive.left_motor`、`drive.right_motor`、`drive.left_inverted`、`drive.right_inverted`，可在 Device Manager 中校正左右馬達交換與單輪反向，學生程式仍可維持一致的 `forward()` / `backward()` 車體語意。

驗證狀態：Pico W / Pico 2 W exact stable build PASS；BLE Digital / Analog control、disconnect cleanup 與 Student API examples 已於 RC line 完成實機驗證；Motor Direction Calibration PASS。

每個 target 各自發布 UF2、SHA-256 與雙語說明。請依控制板選擇檔案。

Each target has its own UF2, SHA-256 and bilingual release notes. v0.6.3 is the stable BLE Control v1 and Motor Direction Calibration release, with Dabble Digital Gamepad, analog joystick callbacks, learner-facing control callbacks, Digital/Analog Car examples, logical wheel mapping, and independent per-wheel inversion.
