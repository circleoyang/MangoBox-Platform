# Line Tracking 循跡使用指南

Line Tracking 使用左右兩個數位感測器判斷線條位置。MangoBox Student API 會把左右 raw 狀態整理成 `none`、`left`、`right`、`both` 四種語意狀態，學生程式不需要自己處理 active-high / active-low 反轉。

> **適用範圍**：目前 canonical contract 只在 **MangoX2 + High-Level MicroPython** 提供 `line_tracking` capability。MangoX2 預設 Line Tracking 使用 GP12 / GP13，會與 Host UART ownership 衝突，因此 Host Python profile 不提供此能力；MangoLite 目前也不宣告支援。

## 30 秒快速測試

先不要接馬達，只確認左右感測器與狀態語意：

```python
from mangobox import Mango
import time

m = Mango()

while True:
    print(
        "left =", m.line_left(),
        "right =", m.line_right(),
        "state =", m.line_state()
    )
    time.sleep(0.2)
```

把左右感測器依序移到線條上方，確認 `line_left()`、`line_right()` 與 `line_state()` 的變化符合實際位置。

## 四種狀態

`m.line_state()` 會回傳：

| 狀態 | 意義 |
|---|---|
| `none` | 左右都沒有進入有效線條狀態。 |
| `left` | 左側感測器偵測到線條。 |
| `right` | 右側感測器偵測到線條。 |
| `both` | 左右兩側都偵測到線條。 |

教學時建議讓學生先觀察四種狀態，再設計對應的車體動作；不要一開始就把感測、轉向與速度控制全部混在一起。

## 事件方式

若希望「狀態改變時才執行」，可以使用 callback：

```python
from mangobox import Mango

m = Mango()

def changed(state):
    print("state =", state)

m.on_line_change(changed)
m.on_line_left(lambda: print("LEFT"))
m.on_line_right(lambda: print("RIGHT"))
m.on_line_both(lambda: print("BOTH"))
m.on_line_clear(lambda: print("NONE"))

m.run_forever()
```

- `on_line_change()`：狀態改變時觸發，callback 會收到新的 `state` 字串。
- `on_line_left()`：進入 `left` 時觸發。
- `on_line_right()`：進入 `right` 時觸發。
- `on_line_both()`：進入 `both` 時觸發。
- `on_line_clear()`：進入 `none` 時觸發。

四個特定狀態 callback 不帶參數。

## 什麼時候需要 `m.run_forever()`？

直接讀取不需要：

```python
print(m.line_left())
print(m.line_right())
print(m.line_state())
```

使用 `on_line_*()` callback 時，需要讓 Scheduler 持續執行：

```python
m.run_forever()
```

事件監看預設更新間隔為 50 ms；Runtime 會限制有效排程間隔至少 20 ms。

## 加入 Motor / Drive

先完成感測器測試，再加入車體控制：

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

這只是最小教學範例，不代表所有車體都應使用相同策略。感測器間距、安裝高度、線寬、速度與底盤慣性都會影響實際循跡效果。

## 建議的除錯順序

循跡不穩時，建議依序檢查：

1. `m.supports("line_tracking")` 是否為 `True`。
2. 是否使用 MangoX2 + High-Level MicroPython profile。
3. 左右感測器實際位置是否與 `line_left()` / `line_right()` 對應。
4. 感測器高度、線條顏色與背景對比是否足夠。
5. `line_state()` 在靜止狀態下是否穩定。
6. 確認感測器可靠後，再調 Motor 速度與轉向參數。

不要先在學生程式中把 raw GPIO 的 `0/1` 顛倒；active level 應由 Runtime / module configuration 統一處理。

## 常見問題

### 為什麼 Host Python 看不到 Line Tracking？

目前 MangoX2 預設循跡使用 GP12 / GP13，與 Host UART ownership 衝突，因此 canonical profile 不對 Host Python 宣告 `line_tracking`。

### 為什麼 callback 沒有反應？

先確認程式最後有 `m.run_forever()`，並確認感測器狀態真的有從一種狀態切換到另一種狀態。

### 可以直接讀 raw GPIO 嗎？

教學用 Student API 不建議。使用 `line_left()`、`line_right()`、`line_state()` 可以讓板卡設定、active level 與學生程式解耦。

## 小挑戰

先不要控制馬達。用 RGB LED 顯示四種狀態：

- `none`：熄燈
- `left`：紅色
- `right`：藍色
- `both`：綠色

確認狀態穩定後，再把同一套邏輯換成 Motor / Drive。

## 進階閱讀

- [Line Tracking API Reference](../reference/line_tracking.md)
- [Motor / Drive 使用指南](motor.md)
