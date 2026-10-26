# Carrier DHT11 API Reference

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## Availability

適用 MangoX2 Pico／Pico W／Pico 2 W、MangoLite Pico W／Pico 2 W 的候選 HLMP facade。無線不是前提。DM 啟用／GPIO 與實際接線仍須正確；Host 0.4.6 不包含本組方法。

## `dht_attach()`

```python
reader = m.dht_attach(pin=None, sensor=None, min_interval_ms=2000,
                      gpio_allowed=None)
```

| 參數 | 契約 |
|---|---|
| `pin` | 實際 GPIO；未注入 sensor 時必須提供，來源先轉 int，再檢查 0–28 |
| `sensor` | 進階：已有 measure()/temperature()/humidity() 的感測器物件；初學者使用 pin 路徑 |
| `min_interval_ms` | 預設 2000；不可低於 2000 ms |
| `gpio_allowed` | 選用 pin validator callable；回 False 拒絕該腳位 |

回傳 `DHT11Reader`。不得重複 attach；已掛載為 `RuntimeError`。無 pin／sensor、範圍／間隔／validator 錯誤為 `ValueError`，其他錯誤型別可能為 `TypeError`。它不會自動代入 DM 的 pin，也不保證在省略 gpio_allowed 時完成全部跨模組檢查；先以 DM 完成配置及衝突檢查，不自行猜 pin。

## `dht()`

```python
temperature, humidity = m.dht()
```

回傳 `(float | None, float | None)`，單位 °C、%RH。未 attach 拋 `RuntimeError`。距上次嘗試未滿最小間隔時回快取；到期才呼叫感測器。driver／校驗失敗會記錄錯誤並保留舊值，不一律向外拋出，必須搭配 status。

來源採可接受數值檢查（溫度 −20～80、濕度 0～100）；這是軟體拒絕異常數字的範圍，**不是 DHT11 精度／保證量測規格**。

## `dht_status()`

```python
status = m.dht_status()
```

未 attach 為 `{"ok": False, "reason": "dht_not_attached"}`。已 attach 為 `temperature/humidity/ok/last_error`，其中前兩者為目前保留值、`ok` 為已有量測且最近嘗試沒有錯誤，`last_error` 為字串或 None。查詢不額外量測；status 沒有統一 sample timestamp，因此應由應用程式記錄何時完成讀取，不能把 ok 當永久新鮮。

## 事件與 Execution lifecycle

本 Carrier facade 沒有 on_dht/temp/humi/on_temperature_change/on_humidity_change。需要週期監看時使用現有 Scheduler 註冊一個自己的任務，週期至少 2000 ms，保存 task ID；回傳資料有效時才改變門檻狀態。

直接讀取是同步有節流操作，不需要 event loop；學生註冊的週期任務需要 run_once/run_forever。不要在 callback 內重新驅動 Scheduler，也不要用 clear() 移除所有任務。

## 最小配置與範例

```python
from mangobox import Mango

m = Mango()
enabled = m.config.get("enabled_modules", {})
pin = m.config.get("dht11_pin")
if not enabled.get("dht11_sensor", False) or type(pin) is not int:
    raise RuntimeError("Configure and enable DHT11 in Device Manager")
m.dht_attach(pin=pin)
try:
    temperature, humidity = m.dht()
    status = m.dht_status()
    if status["ok"]:
        print("Temperature:", temperature, "C")
        print("Humidity:", humidity, "%RH")
    else:
        print("No fresh valid reading:", status["last_error"])
finally:
    m.close()
```

[完整教學與遲滯範例](../guides/dht11.md) · [BarePico 對照](../../../barepico/zh-TW/reference/dht11.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api_services.py`
- `runtime/common/peripherals/firmware_candidate/mb_dht11.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
