# Runtime Config API Reference：`m.config.get()`

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 的介面與執行模式請依 Host profile 文件核對。

## 適用範圍

MangoX2 三個、MangoLite 兩個與 BarePico 三個候選 HLMP 目標都可用 `m.config.get()`；完整八個 target ID 見 [生命週期 Reference](lifecycle.md)。這是既有 Runtime 物件的查詢入口，並非 Host Python 共用配置 API。它不需要無線硬體或外接裝置。

## 簽章與參數

`m.config.get(key, default=None)`

| 參數 | 型別／預設 | 意義 |
|---|---|---|
| `key` | 配置鍵名稱 `str`，必填 | 查詢一個頂層鍵；不能用點號字串自動查巢狀路徑 |
| `default` | 任意 Python 值，預設 `None` | 僅在鍵不存在時回傳；不會寫入配置 |

回傳目前配置中的值，型別由該鍵決定。找不到鍵時回傳 `default`。若鍵存在但值就是 `None`，仍回傳 `None`，不會改用 default。查詢不會啟用裝置、建立 GPIO owner、重載檔案或保存設定。

實作為底層字典的 `get`；沒有新增的 schema 型別驗證。dict／list 值可能以原物件回傳，不保證深拷貝。教學規範要求只讀取，不能透過修改回傳物件改動執行中的設定。

## 具名 LED 配置契約

| 層級 | 欄位 | 必要檢查 |
|---|---|---|
| 頂層 | `enabled_modules` | `dict` |
| 模組 | `enabled_modules["led_strip"]` | 模組已啟用 |
| 頂層 | `led_strips` | `dict`，以實際配置名稱為 key |
| 選定項目 | `led_strips[name]` | 存在、為 `dict`；名稱精確符合 DM |
| 項目 | `enabled` | 明確啟用 |
| 項目 | `leds` | 正整數，不把 bool／數字字串當作合格燈珠數 |
| 項目 | `pin` | 已配置的整數 GPIO；合法範圍、保留腳位與衝突另由 DM／Runtime 驗證 |

這不是把所有板子的 GPIO 或最大燈珠數定成同一範圍。讀到欄位只代表配置內容；真正建立／控制該元件時，還需要對應 API 的檢查。共同教材使用正式 `leds` 欄位，不猜其他名稱或無條件填入預設顆數。

`strip1`、`button1` 等是名字，不是保證存在的硬體。BarePico 預設的具名外接裝置表可能為空；Carrier 也必須確認所選名稱與 enabled。名稱內的大小寫要符合配置。

## 其他鍵與家族差異

| 鍵／介面 | 使用規則 |
|---|---|
| `target` | 可用於顯示目前配置身份；不能當成韌體已部署或實機 PASS 的證明 |
| `enabled_modules` | 模組開關；不等於方法存在或接線正常 |
| `buttons` | 具名輸入配置；先檢查字典、名稱及 enabled，其他欄位依該族 Reference |
| `event_logging` | Runtime 日誌配置；學生不藉修改它偽造日誌或診斷結論 |
| `wifi_profile` | 可能含 SSID／密碼；不要整份列印、交作業或放入 AI context |
| `config.set` | BarePico 有此方法；Carrier 沒有同名共用契約；不屬本頁學生讀取流程 |

不同家族可能以不同鍵描述同類周邊，不能從別的家族推導不存在的欄位。DM 管理持久化配置；學生程式不呼叫保存、覆寫、還原或直接修改內部 data。若需要新配置，先在 DM 完成合法設定，再重建程式的 Mango 物件。

## 錯誤、缺值與重新載入

缺少一般鍵不會由 `get` 拋錯；它回傳 default。傳入無法作為字典鍵的物件可能引發 `TypeError`。後續若直接對錯誤型別呼叫 `.get()` 或做算術，也會產生一般 Python 錯誤，因此 Guide 先檢查型別。Guide 中的自訂 `ValueError`／`RuntimeError` 是範例的前置檢查，不是宣稱 `config.get` 自動做了這些驗證。

配置在 Mango 建立／Runtime 載入時取得；此查詢不監看設定檔。DM 變更後重新啟動程式，必要時按 DM 指示重啟裝置。部分 Wi-Fi facade 的重讀設計屬該服務，不能推導出一般 config 的即時同步。

查詢無 callback，不需要 Scheduler；若查詢後啟動周期工作，仍需依 [Scheduler Reference](scheduler.md) 驅動並清理。`close()` 用於結束 Mango，並非保存你修改過的配置。

## 最小完整範例

```python
from mangobox import Mango

m = Mango()
try:
    target = m.config.get("target", "unknown")
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict):
        raise ValueError("enabled_modules must be a dictionary")
    print("target:", target)
    print("LED module enabled:", bool(modules.get("led_strip", False)))
finally:
    m.close()
```

完整具名裝置檢查與互動選取請見 [Runtime Config Guide](../guides/runtime-config.md)。本例只輸出兩項必要資訊，不使用 `as_dict()` 或整份配置 dump。

## 相關介面

[生命週期](lifecycle.md) · [Scheduler](scheduler.md) · [DHT11 家族差異](dht11.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/runtime/config.py`
- `runtime/mangolite-pico2w/firmware/mangolite/runtime/config.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/barepico/firmware/barepico/config.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
