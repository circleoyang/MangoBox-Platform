# Host Python Sound API Reference

## `sound_level()`

同步回傳相對聲音強度整數 `0..100`。不是 SPL/dB。

## `on_sound_above(threshold, callback, hysteresis=5, period=100)`

高於門檻時觸發 callback。

## `on_sound_below(threshold, callback, hysteresis=5, period=100)`

低於門檻時觸發 callback。

`threshold` 與 `hysteresis` 必須在 `0..100`；`period` 最低為 20 ms。

## Raw semantics

Runtime 的 Sound raw 代表短時間窗 peak-to-peak amplitude；normalized learner value 由 firmware-owned quiet/reference calibration 產生。Host API 不重做 P90/P98 calibration math。
