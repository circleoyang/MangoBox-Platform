# BarePico 外接蜂鳴器

> 候選來源：BarePico v0.1.0-rc6 · High-Level MicroPython · 2026-10-26；來源核對不等於實機通過。

## 1. 可以做什麼與準備

播放提示音、指定音高或短旋律。BarePico 沒有載板蜂鳴器；DM 必須啟用 `enabled_modules.buzzer` 並設定外接 `buzzer_pin`、`buzzer_mode` 與 `buzzer_duty`。本頁音高與旋律例子要求合適的被動蜂鳴器及 `pwm` 模式。`gpio` 單音用軟體切換電位，實際聲音依元件；這份來源不能保證 gpio 模式的排程旋律與 PWM 一樣。

## 2. 30 秒快速測試

範例同步播放 880 Hz、200 ms 短音。`tone()` 本身會等待這段音長，返回時已走完停止輸出路徑；不是先返回再由 Scheduler 停音。這裡不需要音訊檔或 DFPlayer。

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("buzzer", False):
        raise RuntimeError("Enable buzzer in Device Manager")
    pin_no = m.config.get("buzzer_pin")
    if type(pin_no) is not int:
        raise ValueError("Configure buzzer_pin in Device Manager")

    if m.config.get("buzzer_mode", "pwm") != "pwm":
        raise ValueError("This pitched-tone example requires pwm mode")
    print("Starting a synchronous 200 ms tone")
    m.tone(880, duration=200)
    print("Tone call returned; verify the sound yourself")
finally:
    m.close()
```

## 3. 應該觀察到什麼

應聽到一聲短音。若只有固定音或喀聲，先確認元件種類與 DM mode。`tone()`／`beep()` 是同步阻塞；旋律 `music()` 才需要事件迴圈持續推進。方法回 None 不提供音量或實體發聲成功回授。

單音 duration=0 會變成 150 ms，不是無限持續音。`start_bee()` 是週期任務，但每次短鳴也會阻塞約 40 ms；不要在感測 callback 中播放長單音。

## 4. 常見用法

單音用 `tone(frequency, duration=...)`，旋律用 `music([[頻率,毫秒],...], gap_ms=...)`。也有 `play_song()` 與已定義的音效名稱，但不能猜測任意歌名都存在。`stop_music()` 停旋律；若啟動的是週期蜂鳴，另用 `stop_bee()`。

## 5. 完整互動範例

在 Shell 選 1 播短音，選 2 播三個音，q 結束。單音同步結束；旋律則服務 Scheduler 約 800 ms 後明確停止，再次等待輸入。這是固定觀察時間，不是播放完成回授。此 helper 只由前景呼叫，不可放進感測 callback。

```python
from mangobox import Mango
import time

m = Mango()
if not m.config.get("enabled_modules", {}).get("buzzer", False):
    raise RuntimeError("Enable buzzer in Device Manager first")
pin_no = m.config.get("buzzer_pin")
if not isinstance(pin_no, int):
    raise ValueError("Configure buzzer_pin in Device Manager")

def wait_running(milliseconds):
    started = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started) < milliseconds:
        m.run_once()
        time.sleep_ms(10)

try:
    if m.config.get("buzzer_mode", "pwm") != "pwm":
        raise ValueError("This melody example requires pwm mode")
    while True:
        command = input("1 = short tone, 2 = three notes, q = quit: ").strip()
        if command == "q":
            break
        if command == "1":
            m.tone(660, duration=150)
        elif command == "2":
            m.music([[523, 150], [659, 150], [784, 250]], gap_ms=30)
            wait_running(800)
        m.stop_music()
finally:
    m.close()
```

## 6. 適用範圍與問題排除

適用 BarePico v0.1.0-rc6 High-Level MicroPython 候選來源。音高 API 與 Sound 聲音感測輸入是不同模組。

排錯：profile → Buzzer 總開關 → 真實 GPIO → `pwm/gpio`、duty → 元件種類、極性、電源與共地。PWM 與 Servo／Motor 可能共用 slice；若 Runtime 回報衝突，先改 DM 配置，不繞過檢查。原始電氣診斷要在停止 Mango 後進行，且只用確認過的 GPIO；不要同時讓另一段 PWM 程式接管。

## 7. 小挑戰

把三個音改成「上行提示」和「下行提示」。比較音長與 gap 的效果；每次結束都確認回到安靜狀態。

[API Reference](../reference/buzzer.md)

來源 / Source: `circleoyang/MangoBox` · `f875289b5698f0e61faf64196b1165a3b18f2bd5` · `runtime/barepico/firmware/barepico/core.py`.
