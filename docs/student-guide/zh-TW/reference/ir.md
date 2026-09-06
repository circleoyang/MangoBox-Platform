# IR Remote API Reference

IR Student API 以 NEC teaching remote 的「按鍵名稱」為主，不要求學生處理 raw pulse 或 NEC frame。

## `on_ir_pressed()`

```python
m.on_ir_pressed(key, callback)
```

指定按鍵由未按下狀態轉為 pressed 時執行 callback。

| 參數 | 型別 | 說明 |
|---|---|---|
| `key` | `str` | 按鍵名稱，例如 `"ok"`、`"up"`、`"1"`、`"*"`。 |
| `callback` | callable | 按下事件發生時執行的無參數函式。 |

```python
def ok_pressed():
    print("OK")

m.on_ir_pressed("ok", ok_pressed)
m.run_forever()
```

可能的錯誤：未知 `key` 會產生 `ValueError`；callback 不可呼叫會產生 `TypeError`；需要 Enable 的外接 IR 尚未啟用時可產生 `RuntimeError`。

## `on_ir_released()`

```python
m.on_ir_released(key, callback)
```

指定按鍵由 held / pressed 轉為 released 時執行 callback。

```python
def ok_released():
    print("released")

m.on_ir_released("ok", ok_released)
```

NEC repeat frame 用來維持「按住」狀態，不應在長按期間不斷重複觸發 pressed callback；release 由 receiver 在 repeat 停止後依 timeout 判斷。

## `is_ir_pressed()`

```python
m.is_ir_pressed(key) -> bool
```

回傳指定 IR key 目前是否處於 held 狀態。

```python
if m.is_ir_pressed("up"):
    print("UP is held")
```

IR decoder 必須持續被 Scheduler 更新；若要自己 polling，需在 loop 中規律呼叫 `m.run_once()`。一般教學建議 callback + `m.run_forever()`。

## 支援的標準按鍵名稱

標準 17-key NEC teaching remote：

```text
1 2 3
4 5 6
7 8 9
* 0 #
up left ok right down
```

## Execution lifecycle

| API | 行為 | `m.run_forever()` |
|---|---|---:|
| `on_ir_pressed()` / `on_ir_released()` | 建立／啟動 receiver 並註冊事件 | 需要 |
| `is_ir_pressed()` | 讀 decoder 維護的 held state | decoder 仍需持續更新 |

IR callback 與 Button 不同：IR API 會建立／啟動 receiver，不需要另外呼叫 `start_button()` 類型的方法，但仍必須持續服務 Scheduler。

## Target / config notes

### MangoLite

- 固定板載 IR receiver
- current hardware baseline 為 GP22
- 不以 legacy `enabled_modules.ir_sensor` 當作固定板載 IR 是否存在的 gate

### MangoX2

- IR 為選配外接模組
- 是否啟用與 GPIO 由目前 Runtime config / Device Manager 決定

## 完整範例：遙控器控制車體

```python
from mangobox import Mango

m = Mango()

m.on_ir_pressed("up", lambda: m.forward(35))
m.on_ir_released("up", lambda: m.stop())
m.on_ir_pressed("left", lambda: m.spin_left(30))
m.on_ir_released("left", lambda: m.stop())
m.on_ir_pressed("right", lambda: m.spin_right(30))
m.on_ir_released("right", lambda: m.stop())

m.run_forever()
```

## 相關 API

`on_ir_pressed()`, `on_ir_released()`, `is_ir_pressed()`, `supports("ir")`, `run_once()`, `run_forever()`
