# PIR Motion API Reference

PIR 用來偵測人體或其他熱源造成的紅外線變化；它不是距離感測器，也不能回傳「有幾個人」。

## `is_motion_detected()`

```python
m.is_motion_detected(sensor=None) -> bool
```

同步讀取目前 PIR 狀態。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `sensor` | `None` | 命名 PIR 感測器；省略時使用目前預設設定。 |

```python
if m.is_motion_detected():
    print("motion")
```

回傳 `True` 表示目前輸出處於 motion / detected 狀態；不代表系統知道物件的距離或方向。

## `on_motion_detected()`

```python
m.on_motion_detected(callback, sensor=None, period=100)
```

PIR 狀態由未偵測變為 detected 時執行 callback。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `callback` | 必填 | detected 邊緣事件執行的函式。 |
| `sensor` | `None` | 命名 PIR。 |
| `period` | `100` | 監看更新間隔（ms）。 |

## `on_motion_cleared()`

```python
m.on_motion_cleared(callback, sensor=None, period=100)
```

PIR 狀態由 detected 回到 cleared 時執行 callback。

> PIR 模組本身常有保持時間與靈敏度設定，因此 `cleared` 的時機不一定等於人體停止移動的瞬間。

## 範例：有人經過時亮燈

```python
from mangobox import Mango

m = Mango()

def detected():
    m.led_all("yellow")

def cleared():
    m.led_off()

m.on_motion_detected(detected)
m.on_motion_cleared(cleared)
m.run_forever()
```

## Named sensor / Availability

PIR 是否存在、名稱與 GPIO 由 Device Manager / Runtime config 管理。MangoLite 沒有把 PIR 當成固定板載元件；外接 PIR 必須依目前設定判斷 capability。

## 相關 API

`is_motion_detected()`, `on_motion_detected()`, `on_motion_cleared()`, `supports("motion")`, `run_forever()`
