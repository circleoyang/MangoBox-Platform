# Ultrasonic 超音波測距使用指南

Ultrasonic API 回傳公分距離，current shared contract 支援 MangoX2 的 named multi-device 設定。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
while True:
    print('cm =', m.distance())
    time.sleep(0.3)
```

正常量測範圍以 Runtime 驗證值為準；無有效回波時可能得到 `None`。

## 判斷是否靠近

```python
if m.is_near(20):
    print('物體在 20 cm 內')
```

## Near / Far 事件

```python
from mangobox import Mango

m = Mango()

def near():
    print('靠近')

def far():
    print('遠離')

m.on_near(20, near)
m.on_far(30, far)
m.run_forever()
```

若同時設定 Near 與 Far，`on_far` 門檻必須大於 `on_near`，形成遲滯區，避免在單一距離附近反覆觸發。

## 多個超音波模組

Device Manager 可建立 named sensors，例如 `front`、`rear`：

```python
print(m.distance('front'))
print(m.distance('rear'))
m.on_near(15, near, sensor='front')
```

未指定 `sensor` 時使用目前預設／`board` 設定。

## 如果一直是 None

先確認 Trigger / Echo Pin、供電與量測方向，再用 Device Manager 的 Read once / Monitor 測試。不要把 timeout 當成 `0 cm`。

## 進階閱讀

- [Ultrasonic API Reference](../reference/ultrasonic.md)
