# MangoBox Runtime Config：讀取 Device Manager 設定

適用：**MangoLite 與 MangoX2 的 High-Level MicroPython**。這是現有 `Mango().config.get()` 介面的使用教學，**不需要新增任何 API，也不需要修改 Firmware 或 Device Manager**。此寫法不直接代表 Host Python／MangoThonny 支援相同屬性。

## 為什麼不要重複寫死硬體參數？

Device Manager（DM）負責設定燈條名稱、燈珠數、腳位、按鈕接線及部分感測器設定。程式應優先讀取這些設定，而不是把 LED 數量或 GPIO 複製成固定常數。這能降低變更硬體時的維護工作，並避免「DM 設 12 顆，程式仍只控制 6 顆」的錯誤。

```python
from mangobox import Mango
m = Mango()

print("LED strips:", m.config.get("led_strips", {}))
print("Buttons:", m.config.get("buttons", {}))
```

**`m.config.get(key, default=None)`** 只讀取目前 `Mango()` 建立時載入的 Runtime 設定。若 DM 在程式執行中改動配置，請重新啟動程式並建立新的 `Mango()`，**不能假設設定會即時同步**。

## 1. 查詢具名燈條：LED 顆數、GPIO、啟用狀態

```python
from mangobox import Mango
m = Mango()

STRIP = "strip1"  # DM 中定義的燈條名稱
spec = m.config.get("led_strips", {}).get(STRIP)

if not isinstance(spec, dict):
    raise ValueError("找不到燈條：" + STRIP)
if not spec.get("enabled", False):
    raise ValueError("燈條尚未啟用：" + STRIP)

led_count = int(spec["leds"])
if led_count <= 0:
    raise ValueError("LED 數量設定錯誤")

print("pin =", spec.get("pin"))
print("leds =", led_count)
print("power =", spec.get("power"))
```

這個 `led_count` 可以直接拿來建立逐顆 LED 動畫迴圈。**可直接使用已驗證的 [Quantum Ripple 自訂燈效](guides/scheduler.md)**：`m.scheduler.add_task()` 排程更新，而 LED 顆數則由 DM 設定取得。

## 2. 查詢具名 Button 與 Cap Touch

```python
buttons = m.config.get("buttons", {})
button = buttons.get("button1")
if isinstance(button, dict) and button.get("enabled", False):
    print("button1 GPIO =", button.get("pin"))
    print("pull =", button.get("pull"))
    print("active =", button.get("active"))
    print("debounce_ms =", button.get("debounce_ms"))

touch = m.config.get("cap_touches", {}).get("touch1")
if isinstance(touch, dict) and touch.get("enabled", False):
    print("touch1 GPIO =", touch.get("pin"))
```

**注意：** `button1`、`touch1`、`strip1` 都是配置名稱，不應推測所有板子都預先啟用這些模組。

## 3. 查詢感測器與輸出裝置

部分舊型模組採用**獨立鍵值**，不是具名字典。可以使用 `get()` 讀取，不過應先確認模組是否已啟用。

| 模組 | 主要 Runtime Config 鍵 | 作用 |
|---|---|---|
| Light | `light_sensor_pin` | 類比輸入 GPIO |
| Sound | `sound_sensor_pin` | 類比輸入 GPIO |
| Servo | `servo_pin`, `servo_min_angle`, `servo_max_angle` | 腳位、允許角度範圍 |
| Ultrasonic | `ultrasonic_trigger_pin`, `ultrasonic_echo_pin`（依版本） | Trig / Echo 腳位，先確認該版是否有這些鍵 |
| Motor | `motor_a_in1_pin`, `motor_a_in2_pin`, `motor_b_in1_pin`, `motor_b_in2_pin` | 雙馬達方向控制腳位 |
| Joystick | `ps2_vrx_pin`, `ps2_vry_pin`, `ps2_sw_pin` | X / Y 類比輸入、按鍵 |
| OLED | `oled_sda_pin`, `oled_scl_pin`, `oled_addr` | I²C 腳位與位址 |
| Buzzer | `buzzer_pin`, `buzzer_mode` | GPIO 與輸出模式 |
| IR | `ir_sensor_pin`、`ir_receiver_pin`（依板型與版本） | 紅外線接收腳位 |
| PIR | `pir_sensor_pin` | 人體感測器 GPIO |
| Pot | **以實際該版 DM/Runtime Config 結構為準** | 具名 Pot 與校正參數不可由其他模組格式猜測 |

```python
enabled = m.config.get("enabled_modules", {})
print("Light enabled:", enabled.get("light_sensor"))
print("Light GPIO:", m.config.get("light_sensor_pin"))

print("Motor A:", m.config.get("motor_a_in1_pin"),
      m.config.get("motor_a_in2_pin"))

print("OLED address:", m.config.get("oled_addr"))
```

**版本限制：** 各版 Config 結構可能不同，部分設定在舊版尚未存在。尤其 Ultrasonic、Pot 等新增模組，請核對所用 Runtime 的正式配置，不要為不存在的鍵猜測數值。使用 `m.config.get("unknown")` 會回傳 `None`，並不表示模組已經正確設定。

## 4. 讀取與寫入的責任分工

- `m.config.get()`：讀取目前載入的配置。
- DM：新增模組、調整 GPIO、命名、校正及儲存設定。
- 學生程式：選取具名元件，引用 DM 配置，使用正式 Student API 控制與讀值。
- **不要直接編輯 `m.config.data`、`m.config.save()` 或寫入設備設定檔**，避免繞過 DM 驗證、產生腳位衝突或破壞既有設備配置。

## 5. 如何讓 AI 正確運用 Config？

請把這份教學與相關模組 API Reference 一起提供給大型語言模型（LLM），並要求：

> 使用 MangoBox 現有 High-Level MicroPython API 撰寫程式。所有 DM 已管理的 LED 燈珠數、腳位、名稱等參數，優先以 `m.config.get()` 讀取。先檢查缺值與 `enabled`；不知道某個模組的 Config 鍵時，請先說明需查官方配置，不能虛構 `m.led_count()`、`m.led_info()` 等不存在的方法，也不要把這套 Runtime 存取方式誤用於 Host Python。

## 6. 常見問題

**Q：為什麼找不到 `strip1`？** 請確認 DM 已新增、命名、啟用並儲存，再重新啟動程式。

**Q：為什麼我修改了 DM 設定，程式沒更新？** `Mango()` 已載入舊配置，請重新啟動程式。

**Q：能不能用同一個字典形式查詢每種感測器？** 不能。像 LED／Button 使用具名字典，Light／Motor 常以獨立配置鍵儲存；請依照實際資料結構判斷。

**Q：`m.config.get()` 是新的 Student API 嗎？** 不是新功能；它是現有 Runtime Config 的公開可存取方法，本篇只教正確讀法。

相關教學：[Scheduler 自訂排程](guides/scheduler.md)／[RGB LED](guides/led.md)。
