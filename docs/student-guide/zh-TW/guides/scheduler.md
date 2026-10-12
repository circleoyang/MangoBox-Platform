# MangoBox Scheduler — 自訂輪詢與週期任務教學

適用：**High-Level MicroPython**（MangoLite／MangoX2）。以下依目前 MangoBox Runtime 中 `Mango.scheduler` 與 `Scheduler` 實作撰寫；**不適用 Host Python／MangoThonny 上位機模式**。

> Scheduler 是目前可以由 `m.scheduler` 使用的 Runtime 排程物件。它尚不是已正式封裝、承諾跨版本相容的高階 Student API；日後版本若變動，請依官方文件調整。

## 為什麼需要 Scheduler？

自訂動畫、顯示畫面更新、感測器輪詢等工作，都需要「每隔一段時間執行一次」。使用 `while True` 搭配 `sleep()` 容易阻塞其他事件。MangoBox 內建的是 **cooperative scheduler（協作式排程）**：`m.run_forever()` 負責不斷檢查到期的工作；每個 callback 執行完後，其他任務才有機會執行。

```text
m.scheduler.add_task(更新函式, period=100)
                 │
                 └── 註冊要定期執行的函式
                           ↓
m.run_forever() → scheduler.run() → 到期？ → 呼叫 callback
                         ↑                     │
                         └──────── 下一次輪詢 ─┘
```

## 1. 最簡單的週期任務

```python
from mangobox import Mango

m = Mango()
counter = 0

def tick():
    global counter
    counter += 1
    print("tick =", counter)

task_id = m.scheduler.add_task(tick, period=1000)
m.run_forever()
```

每隔約 1000 ms 輸出一次計數值。**`period` 是更新間隔，不是任務的總執行時間，也不是精確的硬體中斷計時器。**

## 2. 自訂 LED 燈效：雙向交錯光波

下列範例只用 `m.led()`、`m.brightness()` 與 `m.led_off()` 等基本 LED API；**不使用 `rainbow()`、`breath()`、`led_start_meteor()` 或任何內建燈效**。燈珠數、名稱須與 Device Manager 設定相符。

```python
from mangobox import Mango

m = Mango()
STRIP = "strip1"       # 依 Device Manager 設定修改
LED_COUNT = 8          # 依實際燈珠數修改
PERIOD_MS = 100
phase = 0

def clamp(v):
    return max(0, min(255, int(v)))

def color(r, g, b):
    return "#{:02x}{:02x}{:02x}".format(
        clamp(r), clamp(g), clamp(b)
    )

def distance(a, b):
    d = abs(a - b)
    return min(d, LED_COUNT - d)

def draw_frame():
    global phase
    a = (phase * 0.25) % LED_COUNT
    b = (LED_COUNT - phase * 0.25) % LED_COUNT

    for i in range(LED_COUNT):
        cyan = max(0, 1 - distance(i, a) / 2.5)
        pink = max(0, 1 - distance(i, b) / 2.5)
        flash = cyan * pink
        r = 2 + 5 * cyan + 150 * pink + 85 * flash
        g = 3 + 115 * cyan + 8 * pink + 85 * flash
        blue = 12 + 155 * cyan + 100 * pink + 85 * flash
        m.led(i, color(r, g, blue), strip=STRIP)

    phase += 1

m.led_off(strip=STRIP)
m.brightness(50, strip=STRIP)
task_id = m.scheduler.add_task(draw_frame, period=PERIOD_MS)
m.run_forever()
```

此設計每次 callback 更新 `LED_COUNT` 顆燈。燈條較長時，逐顆呼叫 `m.led()` 的成本增加，應放慢 `PERIOD_MS` 或改採已驗證的批次更新方法；不要自行臆測存在 `set_pixels()`、`show_frame()` 等 MangoBox API。

## 3. 與 Button callback 共存

```python
# 接續前一範例，在 m.run_forever() 之前加入：
active = True

def toggle():
    global active, task_id
    if active:
        m.scheduler.remove_task(task_id)
        task_id = None
        m.led_off(strip=STRIP)
        active = False
    else:
        task_id = m.scheduler.add_task(
            draw_frame, period=PERIOD_MS
        )
        active = True

m.on_pressed("button", toggle)
m.start_button()
```

按鈕名稱必須與裝置設定一致。停止排程後會保留 `phase`，再次啟動可從原進度繼續。不要同時註冊多個控制同一燈條的動畫工作，避免互相覆蓋。

## 4. 參數與常見錯誤

| 操作 | 說明 |
|---|---|
| `m.scheduler.add_task(callback, period, once=False)` | 註冊 callback；`period` 單位 ms，`once=True` 只執行一次 |
| `m.scheduler.remove_task(task_id)` | 取消指定任務；使用註冊回傳的 ID |
| `m.scheduler.clear()` | 清空**所有**任務；可能連按鈕與感測器輪詢也受影響，學生通常不應使用 |
| `m.run_once()` | 手動執行一次 Scheduler 檢查，不是強制執行全部 callback |
| `m.run_forever(sleep_ms=10)` | 持續驅動排程；Ctrl+C 可中斷 |

- **不能寫 `add_task(draw_frame(), ...)`**：括號會立即執行函式，傳入的不是 callback。
- callback 應短小、非阻塞；不要在裡面使用長時間 `sleep()`、耗時迴圈或阻塞式 I/O。
- `period=0` 雖然目前實作允許，但會造成高頻執行；自訂 LED 建議從 80–150 ms 開始。
- 任務以「到期後呼叫一次」運作；callback 耗時過長可能拖延其他任務，沒有嚴格即時保證。
- `remove_task()` 是移除指定任務，不會自動熄燈；若需要熄燈請另外呼叫 `m.led_off()`。
- `m.run_forever()` 在程式最後呼叫一次即可；無須再包外層 `while True`。
- `scheduler.clear()` 會清空共享排程，**不可**當成「停止我的燈效」的通用做法。

## 5. 學習挑戰

試著設計完全不靠內建效果的「光波碰撞」、「每顆 LED 不同週期閃爍」或「多組感測器共同控制燈效」。設計時先思考每次 callback 要更新什麼狀態，再選擇更新間隔。

**相關教學**：[RGB LED 使用指南](guides/led.md) ／ [RGB LED API Reference](reference/led.md)
