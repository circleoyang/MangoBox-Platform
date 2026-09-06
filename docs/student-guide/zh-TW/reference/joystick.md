# Joystick API Reference

> 僅在目前 target / mode / version 提供 `joystick` capability 時使用本頁。

## `joystick()`

```python
m.joystick() -> tuple[int, int]
```

同步讀取搖桿方向，回傳 `(x, y)`；兩軸皆標準化為約 **-100～100**，中立位置通常為 `0`。

```python
x, y = m.joystick()
print(x, y)
```

搖桿按鍵狀態**不包含在這個回傳值中**，請使用 `is_joystick_pressed()`。

## `is_joystick_pressed()`

```python
m.is_joystick_pressed() -> bool
```

同步讀取 Joystick / PS2 的 SW 按鍵是否按下。

## `on_joystick_pressed()`

```python
m.on_joystick_pressed(callback, period=50)
```

按下 SW 時執行 callback。

## `on_joystick_released()`

```python
m.on_joystick_released(callback, period=50)
```

放開 SW 時執行 callback。

## `calibrate_joystick()`

```python
m.calibrate_joystick(samples=16)
```

在搖桿放開、位於中心位置時重新校正中心值。`samples` 為取樣次數。

## 執行生命週期

| API | High-Level MicroPython 行為 | 需要 `m.run_forever()` |
|---|---|---:|
| `joystick()` | 立即同步讀取 X/Y | 否 |
| `is_joystick_pressed()` | 立即同步讀取 SW | 否 |
| `calibrate_joystick()` | 一次性校正 | 否 |
| `on_joystick_pressed()` / `on_joystick_released()` | 啟動 watcher，後續事件由 Scheduler 處理 | 是 |

callback API 會自行啟動 Joystick watcher，不需要另外呼叫 `start_sensor()`。若讀值正常但 callback 沒有觸發，優先確認 event loop 是否持續執行。

## 設定與校準

Joystick 的 ADC Pin、SW Pin、deadzone、中心值與 span 由 Runtime / Device Manager 管理。Student API 不提供 `joystick("name")` 這類 named-sensor 參數；學生程式不應自行硬編碼另一套 raw ADC center。

## 範例

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("pressed")

m.on_joystick_pressed(pressed)
m.run_forever()
```

## 相關 API

`joystick()`, `is_joystick_pressed()`, `on_joystick_pressed()`, `on_joystick_released()`, `calibrate_joystick()`, `run_forever()`
