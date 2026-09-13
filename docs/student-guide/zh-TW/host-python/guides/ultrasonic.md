# Ultrasonic 超音波測距 — Host Python 使用指南

目前 MangoThonny Host 0.4.6 的 `distance` Student API 已支援 MangoX2 與 MangoLite Host profiles，可進行同步距離讀取、Near/Far 事件與 named sensor 選擇。實際硬體模組是否存在、是否 Enable、Trigger/Echo 如何配置，仍由目前 Runtime / Device Manager 決定。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
print("Distance supported =", m.supports("distance"))

while True:
    print("cm =", m.distance())
    time.sleep(0.3)
```

無有效回波時可能得到 `None`。不要把 `None` 當成 `0 cm`。

## Named sensor

```python
print(m.distance("front"))
print(m.distance("rear"))
```

Trigger / Echo 與名稱由 Device Manager / Runtime 管理，學生程式只以 `sensor="name"` 選擇。

## Near / Far 事件

```python
from mangobox import Mango
import time

m = Mango()

m.on_near(20, lambda: print("NEAR"), sensor="front")
m.on_far(30, lambda: print("FAR"), sensor="front")

while True:
    time.sleep(1)
```

Host callback 由背景 reader / dispatch 接收 Runtime stream，不需要 MicroPython 的 `m.run_forever()`。若同時設定 Near / Far，Far threshold 必須大於 Near threshold。

## Host 量測語意

- `distance()` 會等待對應的 Runtime reply，而不是只讀之前快取的舊值。
- timeout、空值、無法解析、或目前 Host contract 認定超出有效範圍的值會正規化為 `None`。
- `is_near()` 在沒有有效量測時回 `False`，因此 `False` 不是連線健康檢查。
- Near/Far monitor 會做短期濾波並使用 hysteresis。

## Troubleshooting

1. 確認 `m.supports("distance")`。
2. 先測 `m.distance()`，不要先混入 Motor。
3. `None` 持續出現時檢查 Trigger/Echo、供電、共地、方向與 sensor name。
4. callback 沒反應時先確認 Python process 沒有結束，再確認 Runtime streaming event。

## 進階閱讀

- [Host Python Ultrasonic API Reference](../reference/ultrasonic.md)
