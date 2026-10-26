# DFPlayer 與中文語音使用指南

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## 1. 可以完成什麼？

DFPlayer 從 TF 卡播放音樂與已準備的中文語音。學生先用 DM 完成 UART／TX／RX／BUSY 設定與曲庫同步，再以 `audio_begin()` 使用同一組配置，不必在程式重新填一份腳位。

八個候選 HLMP 目標均以已外接、已啟用的 DFPlayer 為前提。BarePico 沒有自帶喇叭或播放器。聲音要同時具備正確 TF 音檔、Pico 上相符的曲庫索引、正確接線與可用供電；一個 API 呼叫不會把音檔自動傳到 TF 卡。

## 2. 30 秒快速測試：播放一段已準備語音

前提：DM 已啟用 DFPlayer、保存合法 GPIO，並將基礎語音包與相符曲庫同步完成。以下使用曲庫鍵 `hr01`，在已修正的語音包中對應「一點」。範例不把整個 365 筆目錄載入 RAM。

```python
from mangobox import Mango
import time

m = Mango()
m.audio_begin()
try:
    m.audio_volume(30)
    m.speak("hr01")  # The synchronized catalog must contain this key.
    while True:
        m.run_once()
        time.sleep_ms(10)
finally:
    m.mp3_stop()
    stop_at = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), stop_at) < 300:
        m.run_once()
        time.sleep_ms(10)
    m.close()
```

啟動後聽一次語音；按 Ctrl+C 結束。最後仍短暫推進 Scheduler，讓停止命令有機會送出，再關閉服務。這不是停止已完成的實體證明，現場仍需確認喇叭是否停止。

## 3. 應該觀察什麼？

命令被接受與實際有聲音是兩個階段。`speak()` 回傳 True 只代表播放要求／佇列接受；UART、TF、喇叭或 BUSY 接線仍可能有問題。沒有聲音時，不要直接把音量提高到最大；先用 DM 和一段已知正常的音檔驗證。

`audio_volume(30)` 是 30%，範圍 0～100；它不是舊 DFPlayer raw 0～30。不同舊初始化路徑下 `mp3_volume()` 的量尺可能不同，因此新教材統一用 `audio_volume()`。

## 4. 常見使用與版本條件

- `mp3(1)`：播放音樂編號 1。
- `speak("hr01")`：播放一個已存在的語音鍵。
- `say("time")`／`say("date")`：組合時間／日期語音，需要同一 Mango 的可信時間與完整語音索引。
- `say("weather", temp=..., humi=...)`：使用**已經成功讀取**的溫濕度組合語音，避免在語音 callback 中臨時讀感測器。

365 筆乾淨語音包需要相符的 Audio v1.1 播放器 overlay 與 v2 catalog；不能只憑韌體版本字串就認定目前播放器已換成這份來源。舊 RC6 Player 的高編號限制仍存在。即使是 v1.1，**背景音樂播放中對語音 ID >255 的 ADVERT 插播仍被拒絕**；不可把它寫成所有 365 筆都能無條件插播。

## 5. 完整範例：音樂播放五秒後插入一段低編號語音

前提：TF 中有歌曲 1，曲庫有 `hr01`，已完成相同播放器來源的配置驗證。主迴圈決定何時送要求，避免 callback 內再次進入 Scheduler。

```python
from mangobox import Mango
import time

m = Mango()
m.audio_begin()
try:
    m.audio_volume(30)
    m.mp3(1)
    started_at = time.ticks_ms()
    voice_requested = False
    while time.ticks_diff(time.ticks_ms(), started_at) < 15000:
        m.run_once()
        elapsed = time.ticks_diff(time.ticks_ms(), started_at)
        if elapsed >= 5000 and not voice_requested:
            voice_requested = True
            m.speak("hr01")
            print("Voice request accepted")
        time.sleep_ms(10)
finally:
    m.mp3_stop()
    stop_at = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), stop_at) < 300:
        m.run_once()
        time.sleep_ms(10)
    m.close()
```

範例只送一次語音要求，並於約 15 秒結束。不用每一圈重新 `audio_begin()`，也不在同一 Mango 上建立第二套 UART／Player。若要延伸成按鈕觸發，callback 先設旗標，再讓主迴圈處理 `speak()`。

## 6. 板型、模式與問題排除

先核對 API profile／Audio Player 來源，再查 DFPlayer enabled 與 UART 配置、DM 播放結果、TF 音檔與 Pico catalog 是否同一包，最後檢查 TX/RX 方向、共地、供電、BUSY 及喇叭。不要為了解決播放問題擅自修改學生 `main.py` 或重新燒整個韌體。

Carrier 的 `mp3(index)` 與 BarePico 的 `mp3(track, loop=False, folder=None)` 簽章不同；本頁共同範例只用第一個位置參數。Carrier 的 `mp3_status()` 與 BarePico 的 `audio_status()/mp3_info()` 也不是共同同名介面。未初始化前，BarePico 某些方法尚未動態安裝；先呼叫 `audio_begin()`。

本頁不提供 pause/resume 教學承諾；它們不是完整共同 facade，且已知播放器時序仍需各來源驗證。Host 0.4.6 不宣告這組新 facade。

## 7. 小挑戰

將一次語音要求改成按鈕事件，快速連按時合併重複要求，避免塞滿佇列。再讀取有效的 DHT11 溫濕度或已校準時間，組合一段有實際資料的播報。

[DFPlayer API Reference](../reference/dfplayer.md) · [DHT11](dht11.md) · [時間](clock.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/rc6_original.py`
- `runtime/common/peripherals/audio_v11_candidate/mb_mp3/player.py`
- `runtime/common/peripherals/audio_v11_candidate/mb_audio_rc6/manager.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
