# Host Python IR API Reference

## `is_ir_pressed(key)`

Synchronously requests the current IR state and returns `True` when the selected key is currently pressed.

## `on_ir_pressed(key, callback)`

Calls the callback when the NEC key transitions to pressed.

## `on_ir_released(key, callback)`

Calls the callback when the key is released.

## Key names

```text
1 2 3 4 5 6 7 8 9 * 0 # up left ok right down
```

Names are normalized to lowercase. Unknown names raise `ValueError`.

## Target gate

MangoLite fixed IR is not gated by `enabled_modules.ir_sensor`. MangoX2 raises `RuntimeError` when a live Runtime snapshot shows `ir_sensor=false`.
