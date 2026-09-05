# Obstacle 障礙物感測使用指南

Obstacle API 將數位障礙物感測器整理成 `blocked` / `clear` 語意，並支援 named sensor。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.block_state())
    time.sleep(0.2)
```

也可以直接取得布林值：

```python
print(m.is_blocked())
```

## 事件方式

```python
from mangobox import Mango

m = Mango()

m.on_blocked(lambda: print('BLOCKED'))
m.on_clear(lambda: print('CLEAR'))
m.run_forever()
```

## 多個感測器

current MangoX2 contract 可由 Device Manager 建立 named obstacle sensors：

```python
print(m.is_blocked('left'))
print(m.is_blocked('right'))
m.on_blocked(lambda: print('left blocked'), sensor='left')
```

未指定名稱時預設使用 `obstacle1`。

## 如果狀態顛倒

先檢查模組是否為 active-low、Device Manager 的模組設定與實際接線，再確認感測器上的靈敏度旋鈕；不要只在應用程式中把 True/False 反轉。

## 進階閱讀

- [Obstacle API Reference](../reference/obstacle.md)
