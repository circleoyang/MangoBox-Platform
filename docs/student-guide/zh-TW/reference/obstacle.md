# Obstacle API Reference

## `is_blocked()`

```python
m.is_blocked(sensor=None) -> bool
```

同步讀取指定障礙物感測器並回傳是否偵測到障礙。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `sensor` | `None` | 命名感測器；省略時使用預設 obstacle sensor。 |

```python
if m.is_blocked():
    m.stop()
```

## `block_state()`

```python
m.block_state(sensor=None) -> str
```

以可讀字串回傳目前狀態：

```text
blocked
clear
```

```python
print(m.block_state())
```

## `on_blocked()`

```python
m.on_blocked(callback, sensor=None, period=20)
```

當狀態由 `clear` 轉成 `blocked` 時執行 callback。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `callback` | 必填 | 進入 blocked 時執行的函式。 |
| `sensor` | `None` | 命名感測器。 |
| `period` | `20` | 狀態更新間隔（ms）。 |

## `on_clear()`

```python
m.on_clear(callback, sensor=None, period=20)
```

當狀態由 `blocked` 回到 `clear` 時執行 callback。

註冊事件時 Runtime 會先讀一次目前狀態作為 baseline，因此「註冊 callback」本身不應被當成一次狀態改變事件。

## 範例：障礙停車

```python
from mangobox import Mango

m = Mango()

def blocked():
    m.stop()
    m.led_all("red")

def clear():
    m.led_all("green")

m.on_blocked(blocked)
m.on_clear(clear)
m.forward(30)
m.run_forever()
```

## Named sensor

多顆障礙物感測器由 Device Manager / Runtime config 命名與管理。Student API 用 `sensor="name"` 選擇；不要在學生程式內重建 GPIO driver。

## 相關 API

`is_blocked()`, `block_state()`, `on_blocked()`, `on_clear()`, `supports("obstacle")`, `run_forever()`
