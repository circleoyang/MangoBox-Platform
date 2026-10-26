# BarePico 具名按鈕與數位事件 — API Reference

> 候選來源：v0.1.0-rc6；BarePico Pico / Pico W / Pico 2 W；High-Level MicroPython。這是來源核對，未宣告本輪 Windows 或實機驗收通過。

## 啟用、板型與模式

DM 啟用 `enabled_modules.button`，在 `buttons` 配置具名外接輸入的 `enabled`、`pin`、`active`、`pull`、`debounce_ms`。`active` 為 0 或 1；`pull` 為 `none/up/down`；去彈跳 0–5000 ms。BarePico 沒有固定板載按鈕。只有一個啟用按鈕時可用通用名稱 `button`，多顆時應使用確切名稱。

## 方法、精確簽章與回傳

所有預設值以下列簽章為準；使用 `from mangobox import Mango` 與 `m = Mango()`。

| 簽章 | 用途 | 回傳 |
| --- | --- | --- |
| `m.on(event_name, callback)` | 註冊接收值的一般事件 callback。 | `None` |
| `m.on_enter(sensor, callback)` | 註冊邏輯進入／按下事件。 | `None` |
| `m.on_leave(sensor, callback)` | 註冊邏輯離開／放開事件。 | `None` |
| `m.on_pressed(sensor, callback)` | 註冊按下 callback；背景掃描另用 start_sensor。 | `None` |
| `m.on_released(sensor, callback)` | 註冊放開 callback。 | `None` |
| `m.read_button()` | 讀取通用 button 的值。 | 目前值或 `None` |
| `m.read_sensor(sensor)` | 讀取目前正規化值。 | 目前值或 `None` |
| `m.start_button(period=100)` | 以通用 button 名稱開始掃描。 | `None` |
| `m.start_sensor(sensor, period=200)` | 開始掃描具名輸入。 | `None` |
| `m.stop_button()` | 停止通用 button 掃描。 | `None` |
| `m.stop_sensor(sensor)` | 停止指定輸入的掃描。 | `None` |
| `m.when_pressed(sensor='button', callback=None)` | 按下註冊的便利寫法；明傳 callback。 | `None` |
| `m.when_released(sensor='button', callback=None)` | 放開註冊的便利寫法。 | `None` |

## 參數型別、範圍與預設

| 參數 | 型別與規則 |
| --- | --- |
| `sensor` | `str`，DM 中的具名輸入；省略名稱的便利方法只適合可唯一解析的 button。 |
| `callback` | 按下／放開／enter／leave 為零參數 callable；一般 on(event_name, callback) 接收一個值。傳函式本身，不要加 ()。 |
| `event_name` | 一般事件鍵，使用已定義／實際輸出的感測事件名稱；不要猜測新的事件。 |
| `period` | 掃描週期，Facade 轉為整數後要求 10–10000 ms。去彈跳與掃描週期是不同設定。 |

## 事件與生命週期

邏輯值為 1=按下、0=放開，不是原始 GPIO 電位。`read_sensor(name)`／`read_button()` 是**同步的新讀取**，透過事件處理更新最後值後回傳；正常硬體路徑得到 `int` 0 或 1。來源最後以字典 `.get()` 取值，因此保留 `None` 的可能性，但不能把讀取失敗一律當成 None；錯誤也可能向外拋出。

`start_sensor()` 會先同步送出目前值，再安排去彈跳掃描。若當時已按下，初始狀態從 0 計算，按下 callback 可能在 start 呼叫返回前執行；請先準備 callback 使用的狀態。其後掃描只在穩定狀態改變時送值。一般 `on(name, callback)` 接收一個值；按下／放開／enter／leave callback 無參數，同一事件鍵重註冊會替換舊函式。

單獨註冊不會開始背景掃描；但主動 `read_sensor()` 也會同步派發一般 callback 與適用的邊緣 callback，**並非無副作用的快取查詢**。它直接採樣、不等待去彈跳，而且會更新 debouncer 基準，因此不要在已啟動的掃描旁高頻反覆 read。事件教學使用註冊 → start → 持續事件迴圈。

`stop_sensor()` 只停止該輸入掃描，不移除 callback，也不清掉最後值；停止後再主動 read 仍可能派發事件。`when_pressed(..., callback=...)`／`when_released` 必須提供 callback，不是 decorator。所有註冊／開始／停止包裝回傳 `None`。

## 錯誤與排查順序

硬體讀取／start／stop 路徑會檢查未啟用、關閉、名稱不唯一與配置，並拒絕非法 GPIO／pull／active／period。註冊用的 `on`／`on_enter`／`on_leave` 本身只是存入 callback，**沒有先驗證 callable**；傳錯函式可能到同步 start/read 或排程派發時才出現 `TypeError`。便利 `when_*` 明確少傳 callback 才會立即拋 `TypeError`。請主動傳正確函式與精確名稱，不把註冊成功當作硬體或 callback 驗證。

按下無反應時依序查 profile、總開關／具名開關、pin/active/pull、start 與事件迴圈，再查接線。修改配置後重建 Mango；不要反轉 callback 名稱來掩蓋 active 設定錯誤。

## 可獨立執行的最小範例

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("button", False):
        raise RuntimeError("Enable button in Device Manager")
    group = m.config.get("buttons", {})
    if not isinstance(group, dict):
        raise ValueError("Check the configured buttons table")
    items = {key: value for key, value in group.items()
             if isinstance(value, dict) and value.get("enabled", False)}
    name = None
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled buttons entry in Device Manager")
        name = next(iter(items))
    spec = items[name]

    print("Button:", name, "GPIO:", spec["pin"])
    previous = None
    for _ in range(15):
        value = m.read_sensor(name)
        if value != previous:
            print("Logical state:", value)
            previous = value
        time.sleep_ms(200)
finally:
    m.close()
```

## 相關閱讀

[Guide](../guides/button.md) · [Lifecycle](../../../shared/zh-TW/guides/lifecycle.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md)

## 核對來源與驗證

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/digital_input.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/digital_input.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

核對來源 SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`。本頁例子只經語法與來源契約檢查；沒有在本輪宣告實機 PASS。
