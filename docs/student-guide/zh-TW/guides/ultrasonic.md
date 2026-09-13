# Ultrasonic 超音波測距使用指南

Ultrasonic API 以公分為單位讀取距離。MangoBox 目前在可用 profile 中支援同步讀值、Near/Far 判斷、事件 callback 與 named sensor；是否可用應以目前選取的 target / mode profile 與 `m.supports("distance")` 為準。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()

while True:
    print("cm =", m.distance())
    time.sleep(0.3)
```

`distance()` 可能回傳距離數值，也可能回傳 `None`。`None` 代表目前沒有可信的有效量測，不應解讀成 `0 cm`。

## 判斷是否靠近

```python
if m.is_near(20):
    print("物體在 20 cm 內")
```

`is_near()` 是同步判斷；若沒有有效距離，目前會得到 `False`。因此 `False` 可能代表「不在門檻內」，也可能代表「本次沒有有效量測」，需要依應用情境決定是否另外檢查 `distance()`。

## Near / Far 事件

```python
from mangobox import Mango

m = Mango()

def near():
    print("NEAR")

def far():
    print("FAR")

m.on_near(20, near)
m.on_far(30, far)

m.run_forever()
```

若同時使用 Near / Far，Far threshold 必須大於 Near threshold，例如 20 cm / 30 cm。中間區域形成遲滯區，可避免距離在單一門檻附近抖動時反覆觸發。

> High-Level MicroPython 的 callback 程式需要讓 Scheduler 持續執行，通常以 `m.run_forever()` 作結。Host Python 的 callback 由 Host reader/dispatch 路徑處理，不應把 MicroPython 的 `run_forever()` 規則直接套到 Host 程式。

## Named sensor

多顆超音波模組由 Device Manager / Runtime 設定 Trigger / Echo 與名稱，學生程式只使用名稱：

```python
print(m.distance("front"))
print(m.distance("rear"))

m.on_near(15, near, sensor="front")
```

不要在每份學生程式內重新建立 Trigger / Echo GPIO driver，避免教學程式與板卡設定耦合。

## 量測限制

目前 Host Student API 會將無效字串、timeout、無法解析的回覆，以及 2–300 cm 以外的值正規化為 `None`。實際硬體可用距離仍會受模組、供電、反射角度、物體材質與安裝方式影響。

## 建議除錯順序

1. 先確認 `m.supports("distance")`。
2. 用 `m.distance()` 單獨測，不要先加 Motor。
3. 若一直是 `None`，檢查 Trigger / Echo、供電、接地與量測方向。
4. named sensor 請確認名稱與 Device Manager / Runtime 設定一致。
5. 若讀值跳動，先降低更新頻率並固定感測器與物體位置。
6. 感測穩定後，再加入 Near/Far callback 或車體控制。

## 小挑戰

用 RGB LED 顯示三個區域：

- `<= 15 cm`：紅色
- `15–30 cm`：黃色
- `> 30 cm`：綠色
- `None`：熄燈或顯示錯誤狀態

## 進階閱讀

- [Ultrasonic API Reference](../reference/ultrasonic.md)
