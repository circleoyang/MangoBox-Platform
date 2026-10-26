# OLED API Reference（候選來源）

適用：所選 MangoX2 0.2.10-rc2、MangoLite 0.6.5-rc2、BarePico 0.1.0-rc6 的高層 MicroPython 來源。顯示、繪圖與播放方法需要合法、已啟用的 OLED 設定；BarePico 的螢幕為外接。`oled_media_list()`／`oled_media_info()` 只讀檔案系統，不要求先建立或啟用實體 OLED。Host Python 與舊穩定版不可由本頁推定支援。精確來源 commit 與本次驗證界線由 profile 附在頁首。

## 文字、清除與顯示生命週期

| 方法簽章 | 參數與語意 | 回傳 |
| --- | --- | --- |
| `m.text(text, x=0, y=0, size=1)` | text 轉為字串；x、y 為像素座標；size 建議 1～3、0.25 倍步階；換行依字級配置多行 | Carrier 為 `None`；BarePico 為送出結果 `True` |
| `m.send_text(text, x=0, y=0, size=1)` | 單行底層相容入口；一般教材用 `text()` | Carrier `None`；BarePico `True` |
| `m.clear()` | 清除畫面，等同 `clear_oled()` | Carrier `None`；BarePico `True` |
| `m.clear_oled()` | 清除同一 OLED 的畫面 | Carrier `None`；BarePico `True` |
| `m.clear_screen()` | `clear_oled()` 相容別名 | Carrier `None`；BarePico `True` |
| `m.flash_text(text, x=0, y=0, size=1, period=500, duration=0)` | period、duration 為 ms；duration=0 持續閃爍；需事件迴圈 | Carrier `None`；BarePico `True` |
| `m.start_flash_text(text, x=0, y=0, size=1, period=500, duration=0)` | 與 `flash_text()` 相同參數的相容入口 | Carrier `None`；BarePico `True` |

數值 size 會依目前 Driver 限制處理，不是任意字型點數。中文需字模快取；超長文字或越界內容不代表可自動縮小。動畫、閃爍及排程顯示需要 `run_forever()`，或前景持續呼叫 `run_once()`。兩者擇一；callback 中不得再次進入事件迴圈。

## 進階繪圖

| 方法簽章 | 參數型別、範圍與效果 |
| --- | --- |
| `m.oled_progress(value, maximum=100, x=0, y=18, width=120, height=12)` | 共用用法：整數數值與像素，1 ≤ maximum ≤ 10000、0 ≤ value ≤ maximum；寬高至少3，矩形放在畫面內；重畫進度畫面 |
| `m.oled_waveform(values, low=0, high=65535)` | 共用用法：values 為 1～128 個整數，每筆 low ≤ value ≤ high；0 ≤ low < high ≤ 65535；low/high 決定垂直尺度 |
| `m.oled_menu(entries, selected=0, size=1)` | 1～24 個非空單行字串，每項最多 24 字；selected 為有效索引；中文需既有字模且寬度可容納 |
| `m.oled_pixel(x, y, color=1)` | x=0～127、y=0～63；color 正規化成 0 或 1 |
| `m.oled_line(x, y, x2, y2, color=1)` | 起點與終點均在畫面內；像素整數 |
| `m.oled_rect(x, y, width, height, color=1, fill=False)` | 正寬高且矩形完整落在畫面內；fill=True 填滿，False 只畫邊框 |

Carrier 這組 API 回傳送出的 command `dict`；BarePico 成功處理回傳 `True`。這些回傳值不是「實機已正確顯示」的證據。輸入會經 `int()`／`bool()` 等轉換，錯誤可能由 facade 拋出，也可能由 Carrier Runtime 回報；請先用上述範圍驗證資料，再觀察實際畫面。不要為了取得 boolean 成功值自行改寫 Driver。

同名繪圖有家族差異：Carrier 進度條檢查完整矩形是否在畫面內，maximum 沒有10000上限；BarePico 將 maximum 限為10000，其他幾何錯誤可能由畫布路徑回報。Carrier 波形要求每筆本來就是整數且位於 low～high，並把樣本鋪滿畫面寬度；BarePico 會先轉為整數、將超範圍值裁至邊界，水平方向每筆占一個像素。跨家族教材請採上表共同範圍，不依賴自動轉型或相同像素配置。

選單也不是完全相同的排版：BarePico 的 ASCII、size=1 保留六列舊版選單；Carrier 的選單，以及 BarePico 的中文／其他字級路徑，按字高決定可見列數並檢查文字寬度。`selected` 都是完整 entries 清單的索引。

```python
from mangobox import Mango

m = Mango()
m.oled_menu(["Play", "Light", "Stop"], selected=1, size=1)
m.run_forever()
```

## RAM 圖片與動畫

