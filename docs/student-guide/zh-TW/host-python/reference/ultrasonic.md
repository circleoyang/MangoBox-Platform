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
