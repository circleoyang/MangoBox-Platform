# Wi-Fi 使用指南：看懂連線狀態，再使用網路

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## 1. 可以完成什麼？

Pico W／Pico 2 W 可以連接無線路由器（STA），供 NTP 校時等功能使用；也可以在明確要求下建立自己的無線基地台（AP）。這兩種用途不同：AP 啟動不代表已經連上網際網路，也不會自動提供智慧互動控制台網頁。

本頁的共同介面適用 MangoX2、MangoLite、BarePico 的六個無線候選目標。MangoX2 + Pico 與 BarePico + Pico 可以查詢「不支援」，但不能啟動 Wi-Fi。BarePico 不因為沒有載板而失去 Pico W 本身的無線硬體。

## 2. 30 秒快速測試：先只讀狀態

```python
from mangobox import Mango

m = Mango()
try:
    state = m.wifi_status()
    print("supported:", state["supported"])
    print("connected:", state["connected"])
    print("state:", state["state"])
finally:
    m.close()
```

這個程式不會掃描附近網路，不會啟動 STA／AP，也不需要輸入密碼。請勿把整份 `m.config.as_dict()` 印出來當作診斷，因為其中可能包含教師儲存的 Wi-Fi 密碼。

## 3. 應該看到什麼？

| 狀態 | 意義 | 下一步 |
|---|---|---|
| `unsupported` | 目前目標沒有 Wi-Fi | 使用非網路功能或由電腦提供校時資料 |
| `off` | STA 尚未啟用 | 準備好 DM 中的真實 STA 配置後，明確呼叫連線 |
| `connecting` | 已提出連線要求 | 繼續查看狀態，不要重複呼叫 `wifi_connect()` |
| `connected` | STA 已確認連線 | 可進入 NTP 等下一個步驟 |
| `wrong_password`／`ap_not_found` | 驅動回報密碼或基地台問題 | 回 DM 檢查 SSID、密碼及現場訊號 |
| `disconnected` | 未連線，且不是上述已辨識狀態 | 查狀態碼及現場網路；不可假設已連上 |

`wifi_connect()` 回傳的 `started=True` 代表要求已接受，並非連線成功。即使硬體有 Wi-Fi，也仍需要可用路由器與正確設定。

## 4. 常見使用情境與配置

在 DM 設定真正要連接的 STA SSID／密碼，再使用無參數 `m.wifi_connect()`。設定中的預設名稱不代表已存在一組可用密碼；未儲存密碼時，API 會拒絕連線。網路不必叫「教室 Wi-Fi」，可以是已授權使用的實驗室或作品展示網路。

`wifi_name("sta")` 是 Pico 的 hostname，不是路由器 SSID。`wifi_name("ap")` 是這塊 Pico 計畫使用的 AP 名稱。名稱預設帶裝置識別尾碼，用來區分同一教室多塊板子；名稱不是密碼。

## 5. 完整範例：有期限的連線與狀態監看

前提：DM 已儲存正確 STA 配置，沒有其他 AP 或正在連線的服務占用無線介面。以下測試最多等待約 15 秒，結束時只斷開自己建立的連線。若沿用其他服務已完成的 STA 連線，則只觀察、不取得擁有權。

```python
from mangobox import Mango
import time

m = Mango()
try:
    state = m.wifi_status()
    if not state["supported"]:
        raise RuntimeError("This target has no Wi-Fi")

    if not state["connected"]:
        m.wifi_connect()  # Use the real STA credentials saved by Device Manager.

    started_at = time.ticks_ms()
    previous = None
    while time.ticks_diff(time.ticks_ms(), started_at) < 15000:
        m.run_once()
        state = m.wifi_status()
        if state["state"] != previous:
            print("Wi-Fi:", state["state"])
            previous = state["state"]
        if state["connected"]:
            print("Connection confirmed")
            break
        if state["state"] in ("wrong_password", "ap_not_found"):
            raise RuntimeError("Check the saved Wi-Fi profile in Device Manager")
        time.sleep_ms(50)
    else:
        raise RuntimeError("Wi-Fi connection timed out")
finally:
    if m.wifi_status().get("student_owned", False):
        m.wifi_disconnect()
    m.close()
```

`m.run_once()` 讓既有排程繼續前進，短暫 `sleep_ms(50)` 避免忙碌輪詢。將後續網路工作放在 `Connection confirmed` 之後、`finally` 之前；不要在仍連線中時開始 NTP。

## 6. 板型、執行模式與問題排除

先確認候選 profile、Pico 型號與 `wifi_status()["supported"]`，再檢查 DM 配置、是否已有 AP／STA 擁有者，最後檢查現場無線網路。無線訊號問題不需先改學生作品的 LED 或感測器邏輯。

`wifi_disconnect()` 只釋放本 Mango 物件建立的連線，不保證將 STA 電源關閉。因此「斷線後立刻開 AP」仍可能被 `STA is active` 擋下；不要繞過保護去重建 `network.WLAN`。回 DM 處理狀態或重新啟動後選擇單一用途。

AP 必須先在 DM 配置密碼，再明確呼叫 `wifi_ap_start()`。其他 Gateway／Mobile Hub 的 AP 不能由此學生物件關掉。不要為了測試而另起第二套 AP、私自關閉已有網路或把密碼放進作業。

Host Python 0.4.6 不能直接貼用本頁 Pico 程式；`machine`、`time.ticks_ms()` 與本頁 Wi-Fi facade 都屬板端環境。

## 7. 小挑戰

在不印出密碼的前提下，讓程式只在狀態改變時顯示一次訊息。完成後接上[校時教學](clock.md)，分別呈現「網路已連線」與「時間已校準」兩個結果。

[Wi-Fi API Reference](../reference/wifi.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/barepico/firmware/barepico/student_wifi_v2.py`
- `runtime/mangox2-pico/firmware/mangox2/student_wifi_v2.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_wifi_v2.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
