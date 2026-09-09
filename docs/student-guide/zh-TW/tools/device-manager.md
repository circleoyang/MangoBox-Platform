# Device Manager 基本操作

Device Manager 是 MangoBox 的**日常裝置設定、校準與即時監看工具**。目前公開正式版為 **v0.5.1**，延續五個正式 Runtime target：

```text
MangoX2 + Pico       → Runtime v0.2.6
MangoX2 + Pico W     → Runtime v0.2.6
MangoX2 + Pico 2 W   → Runtime v0.2.6
MangoLite + Pico W   → Runtime v0.6.1
MangoLite + Pico 2 W → Runtime v0.6.1
```

一般 Windows 使用者建議使用 Installer；需要免安裝部署時可使用 Portable ZIP。正式版下載與 SHA-256 請以 [MangoBox 下載中心](../../../../releases/) 為準。

---

# 1. Device Manager 負責什麼？

學生最常使用的功能包括：

- 連接 MangoX2 / MangoLite；
- 辨識 target、MCU 與 Runtime 版本；
- Enable / Disable 選配模組；
- 設定 GPIO / Pin；
- 套用設定並重新讀回確認；
- 使用支援模組的 Read Once / Monitor；
- 執行 Light、Sound、Joystick 等校準流程；
- 匯入、匯出與還原設定；
- 檢視 Student API / JSON preview（該頁面有提供時）。

Device Manager **不負責韌體燒錄、Clean Flash、Factory Reset、Recovery / Deep Rescue**；這些生命週期工作由 Hardware Lab v0.3.0 負責。

---

# 2. 連線方式

## MicroUSB / Pico

使用 Pico 原生 USB 與 MicroPython / RuntimeConfig 管理路徑。若 MangoThonny 正占用同一個 COM Port，請先停止程式並中斷裝置連線，再開 Device Manager。

## Runtime UART

使用 3.3 V USB-to-TTL adapter，baud rate 為 `115200`，並務必共地：

```text
GND ↔ GND
```

MangoX2 與 MangoLite 的 Host UART Pin 不同，請依 Device Manager 目前選取 target 的畫面為準，不要跨板型沿用設定。

---

# 3. 連線後先確認裝置身分

先確認下列資訊，再修改 Pin 或模組設定：

```text
Target
MCU family
Runtime / Firmware version
目前連線方式
config 是否成功讀取
```

Device Manager v0.5.1 延續 v0.5 Stable 的五個正式 Runtime target 支援線；MangoLite 建議搭配 Runtime v0.6.1。本版完成 focused capability / navigation regression，並以 MangoLite + Pico W、Pico 2 W 與 MangoX2 進行代表性實機 smoke。

---

# 4. 模組設定標準流程

以外接 IR 為例：

```text
選擇 IR
→ Enable
→ 選擇 Pin
→ Apply
→ 重新讀取 config
→ 確認值一致
→ 再執行 Student API
```

設定與實體接線必須一致。API 存在也不等於模組目前已 Enable。

---

# 5. GPIO / Pin 與 ADC 顯示

Device Manager 以 Runtime config 作為設定依據。ADC 腳位顯示與板上絲印一致：

```text
GP26 (AD0)
GP27 (AD1)
GP28 (AD2)
```

括號中的 `AD0 / AD1 / AD2` 是 UI 顯示名稱；Runtime config 的 canonical GPIO 值仍是 `26 / 27 / 28`。

---

# 6. MangoLite 與 MangoX2 的差異

同一個 Student API 語意在不同板子可能對應不同硬體配置。例如：

- **MangoLite IR**：板載固定 GP22。
- **MangoX2 IR**：外接選配模組，Pin 由設定決定。
- **MangoX2 OLED / RGB / Button**：屬標準預安裝模組，不應描述為 PCB 板載元件。
- **MangoX2 / MangoLite OLED**：v0.5.1 依目前 Enable 狀態顯示硬體頁；Disable 後隱藏，重新 Enable 後恢復。
- **MangoLite Ultrasonic**：Runtime v0.6.1 補齊 runtime / Student API / handler parity；在 Pin Configuration 啟用後，Device Manager v0.5.1 會正確顯示裝置頁。

因此應先選正確 target，再看 Enable、Pin 與實際接線。

---

# 7. Read Once / Monitor 與校準

若模組頁提供即時讀值，可先用它確認 Runtime 路徑是否正常。若沒有反應，建議依序檢查：

```text
Student API supports()
→ 模組 Enable
→ GPIO / Pin
→ Device Manager Read Once / Monitor
→ 最小 raw diagnostic
→ VCC / GND / Signal 接線
→ calibration
```

Light、Sound、Joystick 等支援校準的模組，請先確認 raw signal 正常，再做校準；不要以校準取代接線檢查。

---

# 8. Import / Export / Restore

- **Export / Backup**：保存目前設定。
- **Import**：將選定設定套回裝置。
- **Restore / Defaults**：較大範圍的設定變更，使用前先確認影響。

需要重建整個 Runtime 或處理 Recovery / Deep Rescue 時，請改用 Hardware Lab。

---

# 9. 與 Online Documentation 的整合

Device Manager 可以把目前環境帶入 MangoBox Online Documentation，包括：

```text
language
target
programming mode
Runtime version
module
module_enabled
configured Pin
```

線上文件現在已對齊五個正式 target，MangoLite profile 已更新到 Runtime v0.6.1，並以正式 Runtime profile 過濾可用 Student API。

## 相關文件

- [Hardware Lab 基本操作](hardware-lab.md)
- [Device Manager v0.5.1 完整安裝與使用說明](../../../../desktop/device-manager/guide/)
- [MangoBox 下載中心](../../../../releases/)
- 各模組的「使用指南／問題排除／API Reference」
