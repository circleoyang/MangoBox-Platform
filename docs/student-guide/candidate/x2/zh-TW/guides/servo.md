# MangoX2 Servo：選對具名裝置，再做有限時間動作

> 來源候選 Runtime 0.2.10-rc2；MangoX2 + Pico / Pico W / Pico 2 W；High-Level MicroPython。來源與語法核對不是實機驗收，Runtime 版本也不是 MangoThonny 版本。

## 1. 可以完成什麼與準備事項

Servo（伺服馬達）接收角度命令，適合輕量指針與展示機構。MangoX2 的 `name=` 可以指定不同具名 Servo；每個名稱使用自己的 GPIO、角度與脈波設定。本頁程式每次選一顆，不把多顆同時通電當成接線測試。

先在 Device Manager 啟用 `enabled_modules.servo`，再啟用 `servos` 中要使用的項目，核對 `pin`、`min_angle`、`max_angle`、`min_us`、`max_us`。有多個啟用項目時，設定 `current_servo_setting`。範例只讀這些必要設定，不輸出整份 Config。舊 scalar keys 留有相容用途，但本教學要求明確的 named collection；不要猜預設 GP14，因為它可能與其他模組衝突。

訊號線接 DM 顯示的 GPIO；使用符合實際 Servo 規格的電源並共地。先卸下負載，確認範圍內能自由移動。API 接受 0–180 度不代表機構能轉完整圈。設定改動後重新建立 Mango，不在舊物件上重配腳位。

## 2. 30 秒快速測試

完整程式檢查啟用狀態、名稱及角度範圍；輸入 `RUN` 後只要求一次中間角度。800 ms 是觀察時間，不是實際到位證明。最後明確解除 PWM，再關閉本次 Runtime 使用。

```python
from mangobox import Mango
import time

m = Mango()
name = None
active = False
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("servo", False):
        raise RuntimeError("Enable Servo in Device Manager")
    group = m.config.get("servos", {})
    if not isinstance(group, dict):
        raise ValueError("Check the named servos settings")
    items = {key: spec for key, spec in group.items()
             if isinstance(spec, dict) and spec.get("enabled") is True}
    name = m.config.get("current_servo_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled Servo in Device Manager")
        name = next(iter(items))
    spec = items[name]
    low = int(spec.get("min_angle", m.config.get("servo_min_angle", 0)))
    high = int(spec.get("max_angle", m.config.get("servo_max_angle", 180)))
    if not 0 <= low < high <= 180:
        raise ValueError("Check the configured Servo angle limits")
    center = (low + high) // 2
    print("Servo:", name, "GPIO:", spec.get("pin"), "Limits:", low, high)
    if input("Check power and free movement; type RUN: ").strip() == "RUN":
        active = True
        m.servo(center, name=name)
        time.sleep_ms(800)
        print("Software angle:", m.servo_get_angle(name=name))
finally:
    try:
        if active:
            m.servo_release(name=name)
    finally:
        m.close()
```

這裡沒有排入 move_to 或 sweep，所以不需要常駐 event loop。`servo_release()` 的用途是關閉本次立即角度命令的保持訊號。

## 3. 應該觀察什麼

機構應向設定範圍的中間角度移動；放開 PWM 後可能受外力移動。`servo_get_angle(name=name)` 是 Runtime 保留的命令角度，可能為 `None`，不是編碼器讀值。若無動作、抖動或重開機，依序核對設定、接線與共地、供電及機構；不要只看列印的角度判定硬體正常。

## 4. 常見用途與已確認限制

| 需求 | X2 方法 | 生命週期 |
| --- | --- | --- |
| 立即要求角度 | `servo(angle, name=None)` | 同步寫入 PWM 命令；不代表物理到位 |
| 漸進移到目標 | `servo_move_to(angle, step=5, period=60, name=None)` | 由 Scheduler 逐步更新；需持續服務 |
| 往返 | `servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None)` | 持續到明確停止 |
| 停止往返 | `servo_stop(name=None)` | 只停止 sweep，保留目前 PWM |
| 解除保持訊號 | `servo_release(name=None)` | 停止 sweep 並立即把 PWM duty 設為 0 |

`step`、`period` 會轉成整數並至少取 1；時間單位是毫秒。`name=None` 使用 Runtime 預設選擇，本頁每次傳已核對的名稱，避免預設項目改變後控制到別顆。首次 move_to 若尚無命令角度，driver 會直接寫入目標；它不知道軸原本在哪裡。

**目前三家共用的 Servo 控制邏輯有任務取消缺口：`servo_stop()` 和 `servo_release()` 都不會取消未完成的 move_to。** release 當下雖關 PWM，下一個 move tick 可能重新寫入；另一個 servo() 或 move_to 也不會可靠地取代舊任務。不要重疊 move_to，或把 release 當作漸進動作的取消／完成訊號。本頁可執行範例只使用立即定位與有限 sweep。

