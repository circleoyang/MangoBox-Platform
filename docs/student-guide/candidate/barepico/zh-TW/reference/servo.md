# BarePico 具名伺服機與軟體角度 — API Reference

> 候選來源：v0.1.0-rc6；BarePico Pico / Pico W / Pico 2 W；High-Level MicroPython。這是來源核對，未宣告本輪 Windows 或實機驗收通過。

## 啟用、板型與模式

DM 啟用 `enabled_modules.servo`，在 `servos` 配置具名且啟用的外接 `pin`；整數校正需 `0 <= min_angle < max_angle <= 180`、`100 <= min_us < max_us <= 3000`。脈寬預設 500／2500 µs，驅動使用 50 Hz PWM。校正須符合實際伺服與機構，不是任何元件皆可承受的活動範圍。

用 `select_servo(name)` 選定，或有效的 current_servo_setting／唯一啟用項目。選擇名稱不取得 PWM；`servo_get_angle()` 也會經裝置取得路徑，首次查詢可能初始化 PWM（初始 duty 為 0）。BarePico 動作方法不接受 Carrier 的 `name=`。

## 方法、精確簽章與回傳

所有預設值以下列簽章為準；使用 `from mangobox import Mango` 與 `m = Mango()`。

| 簽章 | 用途 | 回傳 |
| --- | --- | --- |
| `m.select_servo(name)` | 選擇後續動作使用的具名伺服機。 | `str` 名稱 |
| `m.servo(angle)` | 直接設定命令角度。 | `None` |
| `m.servo_get_angle()` | 讀取軟體角度，不是實體回授。 | `int` 角度或 `None` |
| `m.servo_move_to(angle, step=5, period=60)` | 以 step 與 period 逐步移到目標角度。 | `None` |
| `m.servo_release()` | 停止 sweep 並設 PWM duty=0；不取消未完成 move_to。 | `None` |
| `m.servo_set_angle(angle)` | servo 的明確名稱。 | `None` |
| `m.servo_stop()` | 停止 sweep；不取消未完成 move_to。 | `None` |
| `m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50)` | 在上下界間反覆掃動。 | `None` |

## 參數型別、範圍與預設

| 參數 | 型別與規則 |
| --- | --- |
| `name` | select_servo 所用的 DM 具名設定，不是 GPIO。 |
| `angle` | 轉成整數後為 0–180°，實際輸出還受 DM min/max 角度與脈寬校正限制。 |
| `min_angle / max_angle` | 0–180 的整數，min_angle 必須小於 max_angle。先選不會碰撞機構的窄範圍。 |
| `step` | 每次更新步進 1–180°；外層可能轉整數／限下界，但不要依賴矯正錯誤輸入。 |
| `period` | 更新間隔 10–10000 ms，move_to 預設 60，sweep 預設 50。 |

## 事件與生命週期

`select_servo()` 回 str 名稱；`servo_get_angle()` 回 int 命令角度或 None，其餘包裝回 None。驅動會把合法 0–180 的請求進一步限制到 DM min/max，讀回是這個軟體保存值，不是位置感測或物理抵達確認。若尚無保存角度，第一次 `servo_move_to()` 直接寫入目標，不會從未知位置平滑移動。

**此候選來源有取消限制，教材不可隱藏：** canonical `BoardServo.move_to()` 把任務 ID 留在局部閉包，沒有存入 sweep_task_id。`servo_stop()` 只停止 sweep；`servo_release()` 只停止 sweep 並將 PWM duty 設為 0，沒有取消尚在進行的 move_to，也沒有 deinit PWM。下一個 move_to tick 可能重新寫入輸出；`servo()` 的立即定位同樣不會取消舊 move_to。

不要重疊多個 move_to，或把 stop/release 當作它的取消／完成訊號。需要結束整個作品時使用 `close()`：BarePico 關閉路徑會停止輸出、deinit PWM 並清除 Scheduler。之後重建 Mango 才開始新流程。若等待一個 move_to 的軟體目標，持續推進事件迴圈，達到命令角度後仍再推進至少一個 period，讓它自己的任務退出；這仍不證明實體機構到位。

move/sweep 需要事件迴圈。stop/release 不會新建尚未初始化的伺服，但它們的 None 回傳不是硬體狀態。最小例子使用一次直接定位，最終 close，不用未完成的 move_to 來展示 release。

## 錯誤與排查順序

未知／停用名稱、GPIO、角度或時間錯誤會拒絕。未啟用、關閉、無硬體 PWM、PWM 初始化失敗、使用後更改腳位／限制會有 `RuntimeError`。排錯依 profile→模組與具名開關→pin 與校正→獨立適當供電與共地→小角度快測；不要用硬推轉軸作 API 測試。

## 可獨立執行的最小範例

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

## 相關閱讀

[Guide](../guides/servo.md) · [Lifecycle](../../../shared/zh-TW/guides/lifecycle.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md)

## 核對來源與驗證

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/servo.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/servo.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

核對來源 SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`。本頁例子只經語法與來源契約檢查；沒有在本輪宣告實機 PASS。
