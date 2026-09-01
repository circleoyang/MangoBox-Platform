# MangoX2 Runtime v0.2.6-rc11

## 中文

MangoX2 Runtime v0.2.6-rc11 是目前建議使用的 Release Candidate，整合本輪已完成實機驗證的 Motor / Drive、Ultrasonic、雙路循跡、Obstacle Sensor，以及 named Servo / Ultrasonic 支援與保守的舊設定 migration。

### 支援硬體

- MangoX2 + Raspberry Pi Pico（RP2040）
- MangoX2 + Raspberry Pi Pico 2 W（RP2350）

### 主要內容

- Motor / Drive Student API：前進、後退、原地左轉／右轉、停止。
- Ultrasonic：距離讀取、near / far callback 與 hysteresis。
- 雙路循跡：GP12 / GP13，黑=1、白=0，支援 none / left / right / both 與 convenience callbacks。
- Obstacle Sensor：named multi-instance digital input，CLEAR=1、BLOCKED=0，60 ms 穩定狀態 debounce。
- Servo / Ultrasonic：支援 named multi-instance，保留既有預設／legacy 使用方式。
- 舊 `mangox2_config.json` 升級時，只恢復 firmware 宣告的 locked hardware baseline；使用者可調設定維持原值。

### 實機驗證

- Raspberry Pi Pico / RP2040：combined hardware validation PASS。
- Raspberry Pi Pico 2 W / RP2350：combined smoke validation PASS。
- Unified Student API CI：PASS。
- Pico / Pico 2 W firmware build：PASS。

### 下載檔案

**Raspberry Pi Pico / RP2040**

- `MangoBox_Runtime_v0.2.6-rc11_MangoX2_Pico.uf2`
- SHA-256: `3bff9237a358282602d0cc22d389cdc3e46d4ec33477d65371e44be80a801030`

**Raspberry Pi Pico 2 W / RP2350**

- `MangoBox_Runtime_v0.2.6-rc11_MangoX2_Pico2W.uf2`
- SHA-256: `cb3011c078ae26836ed1a30c79837a1b942c07890aa17f6159225c01f4fe38f2`

### 安裝方式

1. 按住 Raspberry Pi Pico / Pico 2 W 的 **BOOTSEL**。
2. 透過 USB 連接電腦。
3. 出現 USB 儲存裝置後放開 BOOTSEL。
4. 將對應的 `.uf2` 複製至該磁碟。
5. 寫入完成後開發板會自動重新啟動。

### 版本狀態

**Release Candidate (RC)**。建議目前開發、測試與教學環境使用，尚未標示為 Stable。

---

## English

MangoX2 Runtime v0.2.6-rc11 is the current recommended Release Candidate. It integrates the hardware-validated Motor / Drive, Ultrasonic, dual Line Tracking, Obstacle Sensor, named Servo / Ultrasonic support, and conservative legacy-configuration migration completed in this release cycle.

### Supported hardware

- MangoX2 + Raspberry Pi Pico (RP2040)
- MangoX2 + Raspberry Pi Pico 2 W (RP2350)

### Highlights

- Motor / Drive Student API: forward, backward, spin left/right, and stop.
- Ultrasonic distance reads, near / far callbacks, and hysteresis.
- Dual Line Tracking on GP12 / GP13 with black=1 and white=0; supports none / left / right / both plus convenience callbacks.
- Named multi-instance Obstacle Sensor digital inputs with CLEAR=1, BLOCKED=0, and 60 ms stable-state debounce.
- Named multi-instance Servo and Ultrasonic devices while preserving default / legacy access.
- Legacy `mangox2_config.json` upgrades restore only firmware-declared locked hardware baselines and preserve user-adjustable settings.

### Validation

- Raspberry Pi Pico / RP2040: combined hardware validation PASS.
- Raspberry Pi Pico 2 W / RP2350: combined smoke validation PASS.
- Unified Student API CI: PASS.
- Pico / Pico 2 W firmware builds: PASS.

### Downloads

**Raspberry Pi Pico / RP2040**

- `MangoBox_Runtime_v0.2.6-rc11_MangoX2_Pico.uf2`
- SHA-256: `3bff9237a358282602d0cc22d389cdc3e46d4ec33477d65371e44be80a801030`

**Raspberry Pi Pico 2 W / RP2350**

- `MangoBox_Runtime_v0.2.6-rc11_MangoX2_Pico2W.uf2`
- SHA-256: `cb3011c078ae26836ed1a30c79837a1b942c07890aa17f6159225c01f4fe38f2`

### Installation

1. Hold **BOOTSEL** on the Raspberry Pi Pico / Pico 2 W.
2. Connect the board to the computer over USB.
3. Release BOOTSEL when the USB storage device appears.
4. Copy the matching `.uf2` file to that drive.
5. The board restarts automatically after flashing.

### Release status

**Release Candidate (RC)**. Recommended for current development, testing, and classroom use; it has not yet been designated Stable.
