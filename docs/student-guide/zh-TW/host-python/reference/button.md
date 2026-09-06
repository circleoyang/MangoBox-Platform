# Button API Reference — Host Python

## 讀取

```python
m.read_button() -> int | None
m.read_sensor(sensor)
```

`read_button()` 通常回傳 `0`（released）或 `1`（pressed）。`read_sensor(sensor)` 可讀命名數位感測器。

## 事件

```python
m.on_pressed(sensor, callback)
m.on_released(sensor, callback)
m.when_pressed(sensor="button", callback=...)
m.when_released(sensor="button", callback=...)
```

| 參數 | 說明 |
|---|---|
| `sensor` | 感測器名稱；板載／預設 Button 使用 `"button"`。 |
| `callback` | 事件發生時執行的 callable。 |

```python
def pressed():
    print("pressed")

m.on_pressed("button", pressed)
m.run_forever()
```

## Host lifecycle

Host Python 的 callback 需要 PC process 持續接收 Runtime 事件，因此事件式程式應保持 `m.run_forever()` 或目前 Host package 對應的事件服務流程。

High-Level MicroPython 的 `start_button()` polling 細節不要直接套到 Host transport；Host 端由目前相容 Host package / Runtime event path 決定資料傳輸。

## 通用 sensor API

```python
m.read_sensor(sensor)
m.start_sensor(sensor, period=200)
m.stop_sensor(sensor)
```

`period` 單位為 ms。是否需要顯式 `start_sensor()` 應依目前 Host package contract；若使用高階專用 callback，優先依該 API 的文件與 capability resolver。

## Capability

```python
print(m.supports("button"))
```
