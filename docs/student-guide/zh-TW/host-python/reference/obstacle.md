# Obstacle API Reference — Host Python

## 同步讀取

```python
m.is_blocked(sensor=None) -> bool
m.block_state(sensor=None) -> str
```

`is_blocked()` 回傳布林值；`block_state()` 回傳 `"blocked"` 或 `"clear"`。`sensor=None` 使用目前預設 obstacle sensor。

```python
if m.is_blocked():
    m.stop()
```

## 事件

```python
m.on_blocked(callback, sensor=None, period=20)
m.on_clear(callback, sensor=None, period=20)
```

| 參數 | 說明 |
|---|---|
| `callback` | 邊緣事件發生時執行的函式。 |
| `sensor` | 命名感測器。 |
| `period` | Runtime 監看更新間隔（ms），預設 20。 |

事件註冊會先建立 baseline，不把「註冊當下的狀態」誤當成一次變化事件。Host callback 需要保持 PC process 的事件接收流程。

## Capability

```python
print(m.supports("obstacle"))
```

多裝置名稱與 active level 由 Runtime / Device Manager 管理。
