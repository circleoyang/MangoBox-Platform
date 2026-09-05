# Host Python IR API Reference

## `is_ir_pressed(key)`

同步要求 Runtime 回傳目前 IR state，若指定 key 正處於 pressed 狀態則回傳 `True`。

```python
m.is_ir_pressed('ok')
```

## `on_ir_pressed(key, callback)`

指定 NEC key 由未按下轉為按下時執行 callback。

## `on_ir_released(key, callback)`

指定 NEC key 放開時執行 callback。

## Key 名稱

```text
1 2 3 4 5 6 7 8 9 * 0 # up left ok right down
```

名稱不分大小寫，其他名稱會拋出 `ValueError`。

## Target gate

MangoLite 固定 IR 不由 `enabled_modules.ir_sensor` 控制；MangoX2 若 live Runtime snapshot 顯示 `ir_sensor=false`，API 會拋出 `RuntimeError`。
