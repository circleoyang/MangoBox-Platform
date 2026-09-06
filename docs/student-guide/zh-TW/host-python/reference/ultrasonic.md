# Ultrasonic API Reference — Host Python

## `distance()`

```python
m.distance(sensor=None) -> float | None
```

讀取距離，單位 cm。`sensor=None` 使用目前預設超音波感測器；無有效量測時可能回傳 `None`。

```python
print(m.distance())
print(m.distance("front"))
```

## `is_near()`

```python
m.is_near(distance_cm, sensor=None) -> bool
```

判斷目前有效距離是否小於等於 `distance_cm` 門檻。

## `on_near()` / `on_far()`

```python
m.on_near(distance_cm, callback, period=100, sensor=None)
m.on_far(distance_cm, callback, period=100, sensor=None)
```

| 參數 | 說明 |
|---|---|
| `distance_cm` | 距離門檻（cm）。 |
| `callback` | 進入 Near / Far 區域時執行的函式。 |
| `period` | Runtime 監看更新間隔（ms），預設 100。 |
| `sensor` | 命名超音波感測器。 |

Host callback 需要 PC process 持續接收 Runtime 事件。若同時設定 Near 與 Far，Far threshold 應大於 Near threshold。

## Capability

```python
print(m.supports("distance"))
```

多裝置 Trigger / Echo Pin 由 Device Manager / Runtime 管理；學生只以 `sensor="name"` 選擇。
