# Line Tracking API Reference

## Reads

```python
line_left()   # -> bool
line_right()  # -> bool
line_state()  # -> 'none' | 'left' | 'right' | 'both'
```

## Events

```python
on_line_change(callback, period=50)
on_line_left(callback, period=50)
on_line_right(callback, period=50)
on_line_both(callback, period=50)
on_line_clear(callback, period=50)
```

`period` is clamped to at least 20 ms. Registered callbacks share one Runtime monitor; a newly requested faster period can reconfigure that monitor.

`on_line_change` passes one `state` argument. State-specific callbacks take no argument. Event programs require `m.run_forever()`.

## Host constraint

Current MangoX2 Host UART owns the default GP12/GP13 pair, so Host Python profiles intentionally do not advertise `line_tracking`.
