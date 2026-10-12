# Ultrasonic API Reference — Host Python

> **Availability**：目前 MangoThonny Host 0.4.6 的 `distance` capability 已在 MangoX2 與 MangoLite Host profiles 中提供。實際模組是否存在與腳位設定仍由 Runtime / Device Manager 決定。

## `distance()`

```python
m.distance(sensor=None) -> float | None
```

同步讀取距離，單位 cm。Host 會等待對應的 Runtime reply generation；無有效量測時回傳 `None`。

目前 Host path 會將 timeout、空值、無法解析，以及 2–300 cm 以外的值正規化為 `None`。

## `is_near()`

```python
m.is_near(distance_cm, sensor=None) -> bool
```

判斷目前有效距離是否 `<= distance_cm`。`distance_cm` 必須 `> 0`；無有效量測時回 `False`。

## `on_near()`

```python
m.on_near(distance_cm, callback, period=100, sensor=None)
```

距離進入 Near 區域時執行 callback。

## `on_far()`

```python
m.on_far(distance_cm, callback, period=100, sensor=None)
```

距離進入 Far 區域時執行 callback。若 Near 與 Far 同時存在，Far threshold 必須大於 Near threshold，否則會丟出 `ValueError`。

## Parameters

| 參數 | 說明 |
|---|---|
| `distance_cm` | 距離門檻（cm），必須 > 0。 |
| `callback` | 必須為 callable。 |
| `period` | 請求的監看週期（ms）；Host 目前將實際 monitor 下限限制為 60 ms。 |
| `sensor` | 命名超音波感測器；`None` 使用目前預設裝置。 |

## Host event lifecycle

Host callback 由背景 reader / dispatch 接收 Runtime stream，不需要執行 MicroPython 的 `m.run_forever()`。Python process 本身仍須保持存活。

Near/Far stream 會先累積短期讀值並以 median 方式濾波，再依目前 proximity state 與 threshold 判斷 transition。

## Hysteresis

```python
m.on_near(20, near)
m.on_far(30, far)
```

- `<= 20`：Near
- `>= 30`：Far
- `20–30`：保持目前區域

## Named sensor

```python
print(m.distance("front"))
m.on_near(15, callback, sensor="front")
```

Trigger / Echo 與 sensor name 屬於 Runtime / Device Manager 設定，學生程式不應重建 raw driver。

## 相關 API

`distance()`, `is_near()`, `on_near()`, `on_far()`, `supports("distance")`

## 感測值變化事件 (Change Callback): `on_distance_change()`

```python
m.on_distance_change(callback, threshold=2.0, period=150, sensor=None)
m.stop_distance_change(sensor=None)
```

變化量與上次實際通知值比較。門檻預設 2.0（距離 cm），不是每次取樣都通知；首次有效讀值通知一次。超音波先取得三次有效測量值，使用中位數；sensor 可指定命名感測器。 `period` 為毫秒（ms）的監看週期，實際執行可能受取樣與通訊延遲影響。

```python
from mangobox import Mango
m = Mango()
def changed(distance_cm):
    print(distance_cm)
m.on_distance_change(changed, threshold=2.0)
m.run_forever()
```

注意：此 API 需整合 Sensor Change v1 的 Runtime／Host 套件，舊版不一定支援；不能由韌體版本推定 MangoThonny 的 Host Python 已更新。
