# MangoLite Servo：從單一設定角度到短時間往返

> 來源候選 Runtime 0.6.5-rc2；MangoLite + Pico W / Pico 2 W；High-Level MicroPython。以下是來源核對後的教學，沒有宣告實機驗收完成。

## 1. 可以完成什麼與準備事項

Servo（伺服馬達）能接受角度命令，可用於輕量指針或小型展示機構。這個 Lite facade 控制 DM 設定的單一 Servo，方法不接受 `name=`，也沒有 `select_servo()`。不要直接套用 MangoX2 的多 Servo 範例。

先在 Device Manager 啟用 Servo，核對 `servo_pin`、`servo_min_angle`、`servo_max_angle`、`servo_min_us` 和 `servo_max_us`。訊號腳依 DM 設定接線；供電要符合 Servo 規格並與 MangoBox 共地。初次測試先卸下會卡住、撞擊或掉落的負載，確認設定角度範圍適合機構；API 接受的 0–180 不代表你的機構能安全轉完整圈。

## 2. 30 秒快速測試

這份完整程式先檢查設定，只在輸入 `RUN` 後送出設定範圍的中間角度，稍候再解除 PWM 保持訊號。

```python
from mangobox import Mango
import time

m = Mango()
active = False
try:
    if not m.config.get("enabled_modules", {}).get("servo", False):
        raise RuntimeError("Enable Servo in Device Manager")
    low = int(m.config.get("servo_min_angle", 0))
    high = int(m.config.get("servo_max_angle", 180))
    if not 0 <= low < high <= 180:
        raise ValueError("Check the configured Servo angle range")
    center = (low + high) // 2
    print("Signal GPIO:", m.config.get("servo_pin"))
    print("Requested center:", center)
    if input("Clear the mechanism; type RUN: ").strip() == "RUN":
        active = True
        m.servo(center)
        time.sleep_ms(800)
        print("Software angle:", m.servo_get_angle())
finally:
    try:
        if active:
            m.servo_release()
    finally:
        m.close()
```

這裡只有立即角度命令，沒有需常駐的 callback，因此短暫等待不會取代必要的事件迴圈。下一個互動範例會示範持續服務 Scheduler。

## 3. 應該觀察什麼

若設定、供電與機構都合適，Servo 應向指定中間角度移動。`servo_get_angle()` 是 Runtime 最近回報/保留的軟體角度，可能為 `None`，不能當作實際角度感測器。命令正常回傳也無法證明機構已到位。

`servo_release()` 解除保持訊號後，軸可能被外力移動；不要用這份範例懸掛重物。若持續嗡鳴、卡住、抖動或裝置重開機，停止測試，先查角度/PWM 範圍、供電與機構負載。

## 4. 常見用途與方法選擇

| 需求 | Lite 方法 | 執行方式 |
| --- | --- | --- |
| 立即要求一個角度 | `m.servo(angle)` | 不需常駐 event loop |
| 漸進移到一個角度 | `m.servo_move_to(angle, step=5, period=60)` | 主程式持續服務 Scheduler |
| 在兩個角度間往返 | `m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)` | 持續動作，須明確停止 |
| 停止 sweep | `m.servo_stop()` | 發出停止往返要求，不等於解除 PWM |
| 解除保持訊號 | `m.servo_release()` | 可能失去保持力 |

`step` 是每步角度，`period` 是毫秒；兩者會轉為整數且至少為 1。較小 step 通常讓命令角度變化更細，但不是實際角速度或定位精度保證。只在已核對的機構範圍內選擇端點。

**已確認的候選限制：未完成的 `servo_move_to()` 不會被 `servo_stop()` 或 `servo_release()` 取消。** release 當下把 PWM 設為0，舊 move task 下一輪仍可能再次輸出；另一個 servo() 或 move_to 也不能可靠取代舊任務。不要重疊 move_to。本頁完整範例只用立即定位或有限 sweep，因此其 stop/release 流程不會留下 move_to。

正常 Carrier `close()` 會經 reset_runtime 清除 Scheduler，包含未完成的 move task，但不會自行 release/deinit Servo PWM。結束本頁 session 時明確 release 再 close，中間不再 run_once；不要把 close 說成自動關閉保持訊號，也不要把 session 清理當成持續使用中的單顆取消 API。

## 5. 完整互動範例：輸入指令做一次短動作

輸入 `1` 或 `2` 可要求中間角度左右 15 度範圍內的位置，`3` 會往返三秒，`q` 結束。每次動作後會先停止往返並解除保持，再等待下一個輸入；等待輸入時不留下持續 sweep。

```python
from mangobox import Mango
import time

m = Mango()
active = False

def service(milliseconds):
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < milliseconds:
        m.run_once()
        time.sleep_ms(10)

try:
    if not m.config.get("enabled_modules", {}).get("servo", False):
        raise RuntimeError("Enable Servo in Device Manager")
    low = int(m.config.get("servo_min_angle", 0))
    high = int(m.config.get("servo_max_angle", 180))
    if not 0 <= low < high <= 180:
        raise ValueError("Check the configured Servo angle range")
    center = (low + high) // 2
    left = max(low, center - 15)
    right = min(high, center + 15)
    print("Check power, common ground and GPIO:", m.config.get("servo_pin"))
    print("Test range:", left, right, "degrees; remove the load")
    while True:
        command = input("1=left, 2=right, 3=three-second sweep, q=quit: ").strip()
        if command == "q":
            break
        if command not in ("1", "2", "3"):
            continue
        active = True
        if command == "3":
            m.servo(center)
            m.servo_sweep(left, right, step=3, period=60)
            service(3000)
        else:
            m.servo(left if command == "1" else right)
            service(800)
        m.servo_stop()
        m.servo_release()
        active = False
        print("Action finished; PWM released")
finally:
    try:
        if active:
            m.servo_stop()
            m.servo_release()
    finally:
        m.close()
```

前景的 `service()` 才呼叫 `run_once()`，沒有重入 callback。若將來加入 Button callback，讓 callback 只記錄指令，並在 `run_once()` 回來後處理動作。

## 6. 版本、模式與問題排除

依序核對 Lite profile 與實際 Runtime、DM enable/腳位/角度/PWM 設定，再做立即角度測試；最後查供電、共地和機構。立即角度可動而 sweep 不動時，先查 event loop 是否持續運作，不要直接換 GPIO。

這份 Lite 介面沒有 `name` keyword，傳入會造成 `TypeError`。超出 0–180 的角度會造成 `ValueError`；sweep 必須有最小角小於最大角。`servo_stop()` 專門停止 sweep；要解除保持訊號使用 `servo_release()`。Host Python 不能因候選韌體更新就推定有相同生命週期。

## 7. 小挑戰

在同一個安全範圍內比較 `step=2, period=60` 與 `step=4, period=60`，記錄命令模式、觀察與限制。每次只改一項，保留三秒停止與 finally 清理；不要從軟體角度讀值推算真實定位誤差。

[完整 Servo Reference](../reference/servo.md) · [Scheduler](../../../shared/zh-TW/guides/scheduler.md) · [Runtime Config](../../../shared/zh-TW/guides/runtime-config.md)

來源：[Lite student_api.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api.py) 與 [Runtime Config](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/runtime/config.py)，固定於 `f875289b5698f0e61faf64196b1165a3b18f2bd5`。

取消與關閉語意來源: [BoardServo](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/devices/servo.py), [Runtime reset](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/runtime/handler.py).
