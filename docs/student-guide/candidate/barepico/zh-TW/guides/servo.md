# BarePico 外接伺服馬達

> 候選來源：BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26；來源核對不等於實機通過。

## 1. 可以做什麼與準備

控制具名伺服馬達的目標角度，或以小步進平滑移動。DM 需啟用 `enabled_modules.servo`，在 `servos` 配好名稱、`enabled`、`pin`、角度與脈波範圍。多顆時選 `current_servo_setting`。先移除負載或確認機構活動空間；電源依實際伺服規格配置並共地。

## 2. 30 秒快速測試

此程式依 DM 角度範圍取中點，只送一次直接定位，半秒後 `close()`，清理所有排程並 deinit PWM。執行前確認中點在實際機構允許範圍。這個快速測試沒有啟動 move_to，不把 release 當作移動完成。

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("servo", False):
        raise RuntimeError("Enable servo in Device Manager")
    group = m.config.get("servos", {})
    if not isinstance(group, dict):
        raise ValueError("Check the configured servos table")
    items = {key: value for key, value in group.items()
             if isinstance(value, dict) and value.get("enabled", False)}
    name = m.config.get("current_servo_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled servos entry in Device Manager")
        name = next(iter(items))
    spec = items[name]

    low = spec.get("min_angle", 0)
    high = spec.get("max_angle", 180)
    if type(low) is not int or type(high) is not int or not 0 <= low < high <= 180:
        raise ValueError("Check the configured Servo angle limits")
    center = (low + high) // 2
    m.select_servo(name)
    m.servo(center)
    print("Requested:", center, "Stored command:", m.servo_get_angle())
    time.sleep_ms(500)
finally:
    m.close()
```

## 3. 應該觀察到什麼

伺服應移向配置範圍的中點。`servo_get_angle()` 回傳的是軟體記錄的命令角度，不是實體編碼器回授；轉軸卡住時數字仍可能改變。本頁用 `close()` 完整清理；沒有持續 PWM 後，不能假設機構仍保持原位置。

## 4. 常見用法

先 `select_servo(name)`，再用 `servo(angle)` 或 `servo_move_to(angle, step, period)`。BarePico 不接受 Carrier 的 `servo(angle, name=...)`。尚未保存角度時，第一次 move_to 直接寫目標；本頁互動範例先明確設定中點。

**候選來源限制：`servo_stop()` 只停止 sweep，`servo_release()` 停 sweep 並設 PWM duty=0，二者不取消未完成的 move_to。** 舊 move task 下一輪可能重新輸出；直接 servo() 也不取消它。因此不重疊 move_to，不把 stop/release 當完成或取消確認。完整結束使用 `close()`，其後重建 Mango。

## 5. 完整互動範例

輸入 l／c／r，在中點左右各 15 度之內平滑移動。範例依 DM 限制候選位置，持續服務 Scheduler 到軟體命令角度達標，再多跑一個到期週期讓 move task 自行退出，才等待下一個輸入。三秒仍未達標就拋錯並 close。這只觀察軟體流程，仍須自己確認實體機構，所有操作都在前景。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("servo", False):
    raise RuntimeError("Enable servo in Device Manager first")
items = {name: spec for name, spec in m.config.get("servos", {}).items()
         if isinstance(spec, dict) and spec.get("enabled", False)}
name = m.config.get("current_servo_setting")
if name not in items:
    if len(items) != 1:
        raise ValueError("Select one enabled servos entry in Device Manager")
    name = next(iter(items))
spec = items[name]

low = max(0, int(spec.get("min_angle", 0)))
high = min(180, int(spec.get("max_angle", 180)))
if low >= high:
    raise ValueError("Check the configured Servo angle limits")
center = (low + high) // 2
m.select_servo(name)

def move_and_wait(target):
    period = 60
    m.servo_move_to(target, step=2, period=period)
    started = time.ticks_ms()
    while m.servo_get_angle() != target:
        if time.ticks_diff(time.ticks_ms(), started) >= 3000:
            raise RuntimeError("Software move did not finish; close the session")
        m.run_once()
        time.sleep_ms(10)
    # Let the move task remove itself on the next due pass.
    reached = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), reached) < period:
        m.run_once()
        time.sleep_ms(10)
    m.run_once()

positions = {"l": max(low, center - 15), "c": center, "r": min(high, center + 15)}
try:
    m.servo(center)
    while True:
        command = input("l / c / r / q: ").strip().lower()
        if command == "q":
            break
        if command in positions:
            move_and_wait(positions[command])
            print("Commanded angle:", m.servo_get_angle())
finally:
    m.close()
```

## 6. 適用範圍與問題排除

適用 BarePico High-Level MicroPython v0.1.0-rc6 候選來源，尚不能由程式檢查替代真實機構驗收。

排錯：profile → Servo 總開關與具名 enable → GPIO／訊號線 → DM 的角度／脈波限制 → 外部供電與共地 → 機械卡阻。若抖動或重啟先檢查供電。GPIO／限制修改後重新建立 Mango。PWM slice 與 Motor/Buzzer 衝突時先重新分配，不自行開第二個 PWM owner。

## 7. 小挑戰

把左右幅度改成 5 度，再逐步調整 `step` 與 `period`，比較移動速度。不要把學習範例直接改成 0～180 度全掃，先核對機構允許角度。

[API Reference](../reference/servo.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
