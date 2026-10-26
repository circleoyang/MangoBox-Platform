# 時間與 NTP 使用指南：校時、讀時間與提醒

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## 1. 可以完成什麼？

用同一個 Mango 物件建立時間服務、由可信任電腦或 NTP 校時，再顯示日期與時間或安排提醒。時間服務不等於已知正確日期：重啟後看似合理的 RTC 值也不能直接當成可信時間。

八個候選 HLMP 目標都能使用服務與 Host 提供的 UTC 秒數；只有六個 W／2 W 目標能在 STA 已連線後發出 NTP 查詢。這裡「由 Host 校時」是板端接收可信任資料，不表示 Host 0.4.6 已安裝同名 Python facade。

## 2. 30 秒快速測試：先確認時間是否可信

```python
from mangobox import Mango

m = Mango()
try:
    m.enable_time_services()
    status = m.clock_status()
    print("valid:", status["valid"])
    print("source:", status["source"])
    print("NTP pending:", status["ntp_pending"])
finally:
    m.close()
```

## 3. 應該看到什麼？

尚未透過本服務校時時，通常為 `valid=False`、`source="unsynced"`。`enable_time_services()` 不會連網、啟動 AP 或自動套用電腦時間。`clock_sync_ntp()` 接受要求後也還要等待完成。

校時後，分別看 `valid`（軟體時鐘是否可信）、`ntp_pending`（查詢是否進行中）、`last_error` 與 `rtc_status`（硬體 RTC 寫入／回讀結果）。軟體時鐘已校準，不保證硬體 RTC 也已回讀驗證成功。

## 4. 常見使用：台灣時區與可信任來源

台灣 UTC+8 使用 `tz_minutes=480`。傳入 `clock_sync_host()` 的值必須是**目前的 UTC Unix 秒數**，不能先加 8 小時，也不能把範例中的固定日期當成真正現在。一般 Pico 可由 DM／可信任電腦提供該資料；無線板也能用 NTP。

不以 `force=True` 自動解決大幅跳時。已有可信時間時，過大的變動會被拒絕；先確認來源與時區，由使用者決定是否覆寫。

## 5. 完整範例：先有 STA，再做一次 NTP

前提：同一程式或管理流程已建立可用的 STA 連線。以下程式只借用已連線網路，不另外建立 AP，也不更改 Wi-Fi 擁有權。若要在學生程式內建立 STA，先接上[Wi-Fi 有期限連線範例](wifi.md)，並在同一個 `m` 上繼續以下流程。

```python
from mangobox import Mango
import time

m = Mango()
try:
    m.enable_time_services()
    wifi = m.wifi_status()
    if not wifi["supported"] or not wifi["connected"]:
        raise RuntimeError("Connect STA Wi-Fi before this NTP example")

    m.clock_sync_ntp(tz_minutes=480)
    started_at = time.ticks_ms()
    while time.ticks_diff(time.ticks_ms(), started_at) < 5000:
        m.run_once()
        status = m.clock_status()
        if not status["ntp_pending"]:
            break
        time.sleep_ms(20)

    status = m.clock_status()
    if (status["ntp_pending"] or not status["valid"]
            or status["source"] != "ntp" or status["last_error"]):
        raise RuntimeError("NTP did not confirm a new valid time")
    print("Local time:", m.date(), m.time())
    print("RTC:", status["rtc_status"])
finally:
    m.close()
```

NTP 的 DNS 解析與送出階段可能短暫阻塞，接收階段才由 Scheduler 協作完成；因此啟動查詢放在主流程，不能放進精確時序的 callback。單看 `valid=True` 可能是舊的 Host 時間；此範例另檢查來源及錯誤，避免把一次失敗的新查詢寫成成功。

### 延伸：每天固定時間提醒

完成上面的校時後，**保留同一個尚未 close 的 Mango 物件**，再註冊：

```python
pending = False

def due():
    global pending
    pending = True

alarm_id = m.alarm("18:00", due, days=(1, 2, 3, 4, 5))
try:
    while True:
        m.run_once()
        if pending:
            pending = False
            if m.clock_status()["valid"]:
                print("Reminder:", m.date(), m.time())
        time.sleep_ms(10)
finally:
    m.alarm_remove(alarm_id)
    m.close()
```

這段是接在已校時程式中的延伸段落，並非獨立啟動範例。`days` 中 1 是星期一、7 是星期日；callback 只設旗標，主迴圈再顯示或執行複雜動作。日期時間提醒是分鐘精度；沒有精準硬體中斷保證。

## 6. 執行與問題排除

先查 `clock_status()`，再查無線板的 STA 是否真連線；接著檢查 NTP 可否存取、時區、`last_error` 與 `rtc_status`。重啟後重新建立可信時間，不能假設前一次程式的 RAM 時間／鬧鐘仍在。

Carrier 與 BarePico 底層時間實作不同：未校時時的 `date()/time()`、`alarm_list()` 回傳格式與部分 keyword 名稱不同。共享範例一律先確認有效時間，alarm 以位置參數傳入時間及 callback，避免混用；詳細差異見 Reference。

`m.run_forever()` 與自己寫 `while ... m.run_once()` 二擇一；不要從 callback 內再次呼叫 Scheduler。已逾有效時間的提醒，應由學生主流程拒絕後續動作；不能假設所有底層 alarm 都會自動取消。

## 7. 小挑戰

將提醒變成 OLED 顯示或語音播報，並讓「時間未校準」時只顯示原因而不報錯誤時間。先單獨驗證 OLED／DFPlayer，再整合到已校時的主迴圈。

[時間 API Reference](../reference/clock.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/mb_timesync_rc6.py`
- `runtime/common/peripherals/firmware_candidate/mb_time.py`
- `runtime/common/peripherals/rc6f_recovered/mb_time/clock.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
