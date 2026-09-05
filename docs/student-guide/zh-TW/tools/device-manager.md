# Device Manager 基本操作

Device Manager 用來做 **MangoX2 / MangoLite 的裝置設定與維護**。它可以幫你確認 Runtime（執行環境）目前接受了哪些設定，再回到 MangoThonny／Python 使用 Student API。

> 本頁以目前公開的 `v0.5.0-rc8` 多 target 設計為基礎。Windows 一般使用者建議使用繁體中文 Installer；需要免安裝環境時可使用 Portable ZIP。

目前 `v0.5.0-rc8` 可辨識的主要組合包括：

```text
MangoX2 + Pico
MangoX2 + Pico 2 W
MangoX2 + Pico W
MangoLite + Pico 2 W
MangoLite + Pico W
```

---

# 1. Device Manager 可以做什麼？

學生最常用到：

- 連接 MangoX2 / MangoLite；
- 確認 target（目標裝置）與 Runtime／firmware（韌體）資訊；
- Enable / Disable 選配模組；
- 設定 GPIO（General-Purpose Input/Output，通用輸入輸出）／Pin（腳位）；
- 套用設定，再重新讀回確認；
- 使用目前版本已支援的 Live Read / Monitor；
- 做 Light、Sound、Joystick 等已實作的 calibration（校準）／維護；
- 匯入、匯出、還原設定；
- 查看 Student API / JSON preview（若該頁面提供）。

Device Manager **不是**用來取代 Student API 寫作品。設定完成後，學生仍回到 MangoThonny／Python 寫程式。

---

# 2. 先確認你用哪一種連線

目前常見的 Device Manager 管理方式有兩種。

## A. MicroUSB / Pico

使用 Pico 的 USB 連線與 MicroPython REPL／RuntimeConfig 管理裝置。

這種方式適合教室的一條 USB 線工作流程。

### 很重要：不要讓兩個程式同時占用同一個 COM Port

如果 Thonny／MangoThonny 正連著 Pico，Device Manager 可能無法同時取得同一個 COM Port。

建議：

```text
停止目前程式
→ 關閉／中斷 Thonny 的裝置連線
→ 再讓 Device Manager 連線
```

完成設定後，再回到 Thonny／MangoThonny。

## B. Runtime UART

使用 USB-to-TTL adapter 連接 Runtime UART。

MangoLite 與 MangoX2 的 UART Pin 不相同，請以目前 target 的工具畫面／正式硬體文件為準，不要交換使用。

另外一定要共地：

```text
GND ↔ GND
```

目前 Runtime UART baud rate 為 `115200`。

`v0.5.0-rc8` 在 MangoX2 從 `MicroUSB / Pico` 切回 `Runtime UART` 時，會先等待 Runtime 正常 reboot，再進行單次 readiness / config refresh，避免同一輪恢復重複讀取多次裝置資訊。

---

# 3. 連線成功後，先看「我是誰」

不要一連上就直接改 Pin。

先確認：

```text
Target
Runtime / Firmware version
目前連線方式
目前設定是否成功讀取
```

例如要分清楚：

```text
MangoX2 + Pico
MangoX2 + Pico 2 W
MangoX2 + Pico W
MangoLite + Pico 2 W
MangoLite + Pico W
```

因為同一個「IR」、「Button」或「UART」在不同 target 可能有不同硬體規則。

> COM Port 開啟不等於 Runtime 一定已準備完成。Device Manager 應以 Runtime 的實際回覆／system info 類資訊確認裝置狀態，而不是只看「Port 有開」。

---

# 4. 設定模組的標準流程

以外接 IR Sensor 為例：

```text
選擇 IR
   ↓
Enable
   ↓
選擇 Pin
   ↓
Apply / 送出設定
   ↓
重新讀取 config
   ↓
確認畫面仍顯示相同值
   ↓
再跑 Student API
```

例如你設定：

```text
IR enabled = True
IR Pin = GP4
```

真機也必須是：

```text
IR OUT / Signal → GP4
```

設定與接線缺一不可。

---

# 5. Pin Config（腳位設定）怎麼看？

Device Manager 的 Pin 設定應以 **Runtime 目前的 config 作為 source of truth（主要依據）**，不要再維護另一套偷偷不同的 GPIO 預設表。

學生要注意兩件事：

### ① 畫面顯示的是目前設定值

例如：

```text
Servo → GP10
Light Sensor → GP26 (AD0)
Sound Sensor → GP27 (AD1)
IR → GP4
```

`v0.5.0-rc8` 的 ADC 腳位顯示會對齊板上絲印：

```text
GP26 (AD0)
GP27 (AD1)
GP28 (AD2)
```

