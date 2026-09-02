# Line Tracking API Reference

## 讀值

```python
line_left()   # -> bool
line_right()  # -> bool
line_state()  # -> 'none' | 'left' | 'right' | 'both'
```

## 事件

```python
on_line_change(callback, period=50)
on_line_left(callback, period=50)
on_line_right(callback, period=50)
on_line_both(callback, period=50)
on_line_clear(callback, period=50)
```

`period` 最低會限制為 20 ms。所有事件共用 Runtime monitor；新 callback 若要求更快 period，monitor 會調整為較快值。

`on_line_change(callback)` 的 callback 接收一個 `state` 參數；其餘特定狀態 callbacks 不帶參數。

事件程式需執行 `m.run_forever()`。

## Host 限制

目前 MangoX2 預設 GP12/GP13 由 Host UART 使用，因此 Host Python profile 不宣告 `line_tracking`。這是 transport ownership 限制，不代表 High-Level MicroPython API 不存在。
