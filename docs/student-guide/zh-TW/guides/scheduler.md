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

## 2. 已實機驗證範例：Quantum Ripple 雙星量子漣漪

本範例已由使用者使用 MangoBox High-Level MicroPython 實機測試成功。它**沒有使用內建特效函式**，而是由學生自行計算各顆 LED 的顏色，並註冊到 MangoBox Scheduler。

**重要：不再把 `LED_COUNT` 寫死。** 只要在 Device Manager 中設定並啟用名為 `strip1` 的燈條，程式便能透過 `m.config.get("led_strips", {})` 讀取該燈條的 `leds`、`pin` 與 `enabled`。如名稱不同，僅修改 `STRIP`；若 DM 修改設定，請重新啟動程式以重新載入 Runtime Config。

```python
from mangobox import Mango

m = Mango()

# 使用 Device Manager 中定義的燈條名稱
STRIP = "strip1"
PERIOD = 100

# 直接由 Runtime Config 讀取 DM 儲存的燈珠數量
strips = m.config.get("led_strips", {})
spec = strips.get(STRIP)
if not isinstance(spec, dict):
    raise ValueError("找不到燈條：" + STRIP)
if not spec.get("enabled", False):
    raise ValueError("燈條尚未啟用：" + STRIP)

LED_COUNT = int(spec["leds"])
if LED_COUNT <= 0:
    raise ValueError("LED 數量必須大於 0")

print("燈條：", STRIP)
print("燈珠數量：", LED_COUNT)
print("GPIO：", spec.get("pin"))

phase = 0

def ring_distance(a, b):
    d = abs(a - b)
    return min(d, LED_COUNT - d)

def clamp(value):
    return max(0, min(255, int(value)))

def rgb(r, g, b):
    return "#{:02x}{:02x}{:02x}".format(
        clamp(r), clamp(g), clamp(b)
    )

def quantum_ripple():
    global phase
    pos1 = (phase * 0.25) % LED_COUNT
    pos2 = (LED_COUNT - phase * 0.25) % LED_COUNT

    for i in range(LED_COUNT):
        d1 = ring_distance(i, pos1)
        d2 = ring_distance(i, pos2)
        wave1 = max(0, 1 - d1 / 2.5)
        wave2 = max(0, 1 - d2 / 2.5)
        overlap = wave1 * wave2

        r = 2 + 5 * wave1 + 150 * wave2 + 85 * overlap
        g = 3 + 115 * wave1 + 8 * wave2 + 85 * overlap
        b = 12 + 155 * wave1 + 100 * wave2 + 85 * overlap
        m.led(i, rgb(r, g, b), strip=STRIP)
    phase += 1

m.led_off(strip=STRIP)
m.brightness(50, strip=STRIP)
task_id = m.scheduler.add_task(quantum_ripple, period=PERIOD)
print("Quantum Ripple started")
m.run_forever()
```

### 這個範例教會了什麼？

1. **設定與行為分離**：燈條名稱在程式中選取，燈珠數、腳位及啟用狀態由 DM 設定查詢，不要硬編碼。
2. **具名模組查詢**：`m.config.get("led_strips", {}).get(STRIP)`，取得後先檢查存在與啟用狀態。
3. **自訂更新函式**：`quantum_ripple()` 每次只更新一個畫面，不內含阻塞式 `while True` 或 `sleep()`。
4. **註冊協作式排程**：`m.scheduler.add_task(quantum_ripple, period=PERIOD)`，再使用 `m.run_forever()` 驅動。
5. **避免假想 API**：不要為了查詢燈珠數自行虛構 `m.led_count()`、`m.led_info()`、`m.get_strip()` 等尚未正式實作的方法。

> `m.config.get()` 是現有 High-Level MicroPython Runtime Config 的查詢能力；這個範例不是 Host Python。其他感測器可能使用不同的配置鍵與資料結構，不應一律假設都有 `led_strips` 形式。此燈效逐顆更新 LED，較長燈條可調大 `PERIOD` 降低排程負擔。

## 3. 與 Button callback 共存：延後處理複雜操作（實機驗證）

**MangoBox 壓克力音樂燈盒 v2.2.2 實機案例：** button8 放開時若直接在按鈕輪詢 callback 呼叫切換模式，接著執行 `led_off()`、停止舊效果、註冊新效果及切換音樂，MicroPython 可能因巢狀同步呼叫太深而發生：

```text
[Scheduler] task error: maximum recursion depth exceeded
```

Traceback 顯示呼叫鏈由 `digital_input._step()` → `button_released()` → `apply_mode()` → `MangoEffects._start()` → `stop()` → `led_off()`，**不是無限遞迴的證據，也不能將錯誤歸因於蜂鳴器或動畫公式**。此案例將切換工作移至主迴圈後，已由使用者實機驗證恢復正常。

**設計原則：Button／Sensor callback 只記錄事件（flag、目標模式）；主迴圈在 `m.run_once()` 返回後，才執行複雜的硬體操作、燈效切換及音樂切換。** 簡單且已確認安全的 callback 不必全部延後，但跨多模組的切換流程宜採此架構。

以下為可直接執行的**最小範例**。燈效本身使用既有的 `m.led_all()`，以便專注呈現事件處理；實際專題可將 `apply_mode()` 改為呼叫 `fx.dual_star()`、`fx.quantum_ripple()`、`m.stop_song()` 等。

```python
from mangobox import Mango

m = Mango()
STRIP = "strip1"   # 需與 DM 已啟用的燈條名稱一致
COLORS = ("red", "blue", "green")
mode = 0
pending_mode_change = False

def button_released():
    # Scheduler callback：只記錄需求，不執行 led_off / 動畫切換
    global pending_mode_change
    pending_mode_change = True

def apply_mode():
    m.led_off(strip=STRIP)
    m.led_all(COLORS[mode], strip=STRIP)
    print("mode =", mode)

m.on_released("button8", button_released)
m.start_sensor("button8", period=50)
apply_mode()

try:
    while True:
        m.run_once()
        if pending_mode_change:
            # 清除 flag，避免同一個按鈕事件重複執行
            pending_mode_change = False
            mode = (mode + 1) % len(COLORS)
            apply_mode()
except KeyboardInterrupt:
    m.led_off(strip=STRIP)
```

此模式由主迴圈持續呼叫 `m.run_once()`；**不要在同一個主程式中再呼叫 `m.run_forever()`**，否則前述 flag 處理沒有機會執行。若要同時檢查長按 3 秒、音樂循環或其他狀態，也放在同一個主迴圈中處理。需要避免忙碌輪詢時，可在迴圈底部使用很短的 `time.sleep_ms(10)`，但不要阻塞 3 秒等待長按。

當事件短時間密集發生而不允許遺失時，請以有界佇列記錄事件；單一 flag 會合併尚未處理的多次事件。關閉單一自訂燈效應使用其任務 ID：`m.scheduler.remove_task(task_id)`，**不可使用 `m.scheduler.clear()`**，以免同時刪除按鈕、感測器與音樂的任務。

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
