# Host Python Light API Reference

## `light()`

Synchronously returns integer `0..100`:

- `0`: calibrated dark endpoint
- `100`: calibrated bright endpoint

This is not lux.

## `on_light_above(threshold, callback, hysteresis=5, period=100)`

Calls the callback when normalized light enters the above-threshold region.

## `on_light_below(threshold, callback, hysteresis=5, period=100)`

Calls the callback when normalized light enters the below-threshold region.

`threshold` and `hysteresis` must be `0..100`; `period` is clamped to at least 20 ms.

Host Python does not own Bright/Dark raw endpoint calibration or persistence.
