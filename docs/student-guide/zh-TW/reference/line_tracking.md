# Line Tracking API Reference

## `line_state()`

```python
m.line_state() -> str
```

一次讀取左右循跡感測器，回傳整理後的語意狀態：

```text
none
left
right
both
```

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

實際「黑線是 0 還是 1」的 active level 應由 Runtime / module configuration 統一處理；學生程式應依 `line_state()` 的語意值寫邏輯，不需要再反轉 raw GPIO。

## Availability

目前 MangoX2 預設循跡 Pin GP12 / GP13 會與 Host UART 使用情境衝突，因此 current shared contract 主要在 High-Level MicroPython profile 顯示。切換程式模式前應依 Device Manager / capability resolver 判斷，不要只看硬體有接模組就假設 Host Python 一定支援。

## 相關 API

`line_state()`, `supports("line_tracking")`, `forward()`, `pivot_left()`, `pivot_right()`, `stop()`
