# Host Python Obstacle API Reference

```python
is_blocked(sensor=None)
block_state(sensor=None)
on_blocked(callback, sensor=None, period=20)
on_clear(callback, sensor=None, period=20)
```

未指定 `sensor` 時預設 `obstacle1`。

`is_blocked()` 回傳 `bool`；`block_state()` 回傳 `'blocked'` 或 `'clear'`。

Callbacks 只在已建立 baseline 後的狀態 transition 觸發。`period` 最低會限制為 10 ms。
