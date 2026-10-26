# MangoX2 named Servo — API Reference

> 來源候選 Runtime 0.2.10-rc2；MangoX2 + Pico / Pico W / Pico 2 W；High-Level MicroPython。來源核對不是已發行韌體或實機通過宣告。

## 支援與設定前提

需要 DM 啟用 Servo，且所選 `servos.<name>` 未被停用；設定每顆 `pin`、角度限制、脈波寬度與適合的電源／共地。`current_servo_setting` 是預設選擇。本頁範例要求 `enabled` 明確為 True，有多顆時要求選定 current，不任意挑第一顆。

Runtime 的相容選擇規則較寬：非空 servos collection 優先；缺少時從舊 `servo_*` scalar keys 合成 servo1。`name=None` 優先 current，否則找可用項目；傳明確 name 時轉成字串。driver 在首次定位、移動、讀角度、stop 或 release 時可能被建立，因此單看方法名稱不能推定它是無硬體副作用的查詢。重建 Mango 才重新讀入／建立已變更的裝置設定。

## 方法、完整簽章與回傳

| 簽章 | 行為 | 回傳 |
| --- | --- | --- |
| `m.servo(angle, name=None)` | 呼叫 servo_set_angle，立即寫角度命令 | `None` |
| `m.servo_set_angle(angle, name=None)` | 立即角度命令 | `None` |
| `m.servo_move_to(angle, step=5, period=60, name=None)` | 後續以 Scheduler 更新命令角度；初始 angle=None 時直接寫目標 | `None` |
| `m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None)` | 往返任務 | `None` |
| `m.servo_stop(name=None)` | 送 stop_sweep，只移除 sweep 任務 | `None` |
| `m.servo_get_angle(name=None)` | 取得指定／預設 Servo 的保留命令角度 | 正常 BoardServo 為 `int` 或 `None` |
| `m.servo_release(name=None)` | stop_sweep，PWM duty 立即設 0；不取消未完成 move_to，不 deinit | `None` |

動作回傳 None 不代表沒執行，也不是到位或取消完成回報。named 回覆解析器可保留非整數數值，但目前 BoardServo 自身命令角度是整數。讀值不是物理量測，不能用來判定卡住或實際角度。

## 參數、預設值與錯誤

| 參數／設定 | 實際來源規則 |
| --- | --- |
| `angle` | 必填；先 int()，轉換後要求 0..180，否則 ValueError；driver 再限制在 DM min/max |
| `min_angle`, `max_angle` | sweep 預設 0、180；各 int() 並驗證 0..180；min 必須小於 max，否則 ValueError；driver 另限制在裝置範圍 |
| `step` | 預設 5；max(1, int(step))。沒有 Bare 的 180 上限驗證 |
| `period` | move_to 預設 60，sweep 預設 50；毫秒，max(1, int(period))。沒有 Bare 的 10..10000 驗證 |
| `name` | 預設 None；明確值轉 str。未知或 enabled=False 的項目在 named handler 引發 ValueError |
| named angle limits | 各項優先，否則沿用舊 scalar 值（最終預設 0、180）；範例額外檢查 0 <= low < high <= 180 |
| `min_us`, `max_us` | 各項優先，否則舊 scalar（最終預設 500、2500 μs）；BoardServo 使用 50 Hz。來源 named config extension 沒有替每個 pulse 值做完整範圍驗證，不要據此假定任意值都適合 Servo |

不可轉為整數的輸入會在 int() 階段失敗；這些不是只接受原生 int 的嚴格型別檢查。PWM／GPIO 初始化錯誤可能傳出；硬體不可用也可能只列印 driver 訊息。不是所有失敗都會成為統一例外或事件。DM GPIO 衝突檢查不能代替對機構角度、脈波和供電的核對。

## 事件、排程與已確認取消限制

沒有 Servo 到位 callback。servo()/move_to() 的既有 API 事件與 driver 角度文字記錄命令，不能當作實際完成證據；學生不要自行製作事件 JSON 或逐輪灌 log。

move_to 與 sweep 要由 run_once 或 run_forever 推進；callback 保持短小，複雜動作移到前景。當 move_to 尚未完成，servo_stop、servo_release、新 servo()、新 move_to 都不會可靠取消它。因 task_id 只保存在 driver 的局部閉包，release 後下一輪可再次寫 PWM；重複 move_to 可能同時留下兩個互相爭用的任務。這是目前來源已確認的限制，不是建議的使用方式。

正常 Carrier close→reset_runtime 會清除 Scheduler，包括未追蹤的 move_to，但只對 Servo stop_sweep，不會自行 release/deinit PWM。完整 session 收尾採 release 後立即 close，中間不再 run_once；持續使用中的單顆取消仍不能靠這個方法。兩者都不是對所有清理例外的完成保證。BarePico 正常 close 另有 release/deinit，不能把該保證套到 X2。

## 完整最小範例

只做立即定位，觀察後 release/close；不先排入未完成的 move_to。

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

## 排錯與相關閱讀

先確認 profile、DM enable/名稱/腳位，再用立即定位測試；確認排程與供電後才增加動作。取得 None 時不要自動當成0度，程式正常回傳也不能標示硬體 PASS。

[完整 Guide](../guides/servo.md) · [API Reference](../reference/servo.md) · [Scheduler](../../../shared/zh-TW/guides/scheduler.md) · [Runtime Config](../../../shared/zh-TW/guides/runtime-config.md)

來源: [named facade](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/student_api_servo_multi.py), [named handler](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/servo_multi_handler.py), [BoardServo](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/servo.py), [reset/close handler](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/handler.py), [named config](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/runtime/servo_multi_config.py). Commit `f875289b5698f0e61faf64196b1165a3b18f2bd5`.
