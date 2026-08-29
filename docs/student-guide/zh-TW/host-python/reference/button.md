# Button API Reference — Host Python

適用：Host package `0.4.6` + 相容 Runtime。

## `read_button()`

```python
read_button() -> int | None
```

Host 0.4.6 會送出 Runtime read command，等待新的 Button reply，再回傳目前值。若在 timeout 內沒有收到新的有效回覆，可能回傳目前已知值或 `None`。

一般語意：

- `0`：released（放開）
- `1`：pressed（按下）

## `on_pressed()` / `on_released()`

```python
on_pressed(sensor, callback) -> None
on_released(sensor, callback) -> None
```

板載 Button 使用 `sensor="button"`。

## `start_button()` / `stop_button()`

```python
start_button(period=100) -> None
stop_button() -> None
```

`start_button()` 要求 Runtime 開始回報 Button 狀態。

## Execution lifecycle

Host callback 路徑如下：

```text
Runtime Button event
→ Host UART listener
→ semantic pressed/released 判定
→ callback thread
```

因此 callback 範例通常需要：

```python
m.on_pressed("button", callback)
m.start_button(100)
m.run_forever()
```

這裡的 `run_forever()` 只是讓 PC process 保持存活；它不驅動 Runtime Sensor Scheduler。

直接 `read_button()` 是同步讀值，不需要 `run_forever()`。

## Availability

使用 `m.supports("button")` / `m.capabilities()`。Host capability discovery 使用啟動時已取得的 Runtime configuration snapshot，不會因 `supports()` 額外開 port 或送 probe。
