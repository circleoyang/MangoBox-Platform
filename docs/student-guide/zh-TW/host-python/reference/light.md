# Host Python Light API Reference

## `light()`

同步回傳整數 `0..100`：

- `0`：校正後較暗端
- `100`：校正後較亮端

這不是 lux。

## `on_light_above(threshold, callback, hysteresis=5, period=100)`

當 normalized light 進入高於 threshold 的區域時觸發 callback。

## `on_light_below(threshold, callback, hysteresis=5, period=100)`

當 normalized light 進入低於 threshold 的區域時觸發 callback。

`threshold` 與 `hysteresis` 必須在 `0..100`。`period` 最低為 20 ms。

## Calibration ownership

Host 不執行 Bright/Dark raw endpoint calibration；校正與持久化由 firmware/runtime 管理。
