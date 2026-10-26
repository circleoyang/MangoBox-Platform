# OLED：文字、進度條與儲存的動畫

> 適用於這次來源快照的 MangoX2、MangoLite、BarePico 高層 MicroPython 候選版。請先選對 target／Runtime；本頁不適用於 Host Python。來源檢查不代表螢幕實機驗收。

## 1. 可以完成什麼

讓 128×64 OLED 顯示文字、選單、感測進度或動畫。文字、繪圖、RAM 圖片與 Flash 媒體共用同一個螢幕；切換畫面時，先停掉前一個持續更新的工作。

先在 Device Manager 啟用 OLED，核對 I2C 的 SDA、SCL、位址和實際接線。BarePico 沒有板載 OLED，必須先設定外接模組。這版的第一次 OLED 操作會依設定建立螢幕，不需要學生另建第二個 I2C 物件。

## 2. 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
m.clear()
m.text("Hello Mango", x=0, y=0, size=1)
m.run_forever()
```

先用英文測試，避免接線問題和中文字模問題混在一起。保留事件迴圈（event loop）可讓需排程的顯示工作繼續執行；不要在畫面送出後立刻關閉 Mango。

## 3. 預期觀察

左上角出現 `Hello Mango`。座標從左上角 `(0, 0)` 開始，x 向右、y 向下；有效像素為 x=0～127、y=0～63。`size=1` 是正常大小；這次候選來源也接受 1～3 倍、以 0.25 倍為單位的縮放。放大後必須重新考慮文字是否超出畫面。

## 4. 常見用途與 RAM／Flash 差別

| 用途 | 呼叫方式 | 需要先準備什麼 |
| --- | --- | --- |
| 文字與數值 | `text()` | OLED 已啟用；中文需既有字模 |
| 百分比 | `oled_progress(value)` | value 在 0～maximum 內 |
| 波形 | `oled_waveform(values)` | 1～128 筆整數，每筆都在 low～high 之間 |
| 選單 | `oled_menu(entries, selected=0)` | 非空文字項目；selected 從 0 開始 |
| 程式產生的單張圖片 | `show_image(bitmap)` | 1,024 bytes 的 MONO_VLSB 畫面 |
| DM 已存圖片／動畫 | `oled_play_media(name)` | 已按「儲存到 Pico Flash」，不是只有傳送 RAM |

`upload_image()` 的四個 slot 位於 RAM，斷電會消失。DM 儲存在 `/mb_oled/` 的 `.mbimg`／`.mbanim` 留在 Flash；斷電後仍可讀取，但不會自行播放。開機動畫仍需學生程式明確呼叫播放。

## 5. 完整互動：旋鈕控制進度條

先在 DM 啟用並設定具名電位器 `pot1`。callback（回呼函式）只保存讀值，在 `run_once()` 返回後更新畫面，避免巢狀呼叫把 Scheduler 再次帶入。

```python
from mangobox import Mango

m = Mango()
pending = None

def changed(value):
    global pending
    pending = value

m.on_pot_change(changed, threshold=2, period=100, name="pot1")
try:
    while True:
        m.run_once()
        if pending is not None:
            value = pending
            pending = None
            m.oled_progress(value, maximum=100)
finally:
    m.close()
```

`oled_progress()` 會重畫自己的畫面。不要另排一個每 100 ms 寫文字的工作同時爭用同一個 OLED。若要更複雜的整合介面，先設計單一更新流程。

### 播放 DM 已儲存的動畫

先在 DM 儲存 `welcome.mbanim`，最多 4 個影格，再執行：

```python
from mangobox import Mango

m = Mango()
print(m.oled_media_list())
info = m.oled_media_info("welcome")
print(info["frames"], info["period_ms"])
m.oled_play_media("welcome", duration=5000)
try:
    while True:
        m.run_once()
finally:
    try:
        m.oled_stop_media()
    finally:
        m.close()
```

`welcome` 會補成 `welcome.mbanim`；單張圖片要明寫例如 `logo.mbimg`。播放前會驗證 CRC32。`info["verified"]` 只表示檔案格式與校驗通過，不是 OLED 實體顯示通過。`started=True` 也不能當作肉眼已看到動畫。清單與檔案資訊查詢只讀取 Flash，不會為了查詢而建立 OLED；真正播放才需要合法且已啟用的螢幕。

## 6. 版本、限制與問題排除

本頁候選版才包含進階繪圖、RAM 圖片與 Flash 媒體。舊穩定版的 `show_image()` 可能仍是保留方法；不要只看名稱相同就套用新教學。

中文選單不是任意 Unicode 字型引擎。請先由 DM 準備所需字模；字模缺少或字級使選項超寬時，先修正內容，不要重新建立 OLED Driver。

排錯順序：確認所選 profile 的 API → DM 模組 enabled → I2C／GPIO／位址 → DM 原有預覽及實機操作 → 上方英文最小程式 → VCC、GND、SDA、SCL。圖片能顯示但動畫停在第一張時，檢查事件迴圈是否持續、是否被其他文字或繪圖覆蓋。

媒體清單為空，先確認是否真的存到 Flash。遇到 `.part`／`.bak`、CRC 不符或格式不是 v2，回 DM 處理未完成的媒體儲存，不要在學生程式刪檔修復。

## 7. 小挑戰

儲存兩組不同動畫，使用一個按鈕切換。按鈕 callback 只更新「要播放哪一組」，主迴圈再呼叫 `oled_play_media()`。試著說明：哪份資料留在 Flash？哪個工作需要 Scheduler？為什麼不能每一圈都重播同一個檔案？

完整參數與回傳差異請看 [OLED API Reference](../reference/oled.md)。
