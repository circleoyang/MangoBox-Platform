# Button / Digital Sensor API Reference

```python
from mangobox import Mango
m = Mango()
```

這一頁同時說明板載／預安裝 Button 與通用命名數位感測器的讀取、監看與 callback。

## `read_button()`

```python
m.read_button() -> int | None
```

讀取 Button 目前狀態。

### 回傳值

- `0`：released（放開）
- `1`：pressed（按下）
- `None`：尚未取得有效狀態的實作情境

```python
if m.read_button():
    print("pressed")
```

## `start_button()`

```python
m.start_button(period=100)
```

啟動 Button 週期監看。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `period` | `100` | 讀取間隔，單位 ms。 |

如果要使用 Button callback，High-Level MicroPython 必須先啟動監看，再讓 Scheduler 持續執行。

```python
m.start_button(50)
m.run_forever()
```

## `stop_button()`

```python
m.stop_button()
```

停止 Button 週期監看。

## `on_pressed()`

```python
m.on_pressed(sensor, callback)
```

當指定 sensor 從 `0` 變為 `1` 時執行 callback。

| 參數 | 說明 |
|---|---|
| `sensor` | 感測器名稱；板載 Button 使用 `"button"`。 |
| `callback` | 不帶參數的 callable。 |

```python
def pressed():
    print("pressed")

m.on_pressed("button", pressed)
m.start_button()
m.run_forever()
```

## `on_released()`

```python
m.on_released(sensor, callback)
```

當指定 sensor 從 `1` 變回 `0` 時執行 callback。

```python
def released():
    print("released")

m.on_released("button", released)
```

## `when_pressed()` / `when_released()`

```python
m.when_pressed(sensor="button", callback=None)
m.when_released(sensor="button", callback=None)
```

這兩個是 `on_pressed()` / `on_released()` 的便利寫法。`callback` 必須提供，否則會拋出 `TypeError`。

```python
m.when_pressed(callback=lambda: print("GO"))
```

## `read_sensor()`

```python
m.read_sensor(sensor)
```

讀取命名數位感測器。`sensor` 為名稱字串，例如 `"button"` 或 Runtime config 中已建立的命名 Button。

```python
print(m.read_sensor("button"))
```

## `start_sensor()` / `stop_sensor()`

```python
m.start_sensor(sensor, period=200)
m.stop_sensor(sensor)
```

| 參數 | 說明 |
|---|---|
| `sensor` | 命名感測器名稱。 |
| `period` | 週期讀取間隔（ms），預設 `200`。 |

這是 Button 之外的通用命名數位輸入監看介面。

## `on()`

```python
m.on(event_name, callback)
```

每次收到指定 sensor 的讀值時呼叫 `callback(value)`；與 `on_pressed()` / `on_released()` 的邊緣事件不同。

```python
def changed(value):
    print("value =", value)

m.on("button", changed)
m.start_button()
m.run_forever()
```

## Execution lifecycle

| API | 行為 | `m.run_forever()` |
|---|---|---:|
| `read_button()` / `read_sensor()` | 單次 immediate read | 不需要 |
| `on_pressed()` / `on_released()` | 只註冊 callback | 需要 |
| `start_button()` / `start_sensor()` | 建立週期監看 | 需要 |
| `stop_button()` / `stop_sensor()` | 停止監看 | 不需要 |

重要：**Button callback 註冊後不會自動開始 polling。** 必須呼叫 `start_button()`（或對應 `start_sensor()`）並持續執行 event loop。

## 完整範例：按一下切換 LED

```python
from mangobox import Mango

m = Mango()
on = False

def pressed():
    global on
    on = not on
    if on:
        m.led_all("green")
    else:
        m.led_off()

m.on_pressed("button", pressed)
m.start_button(period=50)
m.run_forever()
```

## 相關 API

`read_button()`, `start_button()`, `stop_button()`, `read_sensor()`, `start_sensor()`, `stop_sensor()`, `on()`, `on_pressed()`, `on_released()`, `when_pressed()`, `when_released()`, `run_once()`, `run_forever()`
