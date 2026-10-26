# BarePico 蜂鳴器、音符與短旋律 — API Reference

> 候選來源：v0.1.0-rc6；BarePico Pico / Pico W / Pico 2 W；High-Level MicroPython。這是來源核對，未宣告本輪 Windows 或實機驗收通過。

## 啟用、板型與模式

DM 啟用 `enabled_modules.buzzer`，設定外接 `buzzer_pin`、`buzzer_mode`（`pwm` 或 `gpio`）與整數 `buzzer_duty`（1–65535）。指定音高與排程旋律教學使用適合的被動蜂鳴器及 `pwm`。`gpio` 單音由軟體切換電位，效果取決於元件；本來源的排程旋律以 PWM 持續音為前提，不能保證 gpio 模式也可播放同樣旋律。這不是 DFPlayer 音訊或 Sound 聲音輸入。

## 方法、精確簽章與回傳

所有預設值以下列簽章為準；使用 `from mangobox import Mango` 與 `m = Mango()`。

| 簽章 | 用途 | 回傳 |
| --- | --- | --- |
| `m.bee()` | beep 的便利名稱。 | `None` |
| `m.beep()` | 播放預設短提示音。 | `None` |
| `m.music(notes, default_duration_ms=180, gap_ms=35)` | 將音符正規化後播放。 | `None` |
| `m.play_song(song, tempo=None, default_duration_ms=180, gap_ms=35)` | 播放旋律，可指定 tempo。 | `None` |
| `m.play_sound(name)` | 播放已定義音效。 | `None` |
| `m.play_tone(frequency, duration=300)` | tone 的明確名稱。 | `None` |
| `m.sound(name)` | play_sound 的別名。 | `None` |
| `m.start_bee(period=1000, duration=3000)` | 開始週期蜂鳴，可安排到期停止。 | `None` |
| `m.stop_bee()` | 停止週期蜂鳴。 | `None` |
| `m.stop_music()` | stop_song 的別名。 | `None` |
| `m.stop_song()` | 停止旋律。 | `None` |
| `m.tone(frequency, duration=300)` | 播放指定頻率短音。 | `None` |

## 參數型別、範圍與預設

| 參數 | 型別與規則 |
| --- | --- |
| `frequency` | 單音 Facade 先 int 轉換，再驗證 30–12000 Hz；不是音量。 |
| `duration` | Facade 轉 int，單音接受 0–5000 ms，其中 0 實際變成 150 ms。`start_bee` 用 0 表示不安排自動停止，正值請用 10–5000 ms；1–9 會被 Bare Scheduler 拒絕。 |
| `period` | `start_bee` 轉 int 後 20–60000 ms；每次蜂鳴本身約阻塞 40 ms，短週期不代表能準時執行。 |
| `notes / song` | 字串、list 或 tuple；推薦 `[[440, 200], [0, 100], [660, 200]]`。正規化後 1–256 音符，每音 1–10000 ms；`R/REST/-/0` 可作休止。 |
| `tempo` | 轉 float 後 >0；對未明訂時間的音符提供 `round(60000/tempo)` ms 預設。既有 preset 與已給毫秒的音符不自動縮放。 |
| `default_duration_ms / gap_ms` | 轉 int 後預設音長 1–10000 ms；gap 0–1000 ms。Facade 預設 180／35。 |
| `name` | `play_sound`／`sound` 只接受來源內已定義的音效名稱，未知名稱 ValueError。 |

目前驅動音名表是 C4、D4、E4、F4、G4、A4、B4 與同名 C5～B5；不能推論任意升降記號或其他八度都可用。旋律內的未知文字音名被當成 0 Hz 休止，並非一定拋錯；數字頻率請使用真正數值，不把 `"880"` 當作音名。旋律音符頻率也沒有套用單音的同一範圍驗證。

## 事件與生命週期

所有本頁包裝回傳 None，但時序分成兩種：

| 操作 | 實際執行方式 |
| --- | --- |
| `tone()`／`play_tone()` | **同步阻塞**指定音長，結束時關閉輸出；duration=0 變成 150 ms，不是持續音 |
| `beep()`／`bee()` | 同步 2500 Hz、約 100 ms |
| `music()`／`play_song()`／`play_sound()` | 透過約 20 ms Scheduler 步驟推進旋律；需要事件迴圈，使用 pwm 模式 |
| `start_bee()` | 到週期才呼叫一次約 40 ms 的同步蜂鳴；正 duration 的停止另排程 |

長單音會阻塞其他任務，不要放進感測 callback 等待。公開方法沒有音量或實體播放完成回授；tone 返回只表示同步程式路徑已走完。`start_bee()` 已在運作時再次呼叫，不會替換原 beeper task 的 period；要換週期先 stop_bee，再重新 start。

`stop_song()`／`stop_music()` 取消旋律並關閉當前輸出；`stop_bee()` 取消週期蜂鳴並關閉當前輸出。它們不會互相取消對方的未來任務。單音／旋律／週期蜂鳴共用同一裝置，切換用途先停止前一種；結束用 close，釋放 PWM。

## 錯誤與排查順序

未啟用、已關閉、PWM 初始化失敗或使用後更改 pin/mode/duty 為 RuntimeError；非法音符容器、超出音符數／音長、未知音效與不合法配置／時間會被拒絕。Facade 對部分數值先轉型或把音長最小化為 1，不能宣稱每個錯誤值都在註冊前被嚴格拒絕。`start_bee` 的正 duration 使用 10–5000，避免 1–9 ms 在建立蜂鳴後才遭 Scheduler 拒絕。

排錯依 profile、開關、真實 GPIO、DM mode/duty、元件種類、電源與共地。旋律無聲先確認 pwm 與有效音名，不以任意字串當作歌名測試。

## 可獨立執行的最小範例

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

## 相關閱讀

[Guide](../guides/buzzer.md) · [Lifecycle](../../../shared/zh-TW/guides/lifecycle.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md)

## 核對來源與驗證

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/buzzer.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/buzzer.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

核對來源 SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`。本頁例子只經語法與來源契約檢查；沒有在本輪宣告實機 PASS。
