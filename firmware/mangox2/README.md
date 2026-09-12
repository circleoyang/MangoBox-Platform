# MangoX2 Runtime

正式版 / Stable: v0.2.8

- [MangoX2 + Pico](https://github.com/circleoyang/MangoBox-Platform/releases/tag/mangox2-pico-v0.2.8)
- [MangoX2 + Pico W](https://github.com/circleoyang/MangoBox-Platform/releases/tag/mangox2-picow-v0.2.8)
- [MangoX2 + Pico 2 W](https://github.com/circleoyang/MangoBox-Platform/releases/tag/mangox2-pico2w-v0.2.8)

v0.2.8 新增跨板一致的 Motor Direction Calibration contract，支援 `drive.left_motor`、`drive.right_motor`、`drive.left_inverted`、`drive.right_inverted`。不同車體若左右馬達插反或單側車輪方向相反，可由 Device Manager 校正，而不需要修改學生程式。

Raw `M1` / `M2` 仍保留實體通道語意；`forward`、`backward`、tank、arc、spin 等車體層命令使用校正後的邏輯左右輪映射。Drive profile 更新後可在下一個 Drive command 套用，不需重新開機。

驗證狀態：Motor / Drive automated regression PASS、Pico / Pico W / Pico 2 W 三 target clean local build PASS、代表性 MangoX2 Motor Direction Calibration 實機 smoke PASS。

每個 target 各自發布 UF2、SHA-256 與雙語說明。請依主板與控制板組合選擇檔案。

Each target has its own UF2, SHA-256 and bilingual release notes. v0.2.8 adds logical wheel mapping and independent per-wheel inversion while preserving raw M1/M2 physical-channel semantics. Vehicle-level movement commands use the calibrated mapping, and updated Drive configuration takes effect on the next command without reboot.