| 方法簽章 | 參數／回傳／錯誤 |
| --- | --- |
| `m.upload_image(bitmap, slot=0)` | bitmap 必須是恰好 1024 bytes 的 `bytes` 或 `bytearray`；128×64 MONO_VLSB；slot 為整數 0～3；成功送出回傳 `True`；錯誤型別、長度或 slot 拋 `ValueError` |
| `m.show_image(bitmap=None, slot=0)` | 提供 bitmap 會先上傳；省略則顯示已完成的 slot；Carrier 回傳 command dict、BarePico `True`；未完成 slot 不能顯示 |
| `m.start_image_loop(frames, period=500, duration=0)` | frames 為 list/tuple，含2～4個 slot 索引或 bitmap，最後對應的 slots 不得重複；period=100～10000 ms；duration 為非負 ms，0 持續；Carrier 回傳 command dict、BarePico `True` |
| `m.stop_image_loop()` | 移除該 OLED 的動畫工作；不刪 Flash 媒體，也不保證清空目前畫面；Carrier `None`、BarePico `True` |

bitmap 是畫面像素，不是 PNG/JPG 檔案 bytes。動畫 slots 不可重複；相同 bitmap 內容可以上傳到不同格。混合 bitmap 與 slot 時，bitmap 會上傳至其在 frames 中的位置索引，請避免最後指向同一格。上傳可能先於後續輸入錯誤發生，因此失敗不保證原 RAM slots 完全未變。Runtime 會在設定動畫時顯示第一張，其後由 Scheduler 輪播；`duration` 到期的停止也需要事件迴圈。

跨家族動畫請使用 `duration=0` 或至少10 ms。BarePico 的 Scheduler 要求 task period 至少10 ms，因此多影格動畫傳入1～9 ms，可能在第一張已顯示、動畫工作已建立後，才於新增停止工作時拋 `ValueError`；這不保證動畫自動停止，需在清理流程明確停止並 `close()`。

## `oled_media_list()`：列出 Flash 媒體

簽章：`m.oled_media_list()`。回傳排序後的 `list[str]`，只列合法 `.mbimg`／`.mbanim` 檔名；資料夾不存在時回傳空清單。目錄中以這兩種副檔名結尾的項目超過16個時，會在進一步過濾合法名稱前拋 `RuntimeError`。這一步只檢查檔名，不驗證每一個檔案的內容或 CRC，也不建立 OLED。

## `oled_media_info()`：讀取並驗證

簽章：`m.oled_media_info(name)`。name 為字串；省略副檔名時補 `.mbanim`。回傳 dict：`name`、`frames`、`period_ms`、`width=128`、`height=64`、`verified=True`。不更換螢幕畫面；verified 僅指檔案與 CRC。

## `oled_play_media()`：播放已存媒體

簽章：`m.oled_play_media(name, duration=0)`。duration 必須是整數 0～3600000 ms。先完整驗證，再載入既有 RAM 圖片流程。單張直接顯示；2～4 張啟動動畫。回傳 dict：`name`、`frames`、`period_ms`、`started=True`。單張圖片不因 duration 自動消失；duration 控制多影格動畫的停止時間。

多影格的跨家族用法仍應選0或10～3600000 ms，避免前述 BarePico 1～9 ms 停止排程限制；此邊界不影響本頁的5000 ms 範例。

## `oled_stop_media()`：停止媒體動畫

簽章：`m.oled_stop_media()`。委派給 `stop_image_loop()`，回傳遵循該 target 的方法。停止並不刪檔，也不重新寫入 Flash。重複查詢或停止不應產生逐幀 log。

## Flash 媒體共用規則、錯誤與範例

檔案在 `/mb_oled/`，檔名主體為 1～24 個 ASCII 英數、`-` 或 `_`，不能以 `_` 起頭；不接受路徑或任意副檔名。v2 格式為 `MBIM\x02`／`MBAN\x02`，每影格 1024 bytes、最多4張、period 100～10000 ms，含 CRC32。

- 名稱、格式、大小、CRC 不正確：`ValueError`。
- 檔案不存在或檔案系統失敗：`OSError`。
- 發現同名 `.part`／`.bak`：`RuntimeError`，回 DM 完成媒體交易處理。
- OLED 停用、設定衝突、I2C 或字模失敗：依 Runtime 路徑報錯；先修正設定。

```python
from mangobox import Mango

m = Mango()
name = "welcome.mbanim"
if name not in m.oled_media_list():
    raise RuntimeError("Save welcome.mbanim in Device Manager first")
info = m.oled_media_info(name)
m.oled_play_media(name, duration=5000)
try:
    while True:
        m.run_once()
finally:
    try:
        m.oled_stop_media()
    finally:
        m.close()
```

相關：`text()`、`show_image()`、`start_image_loop()`、`run_once()`、`run_forever()`、[OLED 使用指南](../guides/oled.md)。媒體寫入與刪除由 DM 處理；本頁沒有 `oled_play_sequence()` 或 `play_animation()` 這類未實作別名。
