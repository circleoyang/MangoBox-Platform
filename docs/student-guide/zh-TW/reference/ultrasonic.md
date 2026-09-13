# Ultrasonic API Reference

> **Availability**：`distance` capability 目前在 MangoX2 與 MangoLite 的 High-Level MicroPython / Host Python profiles 中提供。實際可用性仍取決於目前硬體、Runtime 設定與模組啟用狀態。

Canonical import：

```python
from mangobox import Mango
m = Mango()
```

## `distance()`

```python
m.distance(sensor=None) -> float | None
```

同步讀取距離，單位為 **cm**。

| 參數 | 型別 | 預設值 | 說明 |
|---|---|---:|---|
| `sensor` | str \| None | `None` | 命名超音波感測器；省略時使用目前預設裝置。 |

### Returns

- 有效量測：`float`，目前 Host path 會正規化到 0.1 cm。
- 無有效量測：`None`。

目前 Host Student API 會把 timeout、空值、`none/null`、無法解析的回覆，以及 2–300 cm 以外的值視為無效量測。

## `is_near()`

```python
m.is_near(distance_cm, sensor=None) -> bool
```

讀取目前距離並判斷是否 `<= distance_cm`。

| 參數 | 型別 | 說明 |
|---|---|---|
| `distance_cm` | number | Near threshold，必須 `> 0`。 |
| `sensor` | str \| None | 命名感測器。 |

沒有有效量測時目前回傳 `False`，所以 `False` 不等於「感測器一定正常而且物體很遠」。

## `on_near()`

```python
m.on_near(distance_cm, callback, period=100, sensor=None)
```

距離進入 Near 區域時執行 callback。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `distance_cm` | 必填 | Near threshold（cm），必須 `> 0`。 |
| `callback` | 必填 | 必須為 callable。 |
| `period` | `100` | 監看更新間隔（ms）。Host path 目前會將實際 monitor period 下限限制為 60 ms。 |
| `sensor` | `None` | 命名感測器。 |

## `on_far()`

```python
m.on_far(distance_cm, callback, period=100, sensor=None)
```

距離進入 Far 區域時執行 callback。若 Near 與 Far 同時存在，**Far threshold 必須大於 Near threshold**，否則會丟出 `ValueError`。

## Hysteresis 行為

Near / Far 同時設定時，例如：

```python
m.on_near(20, near)
m.on_far(30, far)
```

- `<= 20 cm`：進入 Near
- `>= 30 cm`：進入 Far
- `20–30 cm`：保持目前區域，不因微小抖動反覆切換

這是刻意設計的遲滯行為。

## Event lifecycle

High-Level MicroPython callback 程式需要讓 Scheduler 持續執行：

```python
m.run_forever()
```

Host Python 的事件由 Host reader / dispatch 路徑接收；不要把 MicroPython 的 `run_forever()` 要求當成 Host API 的必要條件。

## Named sensor

多顆超音波模組的 Trigger / Echo GPIO 與名稱應由 Device Manager / Runtime 管理；學生只用 `sensor="name"` 選擇。

```python
print(m.distance("front"))
m.on_near(15, callback, sensor="front")
```

## Troubleshooting

### 一直得到 `None`

檢查供電、共地、Trigger / Echo 設定、量測方向與感測器名稱。不要把 timeout 改寫成 `0 cm`。

### Near/Far callback 很容易抖動

使用兩個不同 threshold，且 Far > Near。若仍不穩，再降低更新頻率或改善安裝條件。

### named sensor 沒有反應

確認名稱與 Runtime / Device Manager 完全一致；不要在學生程式內自行重建腳位設定。

## 相關 API

`distance()`, `is_near()`, `on_near()`, `on_far()`, `supports("distance")`, `run_forever()`
