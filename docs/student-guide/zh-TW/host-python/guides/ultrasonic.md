# Ultrasonic 超音波測距 — Host Python 使用指南

MangoX2 Host API 支援同步距離 read、Near/Far event 與 named multi-ultrasonic。既有 legacy CSV Runtime reply 保留相容，不需要改寫舊 listener。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print(m.distance())
    time.sleep(0.3)
```

無有效回波時可能得到 `None`。

## Named sensor

```python
print(m.distance('front'))
print(m.distance('rear'))
```

## Near / Far 事件

```python
m.on_near(20, lambda: print('NEAR'), sensor='front')
m.on_far(30, lambda: print('FAR'), sensor='front')
m.run_forever()
```

若 Near 與 Far 同時設定，Far threshold 必須大於 Near threshold。

目前這個 shared Host contract 主要適用 MangoX2；MangoLite legacy ultrasonic 尚未因舊 config 欄位存在就被宣告成 current Host capability。

完整函式資料請看 [Host Python Ultrasonic API Reference](../reference/ultrasonic.md)。
