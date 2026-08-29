# 蜂鳴器（Buzzer）使用指南

蜂鳴器（Buzzer）可以播放提示音、指定頻率的音調與簡單旋律。

## 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
m.bee()
```

`bee()` 會立即播放一個短音，不需要 `m.run_forever()`。

## 播放音調與旋律

### 單一音調：立即執行

```python
from mangobox import Mango

m = Mango()
m.tone(880, 300)
```

`880` 是頻率（Hz），`300` 是持續時間（ms）。這個 API 會在呼叫時直接播放，不需要 event loop（事件迴圈）。

### 旋律與音效：需要 event loop

```python
from mangobox import Mango

m = Mango()
m.play_song("twinkle_star")
m.run_forever()
```

`play_song()`、`play_sound()` 會把後續音符交給 Scheduler 依時間播放。若沒有 `m.run_forever()`，旋律可能只建立了排程卻沒有繼續播放。

例如播放一個預設音效：

```python
from mangobox import Mango

m = Mango()
m.play_sound("win")
m.run_forever()
```

## 常用 API

```python
m.bee()
m.tone(frequency, duration=300)
m.play_song(song, tempo=None)
m.play_sound(name)
m.start_bee(period=1000, duration=3000)
m.stop_song()
m.stop_bee()
```

生命週期規則：

- `bee()`、`tone()`：立即型，不需要 `run_forever()`；
- `play_song()`、`play_sound()`、`start_bee()`：Scheduler 型，需要 `run_forever()`；
- `stop_song()`、`stop_bee()`：立即停止。

## 如果沒有聲音

先確認目前 capability 與設定：

```python
from mangobox import Mango

m = Mango()
print("Buzzer API 支援：", m.supports("buzzer"))
print("Buzzer 模組啟用：", m.config.get("enabled_modules", {}).get("buzzer"))
print("Buzzer Pin：", m.config.get("buzzer_pin"))
print("Buzzer Mode：", m.config.get("buzzer_mode"))
```

建議依序檢查：

```text
API 是否支援
→ Buzzer 是否 Enable
→ buzzer_pin
→ buzzer_mode
→ 如果是旋律／重複蜂鳴，確認 event loop 有持續執行
→ Device Manager 設定
→ 真機模組種類 / 接線 / 供電
```

被動式蜂鳴器通常需要 PWM（Pulse Width Modulation，脈衝寬度調變）控制；主動式與被動式模組的控制方式不同。若 `m.bee()`、`m.tone()` 都沒有聲音，請先確認你使用的 Buzzer 類型是否符合目前設定。

如果 `m.bee()`、`m.tone()` 正常，但 `m.play_song()` 沒有持續播放，優先檢查程式最後是否有 `m.run_forever()`。

外接 Buzzer 還要確認：

```text
Signal → buzzer_pin
VCC / GND 是否正確
模組電壓是否符合
```

> Hardware Lab 目前主要處理 firmware、execution mode、Recovery、Clean Flash 等裝置生命週期問題，不是一般 Buzzer/PWM production test 工具。

## 小挑戰

把下列其中一個音效播放出來：

```python
from mangobox import Mango

m = Mango()
m.play_sound("game_over")   # 也可以改成 "win"
m.run_forever()
```

接著試著把音效名稱換成另一個，觀察兩種提示音的差異。

## 進階閱讀

- [Buzzer API Reference](../reference/buzzer.md)
- [Device Manager 基本操作](../tools/device-manager.md)
