# Host Python PIR API Reference

## `is_motion_detected()`

Synchronously returns the current PIR state as `bool`.

## `on_motion_detected(callback)`

Calls the callback when PIR becomes active.

## `on_motion_cleared(callback)`

Calls the callback when PIR returns inactive.

Event callbacks require the Host process to remain running, for example with `m.run_forever()`.

## Runtime gate

`enabled_modules.pir_sensor` must be enabled in the live Runtime configuration. A disabled known snapshot causes `RuntimeError`.
