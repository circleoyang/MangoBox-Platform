# Line Tracking API Reference

> **Availability**：目前 canonical contract 僅在 **MangoX2 + High-Level MicroPython** 提供 `line_tracking` capability。MangoThonny Host Python 目前尚未提供對應的 Line Tracking Student API；後續版本可規劃補齊 Host Student API parity。MangoLite 目前也不宣告此 capability。

Canonical import：

```python
from mangobox import Mango
m = Mango()
```

## `line_left()`

```python
m.line_left() -> bool
```

同步讀取左側循跡感測器的語意狀態。

### Returns

- `True`：左側目前偵測到線條。
- `False`：左側目前未偵測到線條。

實際 raw GPIO 的 active-high / active-low 由 Runtime / module configuration 處理；學生程式不需要自行反轉。

## `line_right()`

```python
m.line_right() -> bool
```

同步讀取右側循跡感測器的語意狀態。

### Returns

- `True`：右側目前偵測到線條。
- `False`：右側目前未偵測到線條。

## `line_state()`

```python
m.line_state() -> str
```

一次讀取左右循跡感測器，回傳整理後的語意狀態：

| 回傳值 | 意義 |
|---|---|
| `none` | 左右皆未進入有效線條狀態。 |
| `left` | 左側感測器偵測到線條。 |
| `right` | 右側感測器偵測到線條。 |
| `both` | 左右兩側都偵測到線條。 |

```python
state = m.line_state()
print(state)
```

## `on_line_change()`

```python
m.on_line_change(callback, period=50)
```

任一循跡語意狀態改變時執行 callback。

### Parameters

| 參數 | 型別 | 預設值 | 說明 |
|---|---|---:|---|
| `callback` | callable | 必填 | 狀態改變時執行的函式。 |
| `period` | int | `50` | 狀態更新間隔，單位 ms；Runtime 的有效排程最小值為 20 ms。 |

### Callback

標準 callback 會收到新的狀態字串：

```python
def changed(state):
    print(state)

m.on_line_change(changed)
```

`state` 為 `none`、`left`、`right`、`both` 之一。

## `on_line_left()`

```python
m.on_line_left(callback, period=50)
```

狀態進入 `left` 時執行 callback。callback 不帶參數。

## `on_line_right()`

```python
m.on_line_right(callback, period=50)
```

狀態進入 `right` 時執行 callback。callback 不帶參數。

## `on_line_both()`

```python
m.on_line_both(callback, period=50)
```

狀態進入 `both` 時執行 callback。callback 不帶參數。

## `on_line_clear()`

```python
m.on_line_clear(callback, period=50)
```

狀態進入 `none` 時執行 callback。callback 不帶參數。

## Event monitor 行為

所有 `on_line_*()` callback 共用 Runtime 的 line-tracking monitor。若後續註冊要求更快的 `period`，Runtime 可以依目前 contract 調整共用 monitor 的更新速度。

事件 API 只在狀態**進入**指定語意時觸發，不應把「註冊 callback」本身視為一次狀態事件。

## 執行生命週期

| API | High-Level MicroPython 行為 | 需要 `m.run_forever()` |
|---|---|---:|
| `line_left()` | 立即同步讀取 | 否 |
| `line_right()` | 立即同步讀取 | 否 |
| `line_state()` | 立即同步讀取左右並整理狀態 | 否 |
| `on_line_change()` | 建立／共用 watcher，由 Scheduler 後續更新 | 是 |
| `on_line_left/right/both/clear()` | 建立／共用 watcher，由 Scheduler 後續更新 | 是 |

Callback 程式的標準結尾：

```python
m.run_forever()
```

## 範例：觀察狀態改變

```python
from mangobox import Mango

m = Mango()

def changed(state):
    print("line =", state)

m.on_line_change(changed, period=50)
m.run_forever()
```

## 範例：基本循線判斷

```python
from mangobox import Mango
import time

m = Mango()

while True:
    state = m.line_state()

    if state == "left":
        m.pivot_left(25)
    elif state == "right":
        m.pivot_right(25)
    elif state == "both":
        m.forward(30)
    else:
        m.stop()

    time.sleep(0.02)
```

這是 API 使用範例，不是通用控制器。實際車體應依感測器位置、線寬、速度與機構調整策略。

## Hardware / configuration notes

- MangoX2 current default Line Tracking Pin 為 GP12 / GP13。
- MangoThonny Host Python 目前尚未實作這組 Line Tracking Student API，因此 current Host profile 不宣告 `line_tracking`。
- GP12 / GP13 與 Host UART 的衝突屬於目前預設配置限制，不是硬體架構限制；未來若補上 Host Student API，可重新配置循跡 GPIO 避開。
- active level、左右腳位與硬體設定應由 Runtime / Device Manager 管理；學生程式應使用語意 API，不要自行重建 raw GPIO driver。
- 使用前可先檢查：

```python
print(m.supports("line_tracking"))
```

## 常見問題

### `line_state()` 一直是 `none`

先檢查 capability、模組啟用、左右感測器接線、感測高度以及線條／背景對比。不要先修改 Motor 參數。

### callback 沒有觸發

確認程式有 `m.run_forever()`，且狀態確實發生轉換。若狀態固定不變，callback 不會反覆觸發。

### 左右方向顛倒

先確認實體左／右感測器是否接到 Runtime 設定中的對應腳位。不要在每一份學生程式中交換 `left` / `right` 來掩蓋設定問題。

## 相關 API

`line_left()`, `line_right()`, `line_state()`, `on_line_change()`, `on_line_left()`, `on_line_right()`, `on_line_both()`, `on_line_clear()`, `supports("line_tracking")`, `run_forever()`, `forward()`, `pivot_left()`, `pivot_right()`, `stop()`
