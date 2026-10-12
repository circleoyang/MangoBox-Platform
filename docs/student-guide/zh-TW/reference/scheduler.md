# MangoBox Scheduler API Reference（Runtime 排程介面）

適用於 MangoBox **High-Level MicroPython**；MangoLite / MangoX2 Runtime 目前透過 `m.scheduler` 提供此協作式排程介面。這是現有 Runtime 可存取的物件，**不是已承諾長期穩定的高階 Student API**。Host Python 並未公開等同介面，請勿混用。

```python
from mangobox import Mango
m = Mango()
```

## `m.scheduler.add_task(callback, period, once=False)`

註冊定期執行的函式，回傳任務 ID（非固定永久識別碼）。

| 參數 | 型別 | 說明 |
|---|---|---|
| `callback` | callable | 無參數函式物件，傳入名稱不要加 `()` |
| `period` | int | 每次預定執行間隔，**毫秒（ms）**；目前 Runtime 會取 `max(0, int(period))` |
| `once` | bool | `False` 週期執行（預設），`True` 到期後只執行一次 |

```python
def refresh():
    print("refresh")

task_id = m.scheduler.add_task(refresh, period=100)
m.run_forever()
```

## `m.scheduler.remove_task(task_id)`

取消任務。請保留 `add_task()` 回傳的 ID；目前 Runtime 的 `remove_task(None)` 為不執行任何操作，已刪除的 ID 不會立即重新排序。取消 LED 動畫不會自動熄燈。

```python
m.scheduler.remove_task(task_id)
m.led_off(strip="strip1")
```

## `m.scheduler.clear()`

清除 Scheduler 的**全部**任務。由於 `m.scheduler` 是共用的，可能連同按鈕、感測器等原本已註冊的工作一起移除。**請勿用它代替 `remove_task(task_id)`。**

## `m.run_once()` 與 `m.run_forever(sleep_ms=10)`

`m.run_once()` 只檢查「目前有哪些到期任務」；`m.run_forever()` 讓 Scheduler 持續運行，預設每次迴圈 sleep 約 10 ms，直到程式中止。

```python
m.scheduler.add_task(refresh, period=100)
m.run_forever()
```

## 原理與限制

- Scheduler 是協作式，不會搶先中斷正在執行的 callback，**不是**精準硬體 Timer。
- callback 內不可使用長時間阻塞；否則會拖慢其他感測器與按鈕事件。
- 短週期／長燈條的逐顆 LED 更新可能產生效能負擔，建議由 80–150 ms 開始測試。
- 自訂動畫只能使用目前該版本文件中存在的 LED API。不可虛構 batch-frame 更新方法。
- 以 `m.scheduler.add_task(refresh, 100)` 註冊函式；`refresh()` 會立即執行，不能傳給排程器。
- 沒有呼叫 `m.run_forever()`（或反覆呼叫 `m.run_once()`）時，註冊的任務不會持續運作。

請參考[Scheduler 完整教學](../scheduler.md)與[RGB LED 使用指南](../guides/led.md)。


## 已驗證：動態讀取 DM LED Strip 設定

[Quantum Ripple 完整範例](../guides/scheduler.md) 使用 `m.config.get("led_strips", {}).get(STRIP)` 查詢 DM 設定、檢查 `enabled` 並讀取 `int(spec["leds"])`，以此決定迴圈更新多少顆 LED。此方法不需新增 `led_count()` / `led_info()` 等查詢 API；請勿硬編碼燈珠數或編造查詢方法。


## Button／Sensor callback 的堆疊安全原則（v2.2.2 實機案例）

已確認一個 MicroPython 呼叫深度問題：在 `digital_input._step()` 排程 callback 中，`button_released()` 若直接執行 `apply_mode()` → 自訂燈效 `stop()` → `m.led_off()` 等長串同步硬體操作，可能出現 `[Scheduler] task error: maximum recursion depth exceeded`。**這不是「Scheduler 無法同時跑音樂與燈效」的證據**。經 v2.2.2 實機驗證，可改由 callback 設定 `pending_mode_change = True`，主迴圈執行 `m.run_once()` 返回後再呼叫 `apply_mode()`。

實作時，主迴圈使用 `while True: m.run_once(); ...`，**不要再呼叫 `m.run_forever()`**；只取消自己的動畫 task，不可 `m.scheduler.clear()`。完整範例請見 [Scheduler 教學：延後處理複雜操作](../guides/scheduler.md)。
