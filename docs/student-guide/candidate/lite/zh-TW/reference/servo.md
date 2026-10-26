# MangoLite Servo — API Reference

> 來源候選 Runtime 0.6.5-rc2；MangoLite + Pico W / Pico 2 W；High-Level MicroPython。來源核對不是實機驗收，也不變更現有 Host Python 文件的合約。

## 設定與支援範圍

Lite facade 使用單一 DM Servo 設定：`enabled_modules.servo`、`servo_pin`、`servo_min_angle`、`servo_max_angle`、`servo_min_us`、`servo_max_us`。先確認適合機構的角度與 PWM 範圍、電源及共地。此家族沒有 `name=` 參數，也沒有 `select_servo()`；不得直接複製另一家族的 named Servo 呼叫。

## 方法、完整簽章與回傳

| 簽章 | 行為 | 回傳 |
| --- | --- | --- |
| `m.servo(angle)` | 要求立即定位，呼叫 servo_set_angle | `None` |
| `m.servo_set_angle(angle)` | 相容/底層的立即角度命令 | `None` |
| `m.servo_move_to(angle, step=5, period=60)` | 要求逐步移到目標角度 | `None` |
| `m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)` | 要求持續往返 | `None` |
| `m.servo_stop()` | 傳送 stop_sweep | `None` |
| `m.servo_get_angle()` | 請求角度並取得最近保留值 | `int` 或 `None` |
| `m.servo_release()` | 解除 PWM 保持訊號 | `None` |

`servo_get_angle()` 是軟體回報，沒有提供實際位置量測或機構到位保證。動作方法回傳 `None`，也沒有「完成移動」的布林回傳。

## 參數、預設與錯誤

| 參數 | 型別與規則 |
| --- | --- |
| `angle` | 必填，可轉成 `int`；轉換後必須在 0–180，實際使用還應限制在 DM/機構安全範圍 |
| `min_angle` / `max_angle` | 可轉成 `int`，各在 0–180；預設 0 / 180，且 min 必須小於 max |
| `step` | 轉為整數，至少 1；兩個漸進方法皆預設 5 |
| move_to 的 `period` | 轉為整數毫秒，至少 1；預設 60 |
| sweep 的 `period` | 轉為整數毫秒，至少 1；預設 50 |

角度或 sweep 端點範圍不符會引發 `ValueError`；不可轉為整數的值會在轉換時失敗。傳入 `name=` 會造成 `TypeError`。方法沒有感測力矩、卡住或實際角度的回傳，需由使用者核對電源、機構及動作。

## 生命週期

立即角度命令不需要常駐 event loop。move_to/sweep 由 Runtime 的 Scheduler 推進，主程式須持續 `run_once()` 或 `run_forever()`。`servo_stop()` 的來源命令是 `stop_sweep`，不能當作所有狀態的泛用取消方法。解除保持訊號要用 `servo_release()`，軸可能因此被外力移動。

callback 中只記錄請求，再由 `run_once()` 之後的前景做動作。離開程式時釋放已啟動的 Servo 並呼叫 `close()`；不要在機構仍持續往返時進入阻塞輸入。

**來源限制：release 不會取消未完成 move_to。** move task 的 ID 只保存在 driver 的局部閉包；stop/release 沒有移除它，下一輪可再寫 PWM。新 servo()、move_to 或 sweep 也不能當成可靠的舊 move 取消方法。不要重疊未完成動作，或把軟體角度與 release 回傳當作實際到位回報。

正常 Lite close→reset_runtime 會清除 Scheduler，但只 stop_sweep，不自行 release 或 PWM.deinit。完整收尾採 release 後立即 close，中間不再服務 Scheduler；這不是對所有清理例外的完成保證，也不是可繼續操作時的單顆取消方法。本頁最小例子沒有建立 move_to，故明確 release/close 適用。

## 完整最小範例

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
        raise ValueError("Check the Servo angle range")
    angle = (low + high) // 2
    print("Verify a clear mechanism, power and GPIO:", m.config.get("servo_pin"))
    if input("Type RUN to request the configured midpoint: ").strip() == "RUN":
        active = True
        m.servo(angle)
        time.sleep_ms(800)
        print("Software angle:", m.servo_get_angle())
finally:
    try:
        if active:
            m.servo_release()
    finally:
        m.close()
```

## 排錯、相關閱讀與來源

依序確認 profile/runtime、DM enable/GPIO/角度/PWM、立即角度命令、排程，再查供電、共地、接線與機構。不要以 `None` 角度當作 0 度，或以成功送出命令當作實測通過。

[完整 Guide](../guides/servo.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md) · [Scheduler](../../../shared/zh-TW/reference/scheduler.md)

來源：[Lite student_api.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/student_api.py) 第 1244–1301 行與 [Runtime Config](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/runtime/config.py)。

取消與關閉語意來源: [BoardServo](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/devices/servo.py), [Runtime reset](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangolite-pico2w/firmware/mangolite/runtime/handler.py).
