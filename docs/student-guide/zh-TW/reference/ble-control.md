# BLE Control API Reference

工程導向參考。以下介面以 **MangoLite Runtime v0.6.3** 實際 `student_api_ble_control.py` 與已驗證 Dabble examples 為準，不採用早期 Contract 中尚未落地的 `Dabble(...)` 草案介面。

## Availability

| Target / Mode | BLE Control v1 |
|---|---:|
| MangoLite + Pico W / High Level MicroPython | 支援（v0.6.3） |
| MangoLite + Pico 2 W / High Level MicroPython | 支援（v0.6.3） |
| MangoLite Host Python | 不宣告支援 |
| MangoX2 + Pico W / Pico 2 W | 尚未納入 v1 |
| non-wireless Pico | 不適用 |

Canonical learner import：

```python
from mangobox import Mango
```

BLE Control runtime 採 lazy creation；第一次使用 BLE Control API 時才建立。正常 Runtime 啟動不會因此自動開啟 pairing window。

## `on_control()`

```python
m.on_control(control, action, callback, controller="primary")
```

註冊一個正規化 BLE controller event callback。

### Parameters

| 參數 | 型別 | 說明 |
|---|---|---|
| `control` | `str` | 控制名稱。v0.6.3 已驗證 Digital controls 見下表；Analog joystick 使用 `"joystick"`。 |
| `action` | `str` | 只接受 `"press"`, `"release"`, `"value"`。 |
| `callback` | callable | 事件觸發時執行的 callback。 |
| `controller` | `str` | 預設 `"primary"`。v1 仍只有一個 active controller owner。 |

### Returns

回傳原本註冊的 `callback`。

### Raises

- `TypeError`：`callback` 不可呼叫。
- `ValueError`：`control` 為空字串，或 `action` 不是 `press/release/value`。

### Callback arguments

一般 Digital `press/release` callback 的 beginner form 不需要參數：

```python
def pressed():
    print("pressed")
```

`control="joystick"` 且 `action="value"` 時，標準 callback form 為：

```python
def changed(angle, radius):
    ...
```

Runtime 也保留較進階的 value/event callback fallback，但教材應優先使用上述兩種已明確驗證形式。

## `on_control_pressed()`

```python
m.on_control_pressed(control, callback, controller="primary")
```

等同：

```python
m.on_control(control, "press", callback, controller=controller)
```

用於 Dabble Digital Gamepad 的按下事件。

## `on_control_released()`

```python
m.on_control_released(control, callback, controller="primary")
```

等同：

```python
m.on_control(control, "release", callback, controller=controller)
```

用於按鍵由 pressed 轉為 released 的事件。需要「按住移動、放開停止」時應同時註冊 pressed 與 released callback。

## `on_control_joystick()`

```python
m.on_control_joystick(callback, controller="primary")
```

等同註冊：

```python
m.on_control("joystick", "value", callback, controller=controller)
```

標準 callback：

```python
def changed(angle, radius):
    ...
```

v0.6.3 Dabble Analog Gamepad：

- `angle`：由 Dabble payload 解碼，15° 一個步階；
- `radius`：`0..7`。

不要把這個 callback 與實體 PS2 Joystick 的 `m.joystick()`（回傳 `-100..100` X/Y）混為同一個 API。

## `control_name()`

```python
name = m.control_name()
```

回傳目前有效 BLE device name（`str`）。呼叫時若 BLE Control runtime 尚未建立，會先 lazy-create runtime。

這個 API 不會自行打開 pairing window。

## `control_connected()`

```python
connected = m.control_connected()
```

回傳 primary BLE controller 是否目前已連線（`bool`）。

## Supported Digital controls

v0.6.3 Dabble adapter 目前實作：

```text
start
select
triangle
circle
cross
square
up
down
left
right
```

Digital payload 只有狀態改變時才產生 `press` / `release` event，不會因按住按鍵就無限重複觸發 pressed callback。

## Pairing lifecycle

MangoLite BLE Control v1 的 Runtime pairing UX：

```text
normal Runtime / GP3 hold
<7 s       no BLE system action
7-<10 s    warning feedback
>=10 s     open initial 60 s pairing window
```

重要規則：

- GP3 的一般短按仍保留給 Student Button API；
- normal startup 不主動開 pairing window；
- 已有 controller 連線時，不會再開第二個 pairing owner；
- disconnect 後釋放 controller ownership；
- pairing gesture 與 Button + RESET 的 Recovery / Deep Rescue boot gesture 是不同流程。

## Execution lifecycle

所有 callback 都依賴 BLE runtime 的 scheduler task 持續更新，因此標準學生程式最後需要：

```python
m.run_forever()
```

`Mango.close()` 已整合 BLE Control cleanup；關閉時若 runtime 已建立，會嘗試停止 BLE runtime。

## Logging

BLE Control event 會透過 Student API 的 canonical event emission 路徑發出 `sensor_event`，component 為 `ble_control`，payload 包含 controller、control、value 與 adapter=`dabble`。這是 Runtime 行為；學生不需要自行組 event schema。

## Minimal example

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("UP")

m.on_control_pressed("up", pressed)
print("BLE name:", m.control_name())
m.run_forever()
```

## Related APIs

`run_forever()`, `close()`, RGB/Buzzer/Servo/Motor Student APIs，以及 [BLE Control Guide](../guides/ble-control.md)。
