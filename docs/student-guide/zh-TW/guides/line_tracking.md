# Line Tracking 循跡使用指南

Line Tracking 使用左右兩個數位感測器，High-Level MicroPython 會整理成 `none`、`left`、`right`、`both` 四種狀態。

> MangoX2 預設 Line Tracking 使用 GP12/GP13，與目前 Host UART ownership 衝突，因此此 capability 目前只在 High-Level MicroPython profile 顯示。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.line_left(), m.line_right(), m.line_state())
    time.sleep(0.2)
```

## 狀態事件

```python
from mangobox import Mango

m = Mango()

def changed(state):
    print('state =', state)

m.on_line_change(changed)
m.on_line_left(lambda: print('LEFT'))
m.on_line_right(lambda: print('RIGHT'))
m.on_line_both(lambda: print('BOTH'))
m.on_line_clear(lambda: print('NONE'))
m.run_forever()
```

`on_line_change()` callback 會收到新的 state 字串；四個特定狀態 callback 不帶參數。

## 應用到車體

先單獨確認感測器左右語意，再加入 Motor / Drive。循跡不穩時，先看 raw 左右狀態與感測器高度，不要一開始就調整大量轉向參數。

## 進階閱讀

- [Line Tracking API Reference](../reference/line_tracking.md)