括號中的 `AD0 / AD1 / AD2` 是 UI 顯示名稱；Runtime config 裡的 canonical GPIO 值仍然是 `26 / 27 / 28`。

### ② 真機 Signal 也要接同一個 Pin

例如畫面寫 `GP4`，你卻把 Signal 接 `GP17`，Python 程式本身再正確也不會有反應。

---

# 6. MangoLite 與 MangoX2 不要混在一起

同一個功能可能有不同硬體性質。

以 IR 為例：

### MangoLite + Pico 2 W / Pico W

IR 是板載固定功能：

```text
GP22
```

學生不應把它當成一般可任意換 Pin 的外接 IR。

### MangoX2 + Pico / Pico 2 W / Pico W

IR 是選配模組，High Level MicroPython 使用：

```text
enabled_modules.ir_sensor
ir_sensor_pin
```

因此 Device Manager 會依 `ir_sensor_pin` 顯示目前 Pin，而不是顯示 MangoLite 的固定 GP22。

---

# 7. Live Read / Monitor 怎麼用？

如果目前頁面提供 Live Read / Monitor，可以先用它做「高階路徑」測試。

例如 Button：

```text
放開 → 0
按下 → 1
```

如果 Live Read 有正確變化，代表：

- Runtime 設定大致合理；
- Student API / Runtime 的讀取路徑大致有回應。

如果 Live Read 沒反應，不要立刻重寫完整作品。

先往下查：

```text
Enable
→ Pin
→ 最小 raw diagnostic
→ 真機接線 / 供電
```

> 不同 Runtime 版本與模組的 Live Read / Monitor 支援程度不同。文件只能說明「目前版本真正存在」的功能，不能假設每一頁都有相同 Monitor。

---

# 8. Sensor 沒反應時的正確除錯順序

以 Light Sensor 為例：

```text
1. m.supports("light")
2. light_sensor 是否 Enable
3. light_sensor_pin 是哪一個 GPIO
4. Device Manager 設定 / Live Read（若支援）
5. 最小 machine.ADC raw test
6. AO / VCC / GND 真機接線
7. raw 會變但 0～100 不合理 → calibration
```

Digital Sensor 則可用 `machine.Pin` 做最小測試。

這樣可以先分出：

```text
API / Runtime 問題
設定問題
Pin / 接線問題
校準問題
作品邏輯問題
```

---

# 9. Import / Export / Restore 的概念

Device Manager 可用於保存或還原設定，但學生要分清楚：

- **匯出／備份**：把目前設定保存起來；
- **匯入**：把選擇的設定項目套回裝置；
- **Restore / Defaults**：屬較大的設定變更，使用前應先確認影響範圍。

完整 restore 能力可能受到 Runtime 版本影響，因此正式 online documentation 也應依 Device Manager version + Runtime version 顯示對應說明。

---

# 10. OLED 字型管理的連線差異

`v0.5.0-rc8` 的 OLED 字型頁在兩種連線模式都可使用既有的中文字分析／字模寫入路徑，但「目前學生自訂字庫」的持久字庫讀取／清除管理區塊只在 `MicroUSB / Pico` 模式顯示。

```text
Runtime UART
→ 保留字模分析／寫入
→ 隱藏持久字庫管理區塊

MicroUSB / Pico
→ 顯示完整持久字庫管理區塊
```

這是 UI 可用性設計，不代表 Runtime UART 的其他 OLED 功能被移除。

---

# 11. 什麼時候不要再用 Device Manager 硬查？

如果問題已經不是某個 Sensor／Pin，而是：

```text
Firmware 不確定
Target / MCU 可能刷錯
execution_mode 不對
Recovery / Rescue
Clean Flash
更新後裝置進入錯誤模式
MicroUSB / Host UART / Gateway 管理路徑問題
```

這時才進入 [Hardware Lab 基本操作](hardware-lab.md)。

Hardware Lab 目前主要處理 firmware 與裝置生命週期，不是通用 GPIO／ADC Sensor 測試器。

---

# 12. Device Manager 與 Student API 文件的關係

未來每個模組頁面可以提供：

```text
[使用說明]
[問題排除]
```

從 Device Manager 開啟時，可把目前已知資訊帶進 Online Documentation：

```text
language
target
programming mode
Runtime version
module
module_enabled
configured Pin
```

例如 MangoX2 IR 已設定 GP4，就可以直接開：

> MangoX2 + Pico 2 W → High Level MicroPython → IR → 問題排除 → 目前設定 GP4

而不用讓學生重新選一次。

## 相關文件

- [Hardware Lab 基本操作](hardware-lab.md)
- 各模組的「問題排除」頁
- [Tool → Documentation Deep-Link Contract](../../TOOL_HELP_DEEPLINK_CONTRACT_V1.md)
