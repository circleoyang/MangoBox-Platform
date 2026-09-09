# Hardware Lab 基本操作

Hardware Lab 是 MangoBox 的**韌體與裝置生命週期工具**。目前公開正式版為 **v0.3.0**，對應目前五個正式 Runtime target：

```text
MangoX2 + Pico       → Runtime v0.2.6
MangoX2 + Pico W     → Runtime v0.2.6
MangoX2 + Pico 2 W   → Runtime v0.2.6
MangoLite + Pico W   → Runtime v0.6.1
MangoLite + Pico 2 W → Runtime v0.6.1
```

Hardware Lab 主要處理 Firmware Update、Clean Flash、Factory Reset 輔助、Recovery / Deep Rescue、execution mode、管理 transport 與診斷報告。一般 GPIO / Pin 設定、校準與感測器監看請使用 Device Manager v0.5.1。

正式版下載與 SHA-256 請以 [MangoBox 下載中心](../../../../releases/) 為準。

---

# 1. 先選對 Target

v0.3.0 先選 MangoX2 / MangoLite，再選 Pico / Pico W / Pico 2 W。五個 target 的主要差異如下：

| Target | MCU | Recovery Button | Host UART | Gateway |
|---|---|---|---|---|
| MangoX2 + Pico | RP2040 | GP7（標準預安裝、可拆） | GP12 TX / GP13 RX | 不支援 |
| MangoX2 + Pico W | RP2040 | GP7（標準預安裝、可拆） | GP12 TX / GP13 RX | 支援 |
| MangoX2 + Pico 2 W | RP2350 | GP7（標準預安裝、可拆） | GP12 TX / GP13 RX | 支援 |
| MangoLite + Pico W | RP2040 | GP3 | GP4 TX / GP5 RX | 支援 |
| MangoLite + Pico 2 W | RP2350 | GP3 | GP4 TX / GP5 RX | 支援 |

MangoX2 的 GP7 Button 是預安裝可拆模組，不是 PCB 固定元件；若已拆除，Button + RESET gesture 應視為 N/A，而不是 FAIL。

---

# 2. Firmware Update

一般更新適合「只更新 Runtime、保留現有設定」：

```text
選 Target
→ 選完全相符的 UF2
→ Firmware Update
→ 確認 Target / MCU
→ 進入 UF2 bootloader
→ 複製 firmware
→ 等待重新啟動與狀態確認
```

五個正式 UF2 都是獨立 target，請勿因為 MCU 相同就交換使用。

---

# 3. Clean Flash

Clean Flash 用於需要真正重建裝置環境時，例如：

- 設定已混亂；
- 一般 Firmware Update 無法恢復；
- 教師要把設備整理回指定課堂狀態；
- 需要 Factory Reset + firmware deployment 的完整流程。

不要把 Clean Flash 當成一般模組除錯的第一步。

---

# 4. Recovery / Deep Rescue 維護手勢

維護手勢由 Runtime 判定，PC 畫面上的 timer 只作操作提示。

- **MangoLite**：使用 GP3 + RESET。
- **MangoX2**：使用 GP7 + RESET；GP7 為預安裝可拆模組。

一般語意為短按正常啟動、較長按進入 Recovery，再延長進入 Deep Rescue；實際狀態以 Hardware Lab 與目前正式 Runtime 回報為準。

---

# 5. Execution Mode

MangoBox 可能使用：

```text
micropython
host_uart
gateway
```

不是每一個 target 都有全部模式。普通 Raspberry Pi Pico 沒有 Wi-Fi，因此 **MangoX2 + Pico 不提供 Gateway mode**；Pico W / Pico 2 W target 才能使用 Gateway 路徑。

---

# 6. 三種管理連線

## MicroUSB

用於 MicroPython / REPL 管理、進入 bootloader 與部分 firmware / mode 工作。若 MangoThonny 正占用同一 COM Port，請先停止程式並釋放連線。

## Host UART

使用 3.3 V USB-TTL adapter，baud rate 為 `115200`，並務必共地：

```text
GND ↔ GND
```

MangoX2 與 MangoLite 的 UART Pin 不同，請依 target 選擇。

## Gateway

僅 Wi-Fi target 使用。普通 MangoX2 + Pico 沒有 Gateway path。

---

# 7. Diagnostic Report

遇到生命週期問題時，建議先保存 JSON 診斷報告，再進行更大的裝置變更。報告可包含：

- target / MCU；
- Runtime identity；
- Recovery Button；
- Host UART Pin；
- COM Port；
- Gateway 設定；
- 選用 UF2；
- execution mode；
- Clean Flash / Recovery 狀態；
- stable diagnostic code。

---

# 8. Sensor / GPIO 問題怎麼查？

如果只是 PIR / Light / Sound / IR / Joystick / Ultrasonic 沒反應，先不要做 Clean Flash。建議：

```text
Student API supports()
→ 模組 Enable
→ GPIO / Pin
→ Device Manager Read Once / Monitor
→ 最小 raw diagnostic
→ VCC / GND / Signal
→ calibration
```

Hardware Lab v0.3.0 的定位仍是 firmware / lifecycle，不是通用 GPIO / ADC 示波器。

---

# 9. 三個工具的分工

| 工具 | 主要用途 |
|---|---|
| MangoThonny v0.4.0 | Python / MicroPython 教學、Host Student API、程式開發與匯出 |
| Device Manager v0.5.1 | 模組 Enable、Pin、設定、校準、Read Once / Monitor |
| Hardware Lab v0.3.0 | Firmware、Clean Flash、Recovery、execution mode、生命週期診斷 |

## 相關文件

- [Device Manager 基本操作](device-manager.md)
- [Hardware Lab v0.3.0 完整安裝與使用說明](../../../../desktop/hardware-lab/guide/)
- [MangoBox 下載中心](../../../../releases/)
- Online Documentation 的 target / mode / stable version selector
