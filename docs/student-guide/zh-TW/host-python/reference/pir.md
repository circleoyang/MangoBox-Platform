# Host Python PIR API Reference

## `is_motion_detected()`

同步讀取目前 PIR 狀態並回傳 `bool`。此 read 不會因為呼叫一次就永久啟動 streaming。

## `on_motion_detected(callback)`

PIR 轉為 active 時觸發 callback。

## `on_motion_cleared(callback)`

PIR 回到 inactive 時觸發 callback。

事件 callback 需要 Host 程式保持執行，例如：

```python
m.run_forever()
```

## Runtime gate

`enabled_modules.pir_sensor` 必須在 live Runtime config 中啟用。若已取得 snapshot 且模組停用，API 會拋出 `RuntimeError`。
