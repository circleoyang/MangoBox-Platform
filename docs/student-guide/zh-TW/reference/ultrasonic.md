# Ultrasonic API Reference

## `distance()`

```python
m.distance(sensor=None) -> float | None
```

讀取超音波距離，單位為 **cm**。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `sensor` | `None` | 命名超音波感測器；省略時使用目前 Runtime 的預設設定。 |

回傳有效距離數值；無有效 echo / timeout 等情況可能回傳 `None`。

```python
print(m.distance())
print(m.distance("front"))
```

## `is_near()`

```python
m.is_near(distance_cm, sensor=None) -> bool
```

讀取目前距離並判斷是否 **小於等於**門檻。

| 參數 | 說明 |
|---|---|
| `distance_cm` | Near 門檻，單位 cm。 |
| `sensor` | 命名感測器；省略時使用預設。 |

```python
if m.is_near(20):
    print("Too close")
```

無有效量測時不要把結果直接當成「一定很遠」；需要依教學情境處理 `None` / 無效值。

## `on_near()`

```python
m.on_near(distance_cm, callback, period=100, sensor=None)
```

距離由 Near 區域外進入 `<= distance_cm` 時執行 callback。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `distance_cm` | 必填 | Near threshold（cm）。 |
| `callback` | 必填 | 進入 Near 區域時呼叫的函式。 |
| `period` | `100` | 監看更新間隔（ms）。 |
| `sensor` | `None` | 指定命名超音波感測器。 |

## `on_far()`

```python
m.on_far(distance_cm, callback, period=100, sensor=None)
```

距離由 Far 區域外進入 `>= distance_cm` 的區域時執行 callback。若同時建立 Near / Far 事件，**Far threshold 應大於 Near threshold**，避免門檻重疊。

## 事件範例

```python
from mangobox import Mango

m = Mango()

def near():
    print("near")
    m.led_all("red")

m.on_near(20, near, period=100)
m.run_forever()
```

## Named sensor

多顆超音波模組的 Trigger / Echo GPIO 不應在學生程式重建。由 Device Manager / Runtime 管理 `ultrasonic_sensors` 與目前預設設定，學生只以 `sensor="name"` 選擇。

## 相關 API

`distance()`, `is_near()`, `on_near()`, `on_far()`, `supports("distance")`, `run_forever()`