正常 Carrier `close()` 會經 reset_runtime 清除 Scheduler，因此會清掉剩餘 move task；但它不會替 Servo 呼叫 release 或 PWM.deinit。離開時先停止本頁的 sweep、release，再 close；不要宣稱只 close 就一定解除保持。若已留下未完成 move_to，結束這次 session 時在同一段前景清理內 release 後立即 close，中間不再服務 Scheduler；這不是繼續執行中的單顆取消 API。

## 5. 完整互動範例：同一顆 Servo 的短動作

`1`、`2` 要求中間角度左右最多 15 度；`3` 往返三秒；`q` 離開。每次回到輸入前都 stop/release，不在等待輸入時留下 sweep。程式使用自己的前景迴圈服務 `run_once()`，不再同時啟動 `run_forever()`。

```python
from mangobox import Mango
import time

m = Mango()
name = None
active = False

def service(milliseconds):
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < milliseconds:
        m.run_once()
        time.sleep_ms(10)

try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("servo", False):
        raise RuntimeError("Enable Servo in Device Manager")
    group = m.config.get("servos", {})
    if not isinstance(group, dict):
        raise ValueError("Check the named servos settings")
    items = {key: spec for key, spec in group.items()
             if isinstance(spec, dict) and spec.get("enabled") is True}
    name = m.config.get("current_servo_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled Servo in Device Manager")
        name = next(iter(items))
    spec = items[name]
    low = int(spec.get("min_angle", m.config.get("servo_min_angle", 0)))
    high = int(spec.get("max_angle", m.config.get("servo_max_angle", 180)))
    if not 0 <= low < high <= 180:
        raise ValueError("Check the configured Servo angle limits")
    center = (low + high) // 2
    print("Servo:", name, "GPIO:", spec.get("pin"), "Limits:", low, high)
    left = max(low, center - 15)
    right = min(high, center + 15)
    print("Test range:", left, right, "degrees")
    while True:
        command = input("1=left, 2=right, 3=three-second sweep, q=quit: ").strip()
        if command == "q":
            break
        if command not in ("1", "2", "3"):
            continue
        active = True
        if command == "3":
            m.servo(center, name=name)
            m.servo_sweep(left, right, step=3, period=60, name=name)
            service(3000)
        else:
            m.servo(left if command == "1" else right, name=name)
            service(800)
        m.servo_stop(name=name)
        m.servo_release(name=name)
        active = False
        print("Command interval finished; PWM released")
finally:
    try:
        if active:
            m.servo_stop(name=name)
            m.servo_release(name=name)
    finally:
        m.close()
```

程式的「interval finished」只表示指令服務時間已到。若加入 Button callback，callback 只記錄要求；在 run_once 返回後再由前景處理。不要從 callback 再進入事件迴圈，也不要為停一顆 Servo 而清除整個 Scheduler。

## 6. 版本、模式與問題排除

這份候選頁只適用上列三個 X2 目標的 High-Level MicroPython。Lite facade 沒有 `name=`；BarePico 使用 `select_servo()` 的另一套選擇介面，不能直接交換範例。Host Python 由電腦／傳輸端協調，不能因這份候選來源而推定相同 callback 或 close 行為。

先檢查 profile/Runtime → 模組與 named entry enable → 名稱、GPIO、角度/PWM 設定 → 立即定位 → Scheduler → 供電與機構。unknown/disabled name 可引發 ValueError；角度轉成整數後超出 0–180 也會引發 ValueError。立即定位可動而 sweep 不動，先確認 run_once 確實持續執行。

Servo 方法沒有到位 callback。Runtime 的 API 事件與 driver 的角度文字只記錄軟體操作，不是實測成功證明；不要逐輪列印或手動產生 `@@MANGO_EVENT@@`。已確認的取消限制需修 Runtime 才能消除，不能用成功的語法檢查宣稱已修復。

## 7. 小挑戰

保持同一顆、同一個小角度範圍與三秒停止條件，分別比較 sweep 的 step=2、step=4；下一輪再比較 period=60、period=100。一次改一項，保留 release/close 清理，記錄觀察和供電條件。若有第二顆 Servo，先在 DM 選它，重新執行單顆測試；不要直接把未完成 move_to 疊在一起。

[完整 Guide](../guides/servo.md) · [API Reference](../reference/servo.md) · [Scheduler](../../../shared/zh-TW/guides/scheduler.md) · [Runtime Config](../../../shared/zh-TW/guides/runtime-config.md)

來源: [named facade](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/student_api_servo_multi.py), [named handler](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/servo_multi_handler.py), [BoardServo](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/servo.py), [reset/close handler](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/handler.py), [named config](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/servo_multi_config.py). Commit `f875289b5698f0e61faf64196b1165a3b18f2bd5`.
