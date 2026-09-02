# Host Python Ultrasonic API Reference

```python
distance(sensor=None)
is_near(distance_cm, sensor=None)
on_near(distance_cm, callback, period=100, sensor=None)
on_far(distance_cm, callback, period=100, sensor=None)
```

`distance()` returns centimeters or `None` for no valid measurement.

Host synchronous reads wait for the matching Runtime reply generation instead of relying only on a previous edge/change value.

Near/Far monitoring uses short-term filtered values. If both thresholds exist, Far must be greater than Near.

Select a named device with `sensor='name'`; device definitions belong to Runtime / Device Manager.
