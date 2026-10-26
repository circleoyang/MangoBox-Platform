# 生命週期指南：建立、持續處理事件與結束

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 的介面與執行模式請依 Host profile 文件核對。

## 1. 可以完成什麼？

一個會持續反應的作品，需要先建立 `Mango()`、準備要用的元件與 callback，再持續驅動事件迴圈，最後關閉這個物件。註冊了任務不代表它會自己在背景執行；沒有讓出執行機會，按鈕、感測器、動畫與音訊服務就可能停在等待狀態。

本頁適用八個候選 HLMP 目標：MangoX2 的 Pico／Pico W／Pico 2 W、MangoLite 的 Pico W／Pico 2 W，以及 BarePico 的 Pico／Pico W／Pico 2 W。共同匯入方式是 `from mangobox import Mango`。BarePico 沒有載板預設周邊；外接元件需另在 DM 明確啟用與配置。

## 2. 30 秒快速測試：建立一次，再正常結束

```python
from mangobox import Mango

m = Mango()
try:
    info = m.capabilities()
    if isinstance(info, dict):
        print("target:", info.get("target"))
        print("wireless hardware:", info.get("wireless_capable"))
    elif isinstance(info, list):
        print("configured capabilities:", ", ".join(info))
    else:
        raise RuntimeError("Check the selected firmware profile")
    m.run_once()
    print("One event-loop pass completed")
finally:
    m.close()
```

這個測試只查能力資訊並推進一次事件迴圈。它沒有註冊新的硬體工作，也不代表已接上感測器、網路或喇叭。`finally` 讓正常完成或讀取過程發生錯誤時，都有機會執行清理。

## 3. 應該看到什麼？

| 家族 | `capabilities()` 的實際資料形狀 | 可以判讀的資訊 |
|---|---|---|
| MangoX2／MangoLite | `list[str]` | 能力表中目前已啟用且存在對應方法的項目 |
| BarePico | `dict` | `target`、`mcu_family`、無線硬體與載板旗標 |

BarePico 的 `wireless_capable=True` 只代表所選板型有無線硬體，不等於已連上 Wi-Fi，也不等於所有無線 facade 均已安裝。Carrier 的能力表也不是完整 vNext 方法清單；未列出一個新服務，不能直接推論它不存在。請以所選 profile 的 API Reference 判定。

最後應看到 `One event-loop pass completed`。啟動時可能另有 Runtime 的配置提示；不要把一行普通 `print()` 視為裝置測試通過的事件紀錄。

## 4. 常見使用：選擇一種主迴圈

| 作品需要 | 選擇 | 控制權在哪裡？ |
|---|---|---|
| 工作都已註冊，callback 簡短 | `m.run_forever()` | Mango 持續檢查到期任務，直到中止或關閉 |
| 需處理旗標、期限或跨模組切換 | 自己的迴圈中呼叫 `m.run_once()` | 每次返回後，由主程式決定下一步 |

同一段主流程選一種驅動方式。不要在 `run_once()` 的迴圈內再呼叫 `run_forever()`，也不要在 callback 中呼叫任一事件迴圈方法。MangoX2 會在 `run_once()` 中處理自己的 callback 佇列，因此學生程式也不應改呼叫 `m.scheduler.run()` 取代它。

Carrier 的 `run_forever()` 在退出時會自動 `close()`；BarePico 需由呼叫端負責清理。共同寫法仍保留 `try/finally: m.close()`。如果作品需要先送停止命令、推進音訊佇列，再關閉服務，請使用前景 `run_once()` 迴圈，將停止程序放在 `close()` 之前。

## 5. 完整互動範例：由你決定更新幾次

先在 Shell 輸入 1～10，再開始排程。callback 只設定旗標；計數與顯示在 `run_once()` 返回後處理。

```python
from mangobox import Mango
import time

m = Mango()
task_id = None
state = {"pending": False, "count": 0}

def request_update():
    state["pending"] = True

try:
    limit = int(input("How many updates (1..10)? "))
    if not 1 <= limit <= 10:
        raise ValueError("Choose an integer from 1 to 10")
    task_id = m.scheduler.add_task(request_update, period=1000)
    while state["count"] < limit:
        m.run_once()
        if state["pending"]:
            state["pending"] = False
            state["count"] += 1
            print("Update", state["count"], "of", limit)
        time.sleep_ms(10)
finally:
    if task_id is not None:
        m.scheduler.remove_task(task_id)
    m.close()
```

輸入 3 時，應約每秒出現一次更新，共三次後結束。`input()` 放在註冊任務之前；若把阻塞式輸入放進運作中的迴圈，等使用者打字期間就無法持續處理事件。10 ms 短暫等待讓迴圈不必空轉；它不是精確的即時計時承諾。

這個旗標會合併尚未處理的重複要求，適合「有更新即可」的工作。若每次事件都必須保存，應設計有大小上限的事件佇列，並明確決定滿載時怎麼處理。

## 6. 模式、版本與問題排除

先核對執行模式與 profile，再查模組 enabled、具名設定與 GPIO，接著用 DM 和最小程式診斷，最後檢查實體接線與供電。Host Python 是電腦上的另一套執行模式，不能因為同樣叫 Mango 就貼用本頁的板端 `config`、Scheduler 或 `time.sleep_ms()`。

原始碼 SHA、板端韌體版本、MangoThonny 應用程式版本是三件事。選定候選來源或安裝新的 IDE，不代表八個板型都已燒錄或實機驗收；音訊 overlay 也要單獨核對。結束後若要再運作，重新建立 `Mango()`，不要依賴不同家族對已關閉物件的偶然行為。

Runtime 的結構化紀錄標記是 `@@MANGO_EVENT@@`。學生不要自己印這個標記、拼事件 JSON 或編造 canonical ID。只對有意義的狀態改變做簡短觀察，不逐幀、不每圈列印感測值，也不輸出配置中的憑證。Scheduler 可能捕捉並印出 callback 的 `Exception`；這不保證所有 Python 例外都變成完整的 `run_error` 紀錄。

## 7. 小挑戰

把計數例子改成「五秒後停止接受新更新，等目前工作結束再退出」。保留一個 Mango 與一個主迴圈；檢查 Ctrl+C 時是否仍執行 `finally`。延伸到多個元件前，先能說明每個 callback 的輸入、誰持有 task ID，以及結束時要釋放什麼。

[生命週期 API Reference](../reference/lifecycle.md) · [Scheduler](scheduler.md) · [Runtime Config](runtime-config.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_callback_queue.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_capabilities.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_pot.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api_ble_control.py`
- `runtime/barepico/firmware/barepico/student_ble_control_vnext.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
