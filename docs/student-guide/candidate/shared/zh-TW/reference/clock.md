# 時間、NTP 與提醒 API Reference

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## Availability 與使用順序

八個候選 HLMP 目標共有 `enable_time_services/clock_status/clock_sync_host/clock_sync_ntp`。NTP 的實際操作限六個無線目標，且 STA 已連線。Host 0.4.6 不宣告本頁新增 facade。先啟用服務，再同步，再確認狀態，最後才使用日期／提醒。

## `enable_time_services()`

```python
m.enable_time_services(tz_minutes=480, max_age_s=86400, max_step_s=300)
```

| 參數 | 型別／預設 | 說明 |
|---|---|---|
| `tz_minutes` | `int`／480 | UTC offset，−720～840 分鐘；真正同步時亦明確傳入所需值 |
| `max_age_s` | `int`／86400 | 信任有效期限；服務驗證範圍 60～2,592,000 秒 |
| `max_step_s` | `int`／300 | 已有可信時間時，未 force 可接受的最大跳時；0～86,400 秒 |

回傳 `self`。安裝共用 Scheduler 的時間 provider，不自動校時／連網。部分選項在首次建立 provider 時才驗證；超出範圍為 `ValueError`。初始化具有 class 層級安裝行為，後續再次呼叫不能視為即時重設所有選項；以開程式時的一次明確設定為準。

## `clock_status()`

```python
status = m.clock_status()
```

未啟用時回傳 `valid=False/source="unsynced"/ntp_pending=False/reason`。啟用後第一次查詢會延遲建立時間 manager 與其 Scheduler task；不寫 RTC 或連網。共有以下狀態鍵，底層額外鍵依家族而異：

| 鍵 | 型別／意義 |
|---|---|
| `valid` | `bool`，由此 provider 成功同步且未逾有效期限 |
| `source` | `"unsynced"`、`"host"`、`"ntp"`，或受信任來源 |
| `sync_age_s`／`max_age_s` | 校時經過秒數（未同步可為 None）／信任期限 |
| `ntp_pending` | `bool`，是否有未結束查詢 |
| `last_error` | `str | None`，最近同步錯誤 |
| `rtc_synced` | `bool`，RTC 已驗證且時間仍有效 |
| `rtc_status` | `not_synced/verified/unavailable/invalid_clock_fields/readback_mismatch/write_failed` 等固定診斷值 |

不要讀一次 `valid` 就認定後續永遠有效。另行呼叫未受此 provider 管理的手動時鐘介面可能使可信身分失效。

## `clock_sync_host()`

```python
status = m.clock_sync_host(utc_epoch, tz_minutes=480, force=False)
```

`utc_epoch` 必須為整數 UTC Unix 秒數，範圍 `[946684800, 4102444800)`（2000–2099 年）；不接受 bool。`tz_minutes` 為整數 −720～840。`force` 必須為 bool，預設 False。回傳同步後的狀態 dict；仍要看 `valid` 與獨立的 `rtc_status`。

參數／大幅跳時錯誤為 `ValueError`；force 型別錯誤為 `TypeError`；未先啟用服務為 `RuntimeError`。先有可信時間後，校正超過 `max_step_s` 時不會自動覆寫。這個方法不驗證遠端寄件者；呼叫端必須確定資料來自可信任電腦／管理流程。

## `clock_sync_ntp()`

```python
started = m.clock_sync_ntp(server="pool.ntp.org", tz_minutes=480)
```

`server` 為合法 hostname 字串，總長 1–253、各 label 1–63，標籤不能以連字號開頭／結尾。`tz_minutes` 同上。前提：時間服務已啟用、W／2 W 目標、STA 已連線、沒有正在進行的 NTP 查詢。成功啟動回傳 `True`，不是完成狀態。

查詢接收依 Scheduler 推進；使用 `clock_status()` 看 `ntp_pending/valid/source/last_error`。DNS 與初次送出可能阻塞；不要在精準時序 callback 中啟動。參數錯誤為 `ValueError`；服務／無線／連線／重複查詢錯誤為 `RuntimeError`；DNS／socket 錯誤可能傳出。一般學生 facade 不提供 force 參數。

## 日期與提醒：共同用法與家族差異

| 用途 | Carrier（X2／Lite） | BarePico |
|---|---|---|
| 日期／時間 | `m.date()`／`m.time()`，未同步回傳 None | 同名；未同步拋 RuntimeError |
| 每日提醒 | `m.alarm(hhmm, cb, days=None)` | `m.alarm(when, callback, days=None)` |
| 單次指定日期 | `m.on_time(date_time, callback)` | `m.on_time(when, callback)` |
| 刪除 | `m.alarm_remove(id)` → bool | `m.alarm_remove(ident)` → bool |
| 清單 | `m.alarm_list()` → ID list | `m.alarm_list()` → dict records list |

有效時 `date()` 為 `YYYY-MM-DD` 字串、`time()` 為 `HH:MM:SS` 字串。每日提醒使用 `HH:MM`、`days=None` 每天或 1～7 星期；一次日期使用 `YYYY-MM-DD HH:MM`。註冊回傳整數 ID，callback 不帶參數。Carrier 一次日期在之後第一次到期檢查可能補觸發；BarePico 以符合指定日期／分鐘為準，不能假設長時間停 loop 後兩者補發相同。

跨家族範例以位置參數傳時間及 callback，且先確認 `clock_status()["valid"]`。`now()`／`uptime()` 是 BarePico 原始時鐘擴充，不列為兩家族共同方法；不能自行套到 Carrier。

## Execution lifecycle 與錯誤處理

同步／提醒共用原 Scheduler；不能另建第二個時鐘輪詢器。初始化後保留同一個 Mango 實例。NTP 收到資料與 alarm callback 需要 event loop；純 `sleep(10)` 會拖延它們。callback 短小，在主迴圈確認時間仍有效再做複雜動作。刪除自己的 alarm 用 ID，不清空整個 Scheduler。資料與提醒為 RAM 狀態，不代表已寫入開機程式或持久排程。

[完整教學](../guides/clock.md) · [Wi-Fi](wifi.md) · [DFPlayer](dfplayer.md)。`clock_on_event()` 是舊提案名稱，不是這份已安裝 facade；不應生成它。

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/mb_timesync_rc6.py`
- `runtime/common/peripherals/firmware_candidate/mb_time.py`
- `runtime/common/peripherals/rc6f_recovered/mb_time/clock.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
