# Scheduler 指南：短 callback、明確週期與前景處理

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 的介面與執行模式請依 Host profile 文件核對。

## 1. 可以完成什麼？

Scheduler 讓作品定期更新一個畫面、觀察輸入或安排稍後處理的要求。它採合作式執行：一個 callback 返回後，其他工作才有機會繼續。它不是另一條執行緒，也不是準確到毫秒的硬體中斷。

`m.scheduler` 是八個候選 HLMP 目標現有的 Runtime 物件；兩個家族實作仍有差異，需以本頁候選來源為準。Host Python 不使用這份巢狀排程契約。

## 2. 30 秒快速測試：計數五次後結束

此例不需要周邊配置，約五秒完成。callback 每次只增加計數；主程式在 `run_once()` 返回後顯示新的值。

```python
from mangobox import Mango
import time

m = Mango()
task_id = None
state = {"ticks": 0}

def tick():
    state["ticks"] += 1

try:
    task_id = m.scheduler.add_task(tick, period=1000)
    shown = 0
    while shown < 5:
        m.run_once()
        if state["ticks"] != shown:
            shown = state["ticks"]
            print("tick:", shown)
        time.sleep_ms(10)
finally:
    if task_id is not None:
        m.scheduler.remove_task(task_id)
    m.close()
```

`tick` 沒有括號，表示把函式交給 Scheduler。若寫 `tick()`，會在註冊當下先執行函式，傳入的就不是你要稍後執行的 callback。

## 3. 應該觀察什麼？

應依序看到 1～5，約一秒一個值。`period=1000` 是檢查到期的間隔，不是 callback 的總運作時間，也不是精確時鐘。別的工作較慢時，這些更新會延後；Scheduler 不會替你補跑所有錯過的週期。

`add_task()` 回傳一個整數 task ID。Carrier 的第一個 ID 可以是 **0**，因此清理時檢查 `is not None`，不能寫 `if task_id`。`remove_task()` 只取消這個任務，不代表燈已熄滅、馬達已停或已排隊的音訊已清空。

## 4. 常見使用：週期、一次性與執行迴圈

| 需求 | 寫法／規則 |
|---|---|
| 重複工作 | `add_task(callback, period=1000)`；callback 無參數，回傳值忽略 |
| 延後一次 | 加 `once=True`；到期前必須持續驅動主迴圈 |
| 停止自己的工作 | 保存回傳 ID，再用 `remove_task(id)` |
| 沒有前景工作 | 可在註冊後使用一次 `run_forever()`，配合 `finally: close()` |
| 有模式切換或多元件操作 | callback 設旗標，在 `run_once()` 返回後處理 |

共同程式明確傳入整數 `period >= 10`。BarePico 省略時預設 50 ms、會拒絕小於 10 的值；Carrier 必填，還會轉型與限制負值為 0。教材不利用這些差異來寫高頻忙迴圈。

不要呼叫 `m.scheduler.clear()` 停一個效果；它會清掉共享任務，連感測器、按鈕、音訊與時間服務也可能受影響。學生也不直接使用 `scheduler.run()`；MangoX2 的 `run_once()` 還負責 callback 佇列處理。

## 5. 完整互動範例：三秒後改變更新速度

先輸入 500～2000 ms。三秒後，一次性 callback 只要求變速；主程式取消自己的舊計數任務，再用較短間隔建立新任務。總觀察時間約八秒，輸出限制為每秒摘要與一次變速通知。

```python
from mangobox import Mango
import time

m = Mango()
tick_id = None
change_id = None
state = {"ticks": 0, "change_requested": False}

def tick():
    state["ticks"] += 1

def request_change():
    state["change_requested"] = True

try:
    period = int(input("Initial period in ms (500..2000): "))
    if not 500 <= period <= 2000:
        raise ValueError("Choose 500..2000 ms")
    tick_id = m.scheduler.add_task(tick, period=period)
    change_id = m.scheduler.add_task(request_change, period=3000, once=True)
    start = time.ticks_ms()
    last_second = -1
    while time.ticks_diff(time.ticks_ms(), start) < 8000:
        m.run_once()
        if state["change_requested"]:
            state["change_requested"] = False
            m.scheduler.remove_task(tick_id)
            tick_id = None
            period = max(100, period // 2)
            tick_id = m.scheduler.add_task(tick, period=period)
            print("New period:", period)
        second = time.ticks_diff(time.ticks_ms(), start) // 1000
        if second != last_second:
            last_second = second
            print("elapsed:", second, "ticks:", state["ticks"])
        time.sleep_ms(10)
finally:
    if tick_id is not None:
        m.scheduler.remove_task(tick_id)
    if change_id is not None:
        m.scheduler.remove_task(change_id)
    m.close()
```

`once=True` 的要求執行後會自行移除；最後再次用它的 ID 清理是可接受的。跨家族程式不依賴移除的回傳值：Carrier 回 `None`，BarePico 回是否真的找到任務的 `bool`。

把這個旗標模式延伸到燈效、聲音或顯示切換時，仍在前景做複雜動作。單一旗標會合併尚未處理的多次要求；若要求不能遺失，另外設計有上限的佇列。

## 6. 模式、延遲與問題排除

先確認所選韌體有此 Runtime 物件，且主迴圈確實持續運作。任務沒觸發時檢查是否傳了函式、`period` 單位是否為 ms、是否被其他長 callback／`sleep`／`input` 阻塞，再查相關模組的 enabled、名稱與 GPIO。

不要在 callback 裡呼叫 `run_once()`、`run_forever()` 或遞迴呼叫自己來等待工作。MicroPython 的堆疊較淺，多層同步硬體切換即使沒有邏輯上的無限迴圈，也可能造成 recursion depth 錯誤；前景旗標處理可降低巢狀深度。

Scheduler 會捕捉一般 callback `Exception` 並印出提示；重複工作可能繼續排程，不等於錯誤已被修好，也不保證所有失敗已寫成標準事件。`@@MANGO_EVENT@@` 由 Runtime 管理，學生不手動製造日誌列。觀察狀態改變，避免每次 poll、每顆 LED 或每影格印訊息。

## 7. 小挑戰

增加第二個獨立計數任務，用不同週期更新。三秒後只取消第一個，確認第二個仍繼續。再替兩個任務各保留 ID，解釋為何不需要全域清空。若加入自訂 LED 動畫，從 DM 讀取具名燈條的 `leds`，每次只計算一個畫面，先用較慢間隔觀察效果。

[Scheduler API Reference](../reference/scheduler.md) · [Runtime Config](runtime-config.md) · [生命週期](lifecycle.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/runtime/scheduler.py`
- `runtime/mangolite-pico2w/firmware/mangolite/runtime/scheduler.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_callback_queue.py`
- `runtime/barepico/firmware/barepico/core.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
