# Host Python Sound API Reference

## `sound_level()`

Synchronously returns integer relative sound intensity `0..100`. It is not SPL/dB.

## `on_sound_above(threshold, callback, hysteresis=5, period=100)`

Calls the callback when sound enters the above-threshold region.

## `on_sound_below(threshold, callback, hysteresis=5, period=100)`

Calls the callback when sound enters the below-threshold region.

`threshold` and `hysteresis` must be `0..100`; `period` is clamped to at least 20 ms.

Runtime raw sound represents short-window peak-to-peak amplitude. Host Python does not reimplement P90/P98 calibration math.
