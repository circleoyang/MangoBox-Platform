# Obstacle 障礙物感測 — Host Python 使用指南

MangoX2 Host API 支援 named obstacle sensors、同步讀取與狀態改變 callback。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.is_blocked(), m.block_state())
    time.sleep(0.2)
```

## Named sensor

```python
print(m.is_blocked('left'))
print(m.block_state('right'))
```

未指定名稱時使用預設 `obstacle1`。

## 事件

```python
from mangobox import Mango
import time

m = Mango()
m.on_blocked(lambda: print('LEFT BLOCKED'), sensor='left')
m.on_clear(lambda: print('LEFT CLEAR'), sensor='left')

while True:
    time.sleep(1)
```

Host callback 由背景 reader / dispatch 接收 Runtime 事件，不需要 MicroPython 的 `m.run_forever()`。註冊 monitor 時會先建立 current-state baseline，因此初始狀態不會被誤當成一次 transition。

同步讀取若沒有取得有效值，目前可能呈現 `False` / `clear` fallback，所以 `clear` 不應單獨用來判斷感測器是否正常連線。

MangoLite Host profile 目前不宣告 `obstacle` capability。

完整函式資料請看 [Host Python Obstacle API Reference](../reference/obstacle.md)。
