# Host Python Ultrasonic API Reference

```python
distance(sensor=None)
is_near(distance_cm, sensor=None)
on_near(distance_cm, callback, period=100, sensor=None)
on_far(distance_cm, callback, period=100, sensor=None)
```

`distance()` 回傳 cm，無有效量測時可為 `None`。

Host synchronous read 會等待同一次 Runtime reply generation，而不是只讀取上一個 edge/change 值。

Near/Far monitor 會使用短期 filtered values；若兩個門檻同時存在，Far 必須大於 Near。

Named sensor 由 `sensor='name'` 選擇，設定來源是 Runtime / Device Manager。
