# 一般 Pico 的校時與提醒：不使用 Wi-Fi

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## 1. 可以完成什麼？

MangoX2 + Pico 與 BarePico + Pico 沒有內建 Wi-Fi／BLE，但可以接收可信任電腦提供的 UTC Unix 秒數，建立本次程式的時間基準，再顯示時間及設定提醒。此頁是這兩個非無線候選 HLMP profile 的完整路徑。

## 2. 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
try:
    m.enable_time_services()
    status = m.clock_status()
    print("valid:", status["valid"])
    print("source:", status["source"])
finally:
    m.close()
```

## 3. 應該看到什麼？

未由本服務建立可信時間時，通常顯示 valid=False、source=unsynced。這不是感測器故障，也不需要另外接 Wi-Fi 才能處理。啟用時間服務不會把電腦現在時間自動帶進 Pico。

## 4. 常見使用：由電腦提供 UTC 秒數

請在時間正確的電腦取得目前 Unix timestamp，再立即提供給板端程式；來源必須是 **UTC 秒數**，不是台灣本地顯示時間再加 8 小時。Pico 的未校準 time.time() 不能當作可信任電腦來源。台灣顯示使用 tz_minutes=480。

本頁以互動輸入演示資料如何進入已存在的 Student API。輸入與傳輸造成的延遲不會被這個簡易範例補償，因此它適合教學觀察與分鐘提醒，不是精密授時。真實系統可由 DM／既有受信任管理流程提供資料。

## 5. 完整互動範例：校時後指定提醒時間

```python
from mangobox import Mango
import time

m = Mango()
m.enable_time_services()
pending = False
alarm_id = None

def due():
    global pending
    pending = True

try:
    utc_epoch = int(input("Paste current UTC Unix seconds from a trusted computer: "))
    status = m.clock_sync_host(utc_epoch, tz_minutes=480)
    if not status["valid"]:
        raise RuntimeError("Trusted clock is not valid")
    print("Local time:", m.date(), m.time())
    print("RTC:", status["rtc_status"])

    alarm_time = input("Reminder time HH:MM (local time): ")
    alarm_id = m.alarm(alarm_time, due)
    while True:
        m.run_once()
        if pending:
            pending = False
            if m.clock_status()["valid"]:
                print("Reminder:", m.date(), m.time())
            else:
                print("Reminder skipped: trusted time has expired")
        time.sleep_ms(10)
finally:
    if alarm_id is not None:
        m.alarm_remove(alarm_id)
    m.close()
```

提醒時間用本地 HH:MM，第一次可設定在一兩分鐘後。callback 只設旗標，主迴圈再確認時間仍有效並輸出。結束時只移除自己的提醒，不清空所有 Scheduler 工作。

## 6. 版本、模式與問題排除

先查 clock_status，再查輸入 UTC 值、時區與 rtc_status。valid 是軟體時鐘信任結果，RTC 的 verified／readback_mismatch 是另一個層次；不可因顯示日期看似正確就宣稱硬體 RTC 寫入成功。

已有可信時間後，校正幅度太大會拒絕；先確認資料來源，不在例外處理中自動 force=True。程式重啟後重新建立可信時間及提醒。本頁是 Pico HLMP；Host 0.4.6 沒有因此新增同名 facade。

兩家族的 alarm_list 回傳不同，也有不同的未同步讀取行為；共享程式先查 valid，時間／callback 以位置參數傳入。不要生成 Wi-Fi／NTP／BLE 操作給一般 Pico。

## 7. 小挑戰

讓每天的提醒只在星期一到五觸發，再加入已獨立驗證的 OLED 或語音動作。若時間不可信，明確顯示「請先校時」，不要播放過時的報時內容。

[一般 Pico 時間 API Reference](../reference/clock.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/mb_timesync_rc6.py`
- `runtime/common/peripherals/firmware_candidate/mb_time.py`
- `runtime/common/peripherals/rc6f_recovered/mb_time/clock.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
