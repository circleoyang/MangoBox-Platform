# IR Remote API Reference

工程導向參考。實際可見內容應由 target／mode／version resolver 篩選。

## `on_ir_pressed()`

```python
on_ir_pressed(key: str, callback) -> None
```

當指定 NEC IR key（按鍵）由未按下狀態轉為 pressed 時執行 callback（回呼函式）。

### Parameters

| 參數 | 型別 | 說明 |
|---|---|---|
| `key` | `str` | 例如 `"ok"`, `"up"`, `"1"`, `"*"`。 |
| `callback` | callable | 按下事件觸發時執行的函式。 |

### Raises

- `ValueError`：`key` 不在支援的 IR key map。
- `TypeError`：`callback` 不可呼叫。
- `RuntimeError`：MangoX2 High Level MicroPython 的 IR module 尚未 Enable。

MangoLite 板載 IR 不以 legacy `enabled_modules.ir_sensor` 作為 Student API gate（啟用條件）。

## `on_ir_released()`

```python
on_ir_released(key: str, callback) -> None
```

當指定 key 被判定 released 時執行 callback。

NEC repeat frame（重複碼）用來維持 held state（按住狀態），不應在長按期間持續重複觸發 pressed callback。release 由接收器在 repeat 停止後依 timeout 判定。

## `is_ir_pressed()`

```python
is_ir_pressed(key: str) -> bool
```

回傳指定 IR key 目前是否處於按住狀態。

## Supported key names

目前標準 17-key NEC teaching remote mapping：

```text
1 2 3
4 5 6
7 8 9
* 0 #
up left ok right down
```

## Availability

| Target | High Level MicroPython | Host Python |
|---|---:|---:|
| MangoX2 + Pico | 支援；IR 為選配 | 目前不要宣告完整 IR learner path |
| MangoX2 + Pico 2 W | 支援；IR 為選配 | 目前不要宣告完整 IR learner path |
| MangoLite + Pico 2 W | 支援；板載 IR | 目前 Host capability resolver 仍以 learner method 存在為必要條件 |

Host Python 不得因 Runtime config 中存在 `ir_sensor` 就自動顯示 IR Student API。

## Hardware/config notes

### MangoLite

- onboard IR receiver（板載紅外線接收器）
- fixed GP22
- Student API 可直接建立 receiver

### MangoX2

- optional external IR receiver（選配外接紅外線接收器）
- `enabled_modules.ir_sensor` 必須為 `True`
- 實際接收 GPIO／Pin 由 `ir_sensor_pin` 決定
- semantic IR path 不使用舊的 `ir_receiver_pin` 作為腳位來源

## Execution lifecycle

| API | High Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `on_ir_pressed()` / `on_ir_released()` | 自動建立／啟動 IR receiver，並排程 receiver `update()` | 需要 |
| `is_ir_pressed()` | 讀取 decoder 維護的 held state；decoder 本身仍需被 Scheduler 更新 | 單次 one-shot 讀取不足以做完整 IR 測試 |

因此 IR callback 不需要像 Button 一樣另外呼叫 `start_button()` 類型的 API，但仍需要 event loop 持續服務 Scheduler。

若一定要自行 polling `is_ir_pressed()`，應在自訂 loop 中規律呼叫 `m.run_once()`，或改用 callback + `m.run_forever()`。不建議用單次 `print(m.is_ir_pressed("ok"))` 判定 IR 收訊是否正常。

## Example

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("OK")

m.on_ir_pressed("ok", pressed)
m.run_forever()
```

## Related APIs

`on_ir_released()`, `is_ir_pressed()`, `supports("ir")`, `capabilities()`, `run_once()`, `run_forever()`
