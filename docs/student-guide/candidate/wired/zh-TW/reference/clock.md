# 一般 Pico 時間 API Reference

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## Availability

此頁限 MangoX2 + Pico 與 BarePico + Pico 的候選 HLMP profile。它們能從可信任電腦接收時間資料，但不具備 Wi-Fi／NTP／BLE 操作條件。Host 0.4.6 不宣告同名新 facade。

## `enable_time_services()`

```python
m.enable_time_services(tz_minutes=480, max_age_s=86400, max_step_s=300)
```

回傳 self；安裝共用 Scheduler 的時間服務，不自動設定日期。tz_minutes 為 −720～840 分鐘，max_age_s 為 60～2,592,000 秒，max_step_s 為 0～86,400 秒，預設如簽章。首次 provider 建立時會驗證相關範圍，無效為 ValueError。初始化有 class 層級狀態，重複呼叫不保證重設所有選項。

## `clock_status()`

```python
status = m.clock_status()
```

回傳 dict。未啟用時有 valid=False/source=unsynced/reason。啟用後提供 valid/source/sync_age_s/max_age_s/last_error/rtc_synced/rtc_status 等欄位；底層附加欄位依家族不同。第一次查詢可能建立 manager 的 Scheduler task，但不校時。

valid 表示這個 provider 建立的時間仍在信任期限內；rtc_status=verified 才是獨立的 RTC 寫入／回讀成功。其他 RTC 結果包含 not_synced/unavailable/invalid_clock_fields/readback_mismatch/write_failed。舊日期或只有數字不等於可信時間。

## `clock_sync_host()`

```python
status = m.clock_sync_host(utc_epoch, tz_minutes=480, force=False)
```

| 參數 | 型別／範圍 |
|---|---|
| utc_epoch | int，不接受 bool；UTC Unix 秒 `[946684800, 4102444800)` |
| tz_minutes | int，−720～840，預設 480 |
| force | bool，預設 False；明確允許覆寫過大校正時才使用 |

回傳更新後狀態 dict。未啟用為 RuntimeError；UTC／時區／跳時過大為 ValueError；force 型別錯誤為 TypeError。方法不驗證電腦來源，呼叫端須確認資料可信，不能把本地時間當 UTC 或自動繞過大幅跳時保護。

## 日期與提醒

| 操作 | MangoX2 Carrier | BarePico |
|---|---|---|
| date/time | date()/time()；未同步回 None | 同名；未同步拋 RuntimeError |
| 每日提醒 | alarm(hhmm, cb, days=None) | alarm(when, callback, days=None) |
| 刪除 | alarm_remove(id) → bool | alarm_remove(ident) → bool |
| 清單 | alarm_list() → ID list | alarm_list() → dict records list |

日期字串為 YYYY-MM-DD，時間 HH:MM:SS；提醒使用 HH:MM。days=None 表每天，或星期1～7。callback 不帶參數，註冊回傳整數ID。共享例子先查有效時間，並以位置參數指定提醒時間與callback。now()/uptime() 不是兩家族共同方法。

## Execution lifecycle

已校時後保留同一個 Mango；提醒依原 Scheduler，需 run_once/run_forever。主迴圈檢查valid後再執行提醒動作，不假設過期時所有底層alarm會自動取消。以alarm_remove移除自己的ID，不clear整個Scheduler。RAM中的時間與提醒不因範例執行而持久保存。

[完整輸入校時及提醒範例](../guides/clock.md)。不要依舊提案產生 clock_on_event；本頁也不生成無線操作。

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/mb_timesync_rc6.py`
- `runtime/common/peripherals/firmware_candidate/mb_time.py`
- `runtime/common/peripherals/rc6f_recovered/mb_time/clock.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
