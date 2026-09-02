# Obstacle API Reference

## `is_blocked(sensor=None)`

Synchronously reads the selected sensor and returns `bool`.

## `block_state(sensor=None)`

Returns either `blocked` or `clear`.

## `on_blocked(callback, sensor=None, period=20)`

Calls the callback on a clear -> blocked transition.

## `on_clear(callback, sensor=None, period=20)`

Calls the callback on a blocked -> clear transition.

Registration reads the current state as a baseline so registration itself is not treated as a transition.

## Named sensors

The default sensor name is `obstacle1`. Additional names belong to Device Manager / Runtime configuration.
