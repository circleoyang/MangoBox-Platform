# Obstacle API Reference

## `is_blocked(sensor=None)`

同步讀取指定感測器並回傳 `bool`。

## `block_state(sensor=None)`

回傳：

```text
'blocked'
'clear'
```

## `on_blocked(callback, sensor=None, period=20)`

由 clear 轉為 blocked 時觸發 callback。

## `on_clear(callback, sensor=None, period=20)`

由 blocked 轉為 clear 時觸發 callback。

註冊 event 時會先讀取目前狀態作為 baseline，因此註冊本身不應被當成一次狀態變化事件。

## Named sensor

未指定 `sensor` 時預設名稱為 `obstacle1`。多裝置名稱由 Device Manager / Runtime config 管理。
