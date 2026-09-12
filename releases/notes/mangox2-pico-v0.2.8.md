# MangoX2 Runtime v0.2.8 — MangoX2 + Pico

## 中文

MangoX2 Runtime v0.2.8 將車體左右輪映射與單輪反轉正式納入 Drive Runtime，讓不同車體安裝方向可透過 Device Manager 校正，不需要修改學生程式。

### 主要更新
- 新增 `drive.left_motor` / `drive.right_motor`。
- 新增 `drive.left_inverted` / `drive.right_inverted`。
- 預設值保持 v0.2.7 既有車體行為相容。
- Raw `M1` / `M2` 保留實體 channel 語意；`forward` / `backward` / tank / arc / spin 使用校正後邏輯車輪語意。
- Drive profile 變更後，下一個 Drive command 即套用新設定，不需 reboot。

### 驗證
- Motor / Drive automated regression：PASS。
- Pico / Pico W / Pico 2 W 三 target clean local build：PASS。
- 代表性 MangoX2 Motor Direction Calibration 實機 smoke：PASS。

### 下載與 SHA-256
- `MangoBox_Runtime_v0.2.8_MangoX2_Pico.uf2`
  - SHA-256: `f94b582fcf3cb253c43c62747b170781e061498fe68f996a6d787f7e4b3fbcbd`

## English

MangoX2 Runtime v0.2.8 adds stable logical wheel mapping and independent per-wheel inversion to the Drive Runtime, allowing chassis wiring and installation differences to be calibrated without changing learner programs.

### Highlights
- Adds `drive.left_motor` / `drive.right_motor`.
- Adds `drive.left_inverted` / `drive.right_inverted`.
- Preserves the legacy v0.2.7 default vehicle behavior.
- Raw `M1` / `M2` keep physical-channel semantics, while vehicle movement commands use calibrated logical wheel semantics.
- Updated Drive configuration is applied on the next Drive command without reboot.

### Validation
- Motor / Drive automated regression: PASS.
- Clean local builds for Pico / Pico W / Pico 2 W: PASS.
- Representative MangoX2 Motor Direction Calibration hardware smoke: PASS.

### Download and SHA-256
- `MangoBox_Runtime_v0.2.8_MangoX2_Pico.uf2`
  - SHA-256: `f94b582fcf3cb253c43c62747b170781e061498fe68f996a6d787f7e4b3fbcbd`
