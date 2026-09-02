# Ultrasonic API Reference

## `distance(sensor=None)`

Returns distance in centimeters, or `None` when there is no valid measurement.

## `is_near(distance_cm, sensor=None)`

Reads the current distance and returns whether it is less than or equal to the threshold.

## `on_near(distance_cm, callback, period=100, sensor=None)`

Calls the callback when the sensor enters the Near region.

## `on_far(distance_cm, callback, period=100, sensor=None)`

Calls the callback when the sensor enters the Far region. If both thresholds are configured, Far must be greater than Near.

Event programs must keep `m.run_forever()` running.

## Named sensors

`current_ultrasonic_setting` / `ultrasonic_sensors` are Runtime configuration. Student code selects a device with `sensor='name'` and does not recreate the Trigger/Echo driver.
