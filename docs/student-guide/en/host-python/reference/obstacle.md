# Host Python Obstacle API Reference

```python
is_blocked(sensor=None)
block_state(sensor=None)
on_blocked(callback, sensor=None, period=20)
on_clear(callback, sensor=None, period=20)
```

The default sensor name is `obstacle1`.

`is_blocked()` returns `bool`; `block_state()` returns `'blocked'` or `'clear'`.

Callbacks fire only on transitions after the initial baseline is established. `period` is clamped to at least 10 ms.
