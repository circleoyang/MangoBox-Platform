# BarePico 外接馬達與車體

> 候選來源：BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26；來源核對不等於實機通過。

## 1. 可以做什麼與準備

透過外接雙輸入 H-bridge 驅動器控制 M1／M2，或以車體指令控制前後移動。BarePico 沒有 carrier 馬達驅動器；不可把馬達直接接 GPIO。DM 必須啟用 `enabled_modules.motor`，明確設定 `motors.M1`、`motors.M2` 的 `enabled`、`in1_pin`、`in2_pin` 與 `driver=dual_input`。即使只測 M1，此來源也要求兩個通道完整配置。

## 2. 30 秒快速測試

先抬起車輪、固定好機構、保持可立即切斷的馬達電源。核對驅動器接線後，才輸入 RUN。M1 以 20 的低速命令運轉 400 ms 後停止；這是待實機確認的測試程式，並非已完成測試。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("motor", False):
    raise RuntimeError("Enable external Motor in Device Manager")
channels = m.config.get("motors", {})
for channel in ("M1", "M2"):
    spec = channels.get(channel, {})
    if not spec.get("enabled", False):
        raise ValueError("Both M1 and M2 must be configured and enabled")
    if spec.get("driver", "dual_input") != "dual_input":
        raise ValueError("This example requires the configured dual-input H-bridge")
print("Confirm lifted wheels, clear mechanism and the configured driver wiring.")

def wait_running(milliseconds):
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < milliseconds:
        m.run_once()
        time.sleep_ms(10)

try:
    if input("Type RUN after checking the mechanism: ").strip() == "RUN":
        m.motor_run("M1", 20)
        wait_running(400)
        m.motor_brake("M1")
finally:
    m.close()
```

## 3. 應該觀察到什麼

預期只有 M1 短暫轉動。低速命令不保證克服馬達啟動阻力；若沒有轉，不要立刻加到最大值，先查供電、接線與驅動器。正負速度表示兩個方向；命令返回不代表車輪真的朝預期方向移動。

## 4. 常見用法

單通道用 `motor_run()`、`motor_brake()`、`motor_coast()`。車體指令用 `forward()`、`backward()`、`drive_tank()`；左右對應與反向等依 DM `drive` 設定。`forward()`／`backward()` 會使用最小有效速度與啟動補償，因此 `forward(20)` 不代表輸出始終為 20。本頁互動程式改用 `drive_tank(..., assist=False)` 關閉這兩項補償；DM 的方向與比例校準仍然有效。brake 與 coast 是不同停止方式，不代表任何驅動器都會有相同機械減速距離。

## 5. 完整互動範例

在車輪仍抬起的狀態下輸入 f 或 b，只執行 400 ms 的低速動作，每次在再次等待輸入前停止。`finally` 與 `close()` 會處理結束路徑；它們不是斷電、程式完全卡死或硬體故障時的安全裝置。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("motor", False):
    raise RuntimeError("Enable external Motor in Device Manager")
channels = m.config.get("motors", {})
for channel in ("M1", "M2"):
    spec = channels.get(channel, {})
    if not spec.get("enabled", False):
        raise ValueError("Both M1 and M2 must be configured and enabled")
    if spec.get("driver", "dual_input") != "dual_input":
        raise ValueError("This example requires the configured dual-input H-bridge")
print("Confirm lifted wheels, clear mechanism and the configured driver wiring.")

def wait_running(milliseconds):
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < milliseconds:
        m.run_once()
        time.sleep_ms(10)

try:
    while True:
        command = input("f = forward 400ms, b = backward 400ms, q = quit: ").strip().lower()
        if command == "q":
            break
        if command in ("f", "b"):
            try:
                if command == "f":
                    m.drive_tank(20, 20, assist=False)
                else:
                    m.drive_tank(-20, -20, assist=False)
                wait_running(400)
            finally:
                m.stop()
        # Every action is stopped before the next blocking input().
finally:
    m.close()
```

## 6. 適用範圍與問題排除

適用 BarePico High-Level MicroPython v0.1.0-rc6 候選來源。這裡提供既有本機 Student API 教學，不能用來推論手機網頁已取得馬達控制權或硬體已驗收。

排錯：profile → Motor 總開關 → M1/M2 兩組完整配置 → GPIO 和 H-bridge IN1/IN2 → DM 的方向、PWM／slice 衝突 → 獨立馬達電源、共地與機構。原始輸出診斷先關馬達電源、停止 Mango，再以量測工具核對已配置腳位；不要為測試套用 MangoLite 的固定腳位。

## 7. 小挑戰

保留低速與 400 ms 上限，只比較 M1、M2 與車體 drive_tank 的方向。把實際觀察記下來，再回 DM 修正方向設定；不要先把程式中所有正負號倒過來。

[API Reference](../reference/motor.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py` and `runtime/barepico/firmware/barepico/drive_controller.py`.
