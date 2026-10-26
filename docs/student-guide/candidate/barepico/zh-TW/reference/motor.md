# BarePico 馬達通道與差速車體 — API Reference

> 候選來源：v0.1.0-rc6；BarePico Pico / Pico W / Pico 2 W；High-Level MicroPython。這是來源核對，未宣告本輪 Windows 或實機驗收通過。

## 啟用、板型與模式

DM 啟用 `enabled_modules.motor`，明確設定 M1/M2 的 `in1_pin/in2_pin` 及 `drive` 車體設定。BarePico 使用外接雙輸入驅動器，沒有 carrier 馬達腳位或供電預設；先確認驅動器相容、電源與共地。第一次 API 呼叫才取得硬體；每次動作會重新核對 DM profile 是否改變。

## 方法、精確簽章與回傳

所有預設值以下列簽章為準；使用 `from mangobox import Mango` 與 `m = Mango()`。

| 簽章 | 用途 | 回傳 |
| --- | --- | --- |
| `m.arc_left(outer_speed=80, inner_speed=60)` | 以內外輪速度形成左弧線。 | `None` |
| `m.arc_right(outer_speed=80, inner_speed=60)` | 形成右弧線。 | `None` |
| `m.backward(speed=70)` | 車體向後。 | `None` |
| `m.coast()` | 對整個車體發出滑行。 | `None` |
| `m.drive_tank(left, right, assist=False)` | 分別指定左右輪與是否使用輔助。 | `None` |
| `m.forward(speed=70)` | 車體向前；可能套用低速／啟動補償。 | `None` |
| `m.motor_brake(motor)` | 煞車單一馬達。 | `None` |
| `m.motor_coast(motor)` | 使單一馬達滑行。 | `None` |
| `m.motor_run(motor, speed)` | 直接命令具名馬達的正負速度。 | `None` |
| `m.pivot_left(speed=70)` | 樞軸向左轉。 | `None` |
| `m.pivot_right(speed=70)` | 樞軸向右轉。 | `None` |
| `m.spin_left(speed=70)` | 原地向左旋轉。 | `None` |
| `m.spin_right(speed=70)` | 原地向右旋轉。 | `None` |
| `m.stop()` | 對整個車體發出煞車。 | `None` |

## 參數型別、範圍與預設

| 參數 | 型別與規則 |
| --- | --- |
| `motor` | `M1/M2`，或既有別名 A/RIGHT=M1、B/LEFT=M2；這個別名與 drive.left_motor/right_motor 的車體配置是兩件事。 |
| `speed` | 轉成整數並限於 -100–100。motor_run 保留正負方向；forward/backward/pivot/spin 使用其絕對值並由方法決定方向。 |
| `left / right` | drive_tank 左右輪命令 -100–100；正負方向仍受 DM 反轉與配置影響。 |
| `assist` | 預設 False；True 可套用啟動／低速輔助。False 仍會套用車體比例與方向設定。 |
| `outer_speed / inner_speed` | 外輪／內輪速度幅度，轉整數、限幅後取絕對值。 |

## 事件與生命週期

本頁包裝回 None；內部 drive 或 motor driver 的回傳不會成為公開動作的輪速／位置回授。`motor_run()` 是單通道原始 -100～100 命令，不套用車體左右輪比例、反轉或啟動輔助；車體 API 才使用 `drive` 配置。`assist=False` 關掉低速／啟動補償，但仍套用車體比例與反轉。

`motor_run(..., 0)` 與 `drive_tank(0, 0)` 是零 PWM 滑行；`stop()`／`motor_brake()` 才是兩輸入拉高的電氣煞車。高階 `forward(0)` 等方法轉成 stop；`coast()`／`motor_coast()` 是兩輸入為零。所有這些命令都不是「機構已立即停止」的回授。

forward／backward／pivot／spin／arc 啟用 assist，小 speed 仍可能得到較高 PWM。DM 的 startup_boost_ms 及方向反轉 dead time 採同步短暫等待，不能承諾完全非阻塞。初次測試用明確低值、抬輪、短期限；車體測試可採 drive_tank(20,20,assist=False)，並核對比例設定。arc 呼叫不強制 inner<=outer，需自行選合理幅度。

每次使用會核對配置簽章；改變時釋放舊資源再建立，並非靜默沿用舊車體。`close()` 最終以 best-effort coast／deinit 清理，**不持續保持煞車 PWM**。未開始動作時也不應以 stop 當無副作用查詢，因為車體命令可初始化兩通道。

## 錯誤與排查順序

錯誤馬達名稱、無效 pin 或衝突、未啟用與已關閉狀態會拒絕。配置變更／失效時 Runtime 會嘗試釋放舊馬達資源；這不是實機安全停止驗證。排錯依 profile→模組開關→驅動器 pin 對照→DM 左右輪與反轉→抬輪短測→供電接線。

## 可獨立執行的最小範例

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("motor", False):
        raise RuntimeError("Enable external Motor in Device Manager")
    channels = m.config.get("motors", {})
    if not isinstance(channels, dict):
        raise ValueError("Check the motors configuration")
    for channel in ("M1", "M2"):
        spec = channels.get(channel)
        if not isinstance(spec, dict) or not spec.get("enabled", False):
            raise ValueError("Configure and enable both M1 and M2")
        if spec.get("driver", "dual_input") != "dual_input":
            raise ValueError("This example requires a dual-input H-bridge")
    print("Lift wheels and check the driver wiring before the short test.")
    if input("Type RUN to test M1 briefly: ").strip() == "RUN":
        m.motor_run("M1", 20)
        started = time.ticks_ms()
        while time.ticks_diff(time.ticks_ms(), started) < 400:
            m.run_once()
            time.sleep_ms(10)
        m.motor_brake("M1")
        time.sleep_ms(100)
finally:
    m.close()
```

## 相關閱讀

[Guide](../guides/motor.md) · [Lifecycle](../../../shared/zh-TW/guides/lifecycle.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md)

## 核對來源與驗證

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/barepico/firmware/barepico/motor_driver.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/motor_driver.py)
- [runtime/barepico/firmware/barepico/drive_controller.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/drive_controller.py)

核對來源 SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`。本頁例子只經語法與來源契約檢查；沒有在本輪宣告實機 PASS。
