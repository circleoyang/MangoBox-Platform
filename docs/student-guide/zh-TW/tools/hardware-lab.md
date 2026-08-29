# Hardware Lab 基本操作

Hardware Lab 是 MangoBox 的**韌體與裝置生命週期診斷工具**。目前正式版本重點不是一般 Sensor／GPIO 即時測試，而是處理：

- 選擇正確的 MangoBox target；
- firmware（韌體）更新；
- Clean Flash（Factory Reset + 重新部署 firmware）；
- Button + RESET 維護手勢；
- execution mode（執行模式）偵測與切換；
- MicroUSB / Host UART / Gateway 管理路徑；
- 產生診斷報告。

> 目前 Hardware Lab v0.2.0-rc3 **尚未提供一般 GPIO／ADC／RGB／Buzzer／OLED／Servo／Sensor production test**。如果你在 API 文件看到「檢查某個 Pin 是否真的有訊號」，目前應先使用文件提供的最小診斷程式，或 Device Manager 已支援的 Live Read / Monitor；不要以為 Hardware Lab 已經有所有 Sensor 測試功能。

---

## 什麼時候要用 Hardware Lab？

學生最常在以下情況使用：

1. 要更新 MangoX2 / MangoLite firmware；
2. 裝置的 execution mode 不確定；
3. 一般更新後裝置沒有回到預期模式；
4. 需要 Clean Flash；
5. 要測試 Recovery / Deep Rescue 類維護手勢；
6. 需要把裝置狀態整理成診斷報告。

如果只是「Light Sensor 為什麼讀不到？」這種單一模組問題，先回到該模組 API 的**問題排除**頁，不要第一步就做 Clean Flash。

---

# 1. 先選對 Hardware Target

目前 Hardware Lab 支援三種 target：

```text
MangoLite + Pico 2 W
MangoX2 + Pico
MangoX2 + Pico 2 W
```

這一步很重要，因為不同 target 的：

- MCU；
- Recovery Button；
- Host UART Pin（腳位）；
- Gateway 支援；
- firmware UF2；

都可能不同。

### 目前重要差異

| Target | MCU | Recovery Button | Host UART | Gateway |
|---|---|---|---|---|
| MangoLite + Pico 2 W | RP2350 | GP3 | GP4 TX / GP5 RX | 支援 |
| MangoX2 + Pico | RP2040 | GP7（預裝、可拆） | GP12 TX / GP13 RX | 不支援 |
| MangoX2 + Pico 2 W | RP2350 | GP7（預裝、可拆） | GP12 TX / GP13 RX | 支援 |

MangoX2 的 GP7 Button 是預裝可拆的，不是 PCB 固定元件。因此，如果 GP7 已被拆除，Button + RESET 手勢測試應該是 **N/A（不適用）**，不是 FAIL。

---

# 2. Firmware Update：保留目前設定

一般 firmware 更新適合：

> 「我只想更新 Runtime，不想把目前設定全部清掉。」

基本流程：

```text
選 Target
   ↓
選對應 .uf2
   ↓
Firmware Update
   ↓
Hardware Lab 檢查 target / MCU
   ↓
進入 UF2 bootloader
   ↓
複製 firmware
```

### 注意

一般 firmware update **不代表裝置更新後一定會回到 MicroPython 模式**。

裝置原本儲存的 `execution_mode` 會影響重新開機後的行為。

---

# 3. Clean Flash：需要真正重置時才使用

Clean Flash 不是一般除錯第一步。

它會把 Factory Reset 與 firmware deployment 組合成一個維護流程，適合：

- 設定已經混亂；
- 想重新建立乾淨 Runtime 環境；
- 一般 firmware update 無法解決生命週期問題；
- 教師要把設備整理回課堂指定狀態。

請先確認你真的需要重置，再使用 Clean Flash。

---

# 4. Button + RESET 維護手勢

Hardware Lab 可以協助驗證維護手勢，但畫面上的 PC timer（計時器）只是參考。

真正決定 Recovery / Rescue 行為的是 firmware。

### MangoLite

GP3、板載 RGB、Buzzer 等維護提示硬體是板載固定功能。

### MangoX2

GP7 Button 與 RGB Strip 可能被拆除。

因此：

- 固定板載 Buzzer 是較可靠的提示；
- RGB 只有在模組仍安裝時才可作輔助提示；
- GP7 不存在時，Gesture test 應標示 N/A。

---

# 5. Execution Mode 偵測與切換

MangoBox 可能使用：

```text
micropython
host_uart
gateway
```

但不是每一個 target 都有全部模式。

例如 MangoX2 + Pico（RP2040）沒有 Wi-Fi，所以沒有 Gateway mode。

Hardware Lab 的 `Auto` 會依 target 嘗試可用的管理路徑，而不是假設所有板子都有相同 transport（傳輸方式）。

---

# 6. 三種常見連線

## MicroUSB

主要用於：

- MicroPython REPL 管理；
- 進入 ROM bootloader；
- 部分 firmware / mode 管理。

如果 Thonny 正占用同一個 COM Port，請先停止程式並釋放連線。

## Host UART

使用 3.3 V USB-TTL adapter。

除了 TX / RX，也一定要：

```text
GND ↔ GND
```

Runtime UART baud rate 目前為：

```text
115200
```

請依畫面顯示的 target 使用正確 TX / RX Pin，不要把 MangoLite 與 MangoX2 的 UART Pin 混用。

## Gateway

只在支援 Wi-Fi / Gateway 的 target 上出現。

MangoX2 + Pico（RP2040）沒有 Gateway path。

---

# 7. 發生問題時先存 Diagnostic Report

Hardware Lab 的一個重要功能，是把裝置生命週期問題整理成診斷資訊。

報告可以包含：

- target ID；
- MCU family；
- Hardware presence；
- Recovery Button；
- UART Pin；
- COM Port；
- Gateway configuration；
- 選擇的 firmware；
- Clean Flash mode；
- stable diagnostic code。

如果要回報問題，建議：

> **先存 JSON 診斷報告，再繼續改裝置狀態。**

這樣比較容易還原問題發生時的現場。

---

# 8. Sensor / GPIO 問題目前怎麼查？

如果你的問題是：

> 「我的 PIR / Light / Sound / IR / Joystick 為什麼沒有反應？」

目前建議流程是：

```text
Student API supports() / capability
        ↓
模組是否 Enable
        ↓
設定的 GPIO / Pin
        ↓
Device Manager Live Read / Monitor（若該功能支援）
        ↓
API 文件提供的最小 raw diagnostic 程式
        ↓
真機 VCC / GND / Signal 接線
```

例如 Digital input（數位輸入）可以用 `machine.Pin` 做最小檢查；ADC Sensor 可以用 `machine.ADC` 觀察 raw value（原始值）是否改變。

**目前不要把 Hardware Lab 當成通用 GPIO / ADC 示波器。** 這項能力可以作為未來版本擴充，但文件在真正實作前不應假設它存在。

---

# 9. Hardware Lab 與 Device Manager 的分工

可以先這樣記：

| 工具 | 主要用途 |
|---|---|
| Device Manager | 模組 Enable、Pin 設定、配置、支援的 Live Read / Monitor、校準 |
| Hardware Lab | firmware、Clean Flash、Recovery、execution mode、管理 transport、生命週期診斷 |
| Student API 文件 | 教你寫程式，並提供最小診斷程式 |

三者不是互相取代。

---

## 相關文件

- [Device Manager 基本操作](device-manager.md)
- API 各模組的「問題排除」頁
- Online Documentation 的 target / mode / version selector
