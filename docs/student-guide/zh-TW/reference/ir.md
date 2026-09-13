# IR Remote API Reference

> **Availability**：目前 `ir` capability 已在 MangoX2 / MangoLite 的 High-Level MicroPython 與 Host Python profiles 中提供。MangoLite 使用板載 IR receiver；MangoX2 使用選配外接 receiver，需由 Runtime config 啟用。

Canonical import：

```python
from mangobox import Mango
m = Mango()
```

## `on_ir_pressed()`

```python
m.on_ir_pressed(key, callback)
```

指定 NEC teaching remote 按鍵進入 pressed 狀態時執行 callback。

| 參數 | 型別 | 說明 |
|---|---|---|
| `key` | str | `"ok"`、`"up"`、`"1"`、`"*"` 等標準按鍵名稱。 |
| `callback` | callable | 無參數 callback。 |

### Raises

- 未知 `key`：`ValueError`
- callback 不可呼叫：`TypeError`
- MangoX2 IR 在 live Runtime config 中未啟用：`RuntimeError`

## `on_ir_released()`

```python
m.on_ir_released(key, callback)
```

指定按鍵由 held / pressed 轉為 released 時執行 callback。

NEC repeat frame 用來維持 held 狀態，不應在長按期間不斷重複觸發 pressed callback；release 由 Runtime / receiver timeout 判斷。

## `is_ir_pressed()`

```python
m.is_ir_pressed(key) -> bool
```

回傳指定 IR key 是否目前處於 held 狀態。

### Host Python

Host 0.4.6 會送出 `{"target":"ir","action":"read"}`，等待 Runtime 回覆目前 key / pressed / code / protocol，再回傳布林結果。

### High-Level MicroPython

讀取 decoder 維護的 held state；若自行寫 polling loop，需持續服務 Scheduler，否則 decoder 狀態不會正常更新。

## 支援的標準按鍵名稱

```text
1 2 3
4 5 6
7 8 9
* 0 #
up left ok right down
```

## Execution lifecycle

| API | High-Level MicroPython | Host Python |
|---|---|---|
| `on_ir_pressed()` / `on_ir_released()` | 建立／啟動 receiver；需持續服務 Scheduler | 註冊 Host callback，事件由 reader/dispatch 接收 |
| `is_ir_pressed()` | 讀 decoder held state | 同步向 Runtime 讀取目前 IR state |

MicroPython callback 程式通常以：

```python
m.run_forever()
```

作結。Host Python 不需要為 IR callback 額外建立 MicroPython scheduler loop。

## Hardware / config notes

### MangoLite

- 板載 IR receiver
- current baseline：GP22
- 不以 `enabled_modules.ir_sensor` 作為板載 receiver 是否存在的 gate

### MangoX2

- 選配外接 IR receiver
- `enabled_modules.ir_sensor` 必須啟用
- active GPIO 由 `ir_sensor_pin` 決定

## Troubleshooting

### `supports("ir")` 是 True 但沒反應

`supports()` 只代表 API path 存在。MangoX2 仍要檢查 enable state、GPIO、VCC/GND/Signal 與 receiver 方向。

### 長按一直重複觸發 pressed

標準語意不應如此。先確認使用 canonical Student API，而不是自行把 raw repeat frame 當成新 pressed 事件。

### Host / MicroPython 行為看起來不同

兩者 learner-facing method 相同，但生命週期不同：Host 依 reader/dispatch；MicroPython 依 Scheduler/decoder 更新。

## 相關 API

`on_ir_pressed()`, `on_ir_released()`, `is_ir_pressed()`, `supports("ir")`, `capabilities()`, `run_once()`, `run_forever()`
