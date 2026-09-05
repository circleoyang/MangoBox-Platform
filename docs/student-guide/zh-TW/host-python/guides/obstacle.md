# Obstacle 障礙物感測 — Host Python 使用指南

MangoX2 Host API 支援 named obstacle sensors，同步讀取與 blocked/clear callbacks。

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

## 事件

```python
m.on_blocked(lambda: print('LEFT BLOCKED'), sensor='left')
m.on_clear(lambda: print('LEFT CLEAR'), sensor='left')
m.run_forever()
```

Host 在註冊 monitor 時會先建立 current-state baseline，避免把初始值誤當成一次 transition。

MangoLite legacy obstacle 設定目前不自動提升為 Host current capability。

完整函式資料請看 [Host Python Obstacle API Reference](../reference/obstacle.md)。
