# Ultrasonic API Reference

## `distance(sensor=None)`

讀取距離，單位為 cm。無有效量測時可回傳 `None`。

```python
m.distance()
m.distance('front')
```

## `is_near(distance_cm, sensor=None)`

讀取目前距離並判斷是否小於等於門檻。

```python
m.is_near(20)
```

## `on_near(distance_cm, callback, period=100, sensor=None)`

距離進入 Near 區域時呼叫 callback。

## `on_far(distance_cm, callback, period=100, sensor=None)`

距離進入 Far 區域時呼叫 callback。若 Near/Far 同時存在，Far threshold 必須大於 Near threshold。

事件式程式需保留：

```python
m.run_forever()
```

## Named sensor

`current_ultrasonic_setting` 或 `ultrasonic_sensors` 由 Runtime/Device Manager 管理。Student API 以 `sensor='name'` 選擇，不需要在學生程式重建 Trigger/Echo driver。
