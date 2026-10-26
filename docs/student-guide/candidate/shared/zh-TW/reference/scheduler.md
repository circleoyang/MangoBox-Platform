# Scheduler API Reference：註冊與取消自己的任務

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 的介面與執行模式請依 Host profile 文件核對。

## 適用範圍與定位

八個候選 HLMP 目標都有 `m.scheduler`，但 Carrier 與 BarePico 並非同一個 Scheduler 類別。這是目前可存取的 Runtime 介面，不應宣稱為所有歷史或未來版本完全一致的高階封裝。Host Python 不套用本契約。此頁不需周邊或無線硬體；完整目標 ID 見 [生命週期 Reference](lifecycle.md)。

## `add_task` 簽章與差異

| 項目 | MangoX2／MangoLite | BarePico |
|---|---|---|
| 簽章 | `m.scheduler.add_task(callback, period, once=False)` | `m.scheduler.add_task(callback, period=50, once=False)` |
| `callback` | 來源不先驗證 callable；到期才呼叫 | 必須可呼叫，否則 `TypeError` |
| callback 參數／回傳 | 無參數；回傳值忽略 | 無參數；回傳值忽略 |
| `period` | 必填，來源採 `max(0, int(period))`，單位 ms | 預設 50 ms；必須 `type(period) is int` 且至少 10 |
| `once` | 預設 False；轉成 `bool` | 預設 False；必須為 `bool` |
| 回傳 | `int` task ID，第一個可為 0 | `int` task ID，由 1 遞增 |

**共同使用規範：傳 callable、明確整數 `period >= 10`、明確 bool `once`。** 不把 Carrier 容許的負值、字串或 0 ms 當作跨板功能；也不要省略週期而依賴 BarePico 預設。

第一次執行要等註冊後的 period 到期，而且當時必須有事件迴圈推進。`once=True` 在執行一次後移除；普通 callback `Exception` 被捕捉時也不會把它變成自動重試的一次性任務。每輪只處理到期工作，不補齊所有錯過的時槽。這不是硬即時保證。

## `remove_task` 簽章與回傳

| 項目 | MangoX2／MangoLite | BarePico |
|---|---|---|
| 簽章 | `m.scheduler.remove_task(task_id)` | `m.scheduler.remove_task(ident)` |
| 參數 | 自己保存的整數 ID；`None` 直接略過 | 自己保存的整數 ID |
| 找到任務 | 移除，回 `None` | 移除，回 `True` |
| 不存在／已取消 | 合法但未使用的整數 ID 沒有動作，回 `None` | 回 `False` |

ID 只在建立它的 Scheduler／Mango 生命週期中有意義，不能跨重新建立的物件使用，也不要猜 ID。ID 0 是合法值。跨板程式忽略取消的回傳，依自己保存的狀態管理任務。

取消不會中斷正在執行的 Python callback，也不會自動撤銷它已送出的硬體指令。若要停止輸出，用該模組正式停止方法；若要切換多個任務，先設旗標，在 `run_once()` 返回後取消與註冊自己的工作，避免修改同一輪的工作集合造成難以理解的順序。

## 執行、例外與禁止的捷徑

- 使用 `m.run_once()` 或 `m.run_forever()` 驅動；前者適合前景旗標，後者適合已註冊的簡短工作。
- `m.scheduler.run()` 是 Runtime 內部推進入口；不要用它替代 Mango 入口，尤其 X2 還有 callback 佇列要處理。
- `m.scheduler.clear()` 會刪除共享任務，學生不用它取消單一效果。Runtime 自己在結束時清理是另一件事。
- 不從 callback 再進入 Scheduler／事件迴圈、不遞迴等待、不長時間 sleep。callback 越慢，其他工作越晚。
- callback 的普通 `Exception` 被印出後，重複任務通常仍存在；例外處理不是工作成功證明，也不是完整 canonical 日誌承諾。

BarePico 有 Scheduler 重入防護，但不能以此寫出遞迴事件迴圈；Carrier 不提供同一保護契約。兩族 callback 在同一執行緒合作執行，沒有自動平行化、硬即時期限或工作取消的搶占保證。

## 參數錯誤與診斷

| 情況 | 來源行為／應對 |
|---|---|
| Carrier 少傳 `period` | Python `TypeError` |
| Carrier 的 `period` 不能轉為整數 | 一般轉型 `TypeError`／`ValueError` |
| BarePico 的 `period` 為 bool、非整數或小於 10 | `ValueError` |
| BarePico 的 callback 不可呼叫 | `TypeError` |
| BarePico 的 `once` 不是 bool | `TypeError` |
| Carrier 傳入不可呼叫 callback | 可能先註冊成功，到期後才由 Scheduler 印出呼叫錯誤 |
| 取消時傳錯型別 | 可能觸發比較、索引或雜湊的 `TypeError`；只使用真正回傳的 ID |
| 長任務／同步輸入堵住 | 其他 callback 延遲；改成短步驟與前景旗標 |

Scheduler 本身的註冊或每次 tick 不保證產生 Student API 結構化事件。不要手動印 `@@MANGO_EVENT@@`，也不逐輪列印當作觀測。Guide 的輸出限速是教學觀察策略，不是 Runtime 自動替任意 `print()` 限流。

## 最小完整範例：延後一次，再在前景結束

```python
from mangobox import Mango
import time

m = Mango()
task_id = None
state = {"due": False}

def request_finish():
    state["due"] = True

try:
    task_id = m.scheduler.add_task(request_finish, period=1000, once=True)
    while not state["due"]:
        m.run_once()
        time.sleep_ms(10)
    print("The one-shot request was handled")
finally:
    if task_id is not None:
        m.scheduler.remove_task(task_id)
    m.close()
```

本例正常時約一秒結束。已執行的一次性任務再次取消會有不同回傳，程式不依賴它。`finally` 清理自己的 ID 並關閉物件；不要在 close 後再推進任務。

## 相關介面

[Scheduler Guide](../guides/scheduler.md) · [生命週期](lifecycle.md) · [Runtime Config](runtime-config.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/runtime/scheduler.py`
- `runtime/mangolite-pico2w/firmware/mangolite/runtime/scheduler.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_callback_queue.py`
- `runtime/barepico/firmware/barepico/core.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
