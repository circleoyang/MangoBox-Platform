# BLE Control 手機控制使用指南 — High Level MicroPython

BLE Control 讓 MangoLite 透過 Bluetooth Low Energy（BLE）接收 Dabble Gamepad 的控制輸入，再由你的 Student API 程式決定要控制 RGB、蜂鳴器、Servo、馬達或其他功能。

> 本頁以 **MangoLite Runtime v0.6.3** 已驗證功能為準，只適用於 **MangoLite + Pico W / Pico 2 W 的 High Level MicroPython**。MangoX2、非無線 Pico 與 Host Python 目前不要視為已支援 BLE Control。

## 30 秒快速測試

```python
from mangobox import Mango

m = Mango()

def up_pressed():
    print("UP pressed")


def up_released():
    print("UP released")

m.on_control_pressed("up", up_pressed)
m.on_control_released("up", up_released)

print("BLE name:", m.control_name())
print("Hold board Button GP3 for 10 seconds to pair")
m.run_forever()
```

執行後：

1. 長按 MangoLite 板載 Button（GP3）**10 秒**。
2. 裝置開啟約 **60 秒**的 BLE pairing window（配對視窗）。
3. 在手機 Dabble 連線到程式顯示的 BLE 名稱。
4. 開啟 **Gamepad → Digital**。
5. 按下／放開 `UP`，Shell 應分別顯示 `UP pressed` 與 `UP released`。

正常 Runtime 啟動時不會一直主動 advertising（廣播）。配對是由 10 秒 Button 手勢明確開啟；這樣教室同時開很多塊板子時比較不容易連錯裝置。

## Digital Gamepad 可用控制名稱

目前 v0.6.3 Dabble Gamepad Digital 已實作的名稱：

```text
start  select
triangle  circle  cross  square
up  down  left  right
```

初學者最常使用：

```python
m.on_control_pressed("circle", callback)
m.on_control_released("circle", callback)
```

`pressed` 與 `released` 是兩個不同事件。若作品需要「按住時動、放開時停」，兩個 callback 都要處理。

## 用方向鍵控制不同燈效

```python
from mangobox import Mango

m = Mango()

m.on_control_pressed("up", lambda: m.led_all("red"))
m.on_control_pressed("down", lambda: m.led_all("blue"))
m.on_control_pressed("left", lambda: m.breath("purple"))
m.on_control_pressed("right", lambda: m.rainbow())

m.run_forever()
```

BLE Control 只提供控制輸入，不會自行決定 RGB、Motor、Servo 或 Buzzer 的動作。這些動作仍由原本的 Mango Student API 負責。

## Analog Joystick

Dabble **Gamepad → Analog / Joystick** 可使用：

```python
m.on_control_joystick(callback)
```

callback 會收到：

```python
def joystick_changed(angle, radius):
    print("angle =", angle, "radius =", radius)
```

完整程式：

```python
from mangobox import Mango

m = Mango()

def joystick_changed(angle, radius):
    print("angle =", angle, "radius =", radius)

m.on_control_joystick(joystick_changed)
m.run_forever()
```

目前 Dabble Analog Gamepad 的 `angle` 以 15° 為解析步階，`radius` 為 `0..7`。不要自行換成未經驗證的 `-100..100` 或其他範圍。

## 通用事件寫法

進階使用可以直接指定 control 與 action：

```python
m.on_control("triangle", "press", callback)
m.on_control("triangle", "release", callback)
m.on_control("joystick", "value", joystick_callback)
```

目前合法 action 是：

```text
press
release
value
```

`controller` 參數預設為 `"primary"`。v0.6.3 仍是單一 controller owner；保留 selector 是為了未來擴充，不代表現在可以同時接多支手機控制。

## 查詢 BLE 名稱與連線狀態

```python
print(m.control_name())
print(m.control_connected())
```

- `control_name()`：回傳目前有效 BLE device name。
- `control_connected()`：目前 primary controller 已連線時回傳 `True`。

這兩個 API 會 lazy-create（延遲建立）BLE Control runtime；但建立 runtime **不等於自動打開 pairing window**。

## 為什麼需要 `m.run_forever()`？

BLE callback 依賴 Mango scheduler 持續更新 BLE runtime，因此 callback 程式最後要保持 event loop：

```python
m.run_forever()
```

只註冊 callback 後讓 `main.py` 結束，後續手機按鍵不會繼續被處理。

## 連線與安全建議

BLE Control 本身只產生控制事件，不會假設你的作品是小車，所以 disconnect（斷線）不會自動替所有專題執行同一種動作。

如果控制的是馬達或會移動的機構，學生程式仍應設計安全停止邏輯。官方 Digital Car 範例也會在程式結束時嘗試停止馬達。

## 沒反應時依序檢查

1. 確認 Runtime 是 MangoLite **v0.6.3 或更新的相容版本**。
2. 確認 MCU 是 **Pico W 或 Pico 2 W**，不是非無線 Pico。
3. 程式至少呼叫一個 BLE Control API，例如 `on_control_pressed()` 或 `control_name()`，讓 BLE Control runtime 被建立。
4. 長按板載 Button GP3 **10 秒**，不要只短按；正常短按仍保留給 Student Button 使用。
5. Dabble 連線到 `m.control_name()` 顯示的裝置名稱。
6. Digital callback 請確認 Dabble 在 **Gamepad → Digital**；Joystick callback 請使用 **Gamepad → Analog / Joystick**。
7. callback 程式最後保留 `m.run_forever()`。
8. 已連線時再次長按不會另開 pairing window；v1 同時只允許一個 controller owner。

若手機中斷連線，Runtime 會釋放 controller ownership，之後可重新進入 pairing／reconnect 流程，不需要為了單純斷線就重刷 firmware。

## 已驗證範例

Runtime 內已有 BLE Control 教學範例，例如：

- `ble_button_basic.py`
- `ble_rgb_buttons.py`
- `ble_buzzer_gamepad.py`
- `ble_servo_control.py`
- `ble_joystick_hue_ring.py`
- `ble_car_digital.py`
- `ble_car_analog.py`

它們位於 `runtime/mangolite-pico2w/firmware/examples/`，可作為較完整作品的基礎。

## 小挑戰

讓 `UP / DOWN / LEFT / RIGHT` 各顯示一種不同燈效，再用 `CIRCLE` 播放一個短音效。先只用已存在的 Student API 組合，不需要處理任何 BLE packet 或 UUID。

完整函式簽章與適用版本請看 [BLE Control API Reference](../reference/ble-control.md)。
