# Runtime Config 指南：讀取 DM 設定，選對具名裝置

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 的介面與執行模式請依 Host profile 文件核對。

## 1. 可以完成什麼？

DM 已保存燈條名稱、GPIO、燈珠數與啟用狀態，學生程式就從 `m.config.get()` 讀取，讓同一份行為程式能適應不同作品。換成 12 顆燈條後，程式讀到新的 `leds`，不需要再維護另一個寫死的燈珠常數。

這是八個候選 HLMP 目標的 Runtime 查詢介面。讀取設定與控制硬體是不同步驟：有一個配置鍵，不等於裝置已連線、腳位沒有衝突或 API 已安裝。Host 模式也不能直接套用本頁的巢狀 `m.config` 介面。

## 2. 30 秒快速測試：只查看一個具名燈條

前提：DM 已啟用 LED strip 模組，新增並啟用名稱為 `strip1` 的燈條，保存正確 `pin` 與 `leds`，再重新啟動程式。名稱不同時，只修改 `name`；BarePico 預設沒有可假設存在的 `strip1`。

```python
from mangobox import Mango

def read_strip(m, name):
    if not isinstance(name, str) or not name:
        raise ValueError("Choose a configured strip name")
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("led_strip", False):
        raise RuntimeError("Enable the LED strip module in Device Manager")
    strips = m.config.get("led_strips", {})
    if not isinstance(strips, dict):
        raise ValueError("led_strips must be a dictionary")
    spec = strips.get(name)
    if not isinstance(spec, dict):
        raise ValueError("Unknown strip name: " + name)
    if spec.get("enabled") is not True:
        raise RuntimeError("Enable the selected strip in Device Manager")
    count = spec.get("leds")
    pin = spec.get("pin")
    if type(count) is not int or count < 1:
        raise ValueError("leds must be a positive integer")
    if type(pin) is not int:
        raise ValueError("The strip needs a configured GPIO")
    return pin, count

m = Mango()
try:
    name = "strip1"  # Use the exact name saved in Device Manager.
    pin, count = read_strip(m, name)
    print("strip:", name, "GPIO:", pin, "LEDs:", count)
finally:
    m.close()
```

本例的檢查函式是學生自己的 Python 函式，不是新增的 Mango API。它只讀取所需配置並列印名稱、GPIO、燈珠數，不寫入設定，也不輸出整份含網路憑證的 config。

## 3. 應該看到什麼？

正常時會看到 DM 中同一個名稱、GPIO 與燈珠數。看到 `Unknown strip name`，先核對大小寫與 DM 是否儲存；看到未啟用訊息，分別確認模組總開關與該名稱的 `enabled`。

`leds` 必須是正整數，不能是 `True`、`"12"` 或零。教學採明確檢查，不用 `int()` 把錯誤配置悄悄轉成看似正確的數字。這裡只檢查 pin 的型別；各板允許的 GPIO、保留腳位與其他裝置占用，仍由 DM／Runtime 的目標驗證處理。

## 4. 常見使用與資料結構

| 要知道什麼 | 讀取位置 | 如何使用 |
|---|---|---|
| 模組是否開啟 | `enabled_modules` 中的 `led_strip` | 先確認總開關 |
| 哪一個具名燈條 | `led_strips` 中的實際名稱 | 用明確名稱選取，不猜第一個就是要控制的裝置 |
| 該燈條是否開啟 | 該項目的 `enabled` | 未啟用先回 DM 處理 |
| 燈珠數與 GPIO | 該項目的 `leds`／`pin` | 經型別檢查後，用於索引邊界與配置診斷 |

不同模組不一定使用同一種結構。具名 `buttons`、`led_strips` 與單一 `dht11_pin` 都要依當前家族 Reference 讀取；不要自行猜 `m.led_count()`、`m.led_info()` 或所有模組都共有的配置鍵。

`get()` 讀的是目前 Mango 的配置物件；它不會每次重新讀取 DM 檔案，也不提供通用即時重載承諾。DM 改完硬體設定後重新啟動程式，必要時依 DM 指示重啟裝置。某些 Wi-Fi facade 有自己的配置重讀流程，不能推廣成所有模組都會自動更新。

## 5. 完整互動範例：檢查你選的 LED 索引

輸入 DM 的燈條名稱，再輸入想使用的 LED 索引。索引從 0 開始，最後一顆是 `leds - 1`；本例先驗證選取，下一步控制燈條時沿用同一個名稱與數量。

```python
from mangobox import Mango

def read_strip(m, name):
    if not isinstance(name, str) or not name:
        raise ValueError("Choose a configured strip name")
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("led_strip", False):
        raise RuntimeError("Enable the LED strip module in Device Manager")
    strips = m.config.get("led_strips", {})
    if not isinstance(strips, dict):
        raise ValueError("led_strips must be a dictionary")
    spec = strips.get(name)
    if not isinstance(spec, dict):
        raise ValueError("Unknown strip name: " + name)
    if spec.get("enabled") is not True:
        raise RuntimeError("Enable the selected strip in Device Manager")
    count = spec.get("leds")
    pin = spec.get("pin")
    if type(count) is not int or count < 1:
        raise ValueError("leds must be a positive integer")
    if type(pin) is not int:
        raise ValueError("The strip needs a configured GPIO")
    return pin, count

m = Mango()
try:
    name = input("Configured strip name: ").strip()
    pin, count = read_strip(m, name)
    print("Valid indices: 0 to", count - 1)
    index = int(input("Which LED index do you want to use? "))
    if not 0 <= index < count:
        raise ValueError("Index is outside the configured strip")
    print("Selection:", name, "index:", index, "GPIO:", pin)
finally:
    m.close()
```

改選不同名稱時，合法範圍會隨該裝置的 `leds` 改變。這個配置檢查器沒有啟動持續任務，因此不需要 `run_forever()`。若把這段檢查放進長時間作品，應在啟動排程前完成，避免等待 `input()` 時卡住事件處理。

## 6. 板型、讀寫責任與問題排除

MangoX2、MangoLite 有各自載板預設與保留腳位；BarePico 採外接裝置明確配置。不要把另一家族的預設 GPIO 或已存在名稱直接搬過來。完整目標清單見 [生命週期 Reference](../reference/lifecycle.md)。

`get()` 回傳的巢狀 dict／list 可能就是內部物件；「本頁只讀」是使用規範，不是唯讀代理物件的保證。不要對取得的 `spec` 賦值、修改 enabled 或寫設定檔。新增、命名、校正與保存配置交給 DM；學生程式負責選取與使用。BarePico 的 `config.set` 也不是 Carrier 共用介面。

診斷順序為：目標與 API → 模組 enabled → 名稱及 GPIO → DM 最小測試 → 實體接線／供電。只列印當次問題需要的欄位；`wifi_profile` 內可能含憑證，不要為了除錯輸出整份配置。

## 7. 小挑戰

先在 DM 建立兩個不同燈珠數的名稱，讓檢查器分別接受最後一顆索引並拒絕超出一格的索引。再將通過檢查的 `count` 用於你自己的動畫計算，保持 LED 控制仍使用同一個具名裝置。不要修改 Runtime 來繞過未啟用或 GPIO 衝突的錯誤。

[Runtime Config API Reference](../reference/runtime-config.md) · [Scheduler](scheduler.md) · [生命週期](lifecycle.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/runtime/config.py`
- `runtime/mangolite-pico2w/firmware/mangolite/runtime/config.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/barepico/firmware/barepico/config.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
