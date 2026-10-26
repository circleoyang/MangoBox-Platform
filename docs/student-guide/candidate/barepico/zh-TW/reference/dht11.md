# BarePico DHT11 API Reference

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## Availability 與配置

BarePico Pico／Pico W／Pico 2 W 的候選 HLMP。需 `enabled_modules.dht11_sensor=True`、整數 `dht11_pin`，並通過既有 GPIO 衝突檢查。`Mango()` 不為此先開 GPIO，第一個讀取或事件註冊才建立 DHT。Host 0.4.6 不宣告這組 facade。

## `dht()`、`temp()`、`humi()`

```python
temperature, humidity = m.dht()
```

`dht()` 回傳 `(float, float)`，依序 °C、%RH。`temp()` 回傳第一個值、`humi()` 第二個值；兩者都沿用 dht() 快取。成功讀取後至少 2000 ms 才再次量測。

未配置為 `RuntimeError`；GPIO 衝突為 `ValueError`；感測器錯誤向外傳出，常見為 `OSError`。來源排除溫度 −40～80／濕度 0～100 以外的異常數值；這是軟體合理性判斷，不代表 DHT11 的保證精度或有效量測範圍。

## `on_dht()`

```python
task_id = m.on_dht(callback, period=2000)
```

callback 必須可呼叫，簽章為 `(temperature, humidity)`。period 單位 ms，轉整數後須至少 2000。回傳 Scheduler task ID；新註冊會先停止此 DHT 先前的監看，不代表可同時掛多組獨立 on_dht。

callback 不可呼叫為 `TypeError`，period 過短為 `ValueError`。週期讀取遇到 OSError／ValueError 會記讀取錯誤並略過當次 callback；它不是自動變化偵測、也不會補假資料。 callback 自身應短小，跨模組複雜操作延至主迴圈。

## `stop_dht()`

```python
removed = m.stop_dht()
```

移除此 DHT 的監看 task，有 task 時回 True，未開始或已停止為 False。它不移除所有 Scheduler 任務，也不承諾銷毀感測器物件；停止後直接 dht() 仍可使用。

## `dht_attach()`：保留的進階介面

```python
m.dht_attach(pin=None)
```

回傳 self。不給 pin 時僅檢查 DM 配置；一般學生不必呼叫。明確指定整數 pin 時，先驗證 GPIO／DFPlayer 衝突，再更動目前物件的 in-memory dht11_pin／enabled 配置，不寫 Flash。不是 Carrier 的 sensor/min_interval/gpio_allowed 簽章。

已開始使用感測器時為 RuntimeError，非整數 GPIO 為 TypeError，衝突為 ValueError。不應把這個進階覆寫當成常態繞過 DM 的方法。

## Execution lifecycle 與日誌

直接讀取可同步使用；on_dht 需要 run_once/run_forever 持續運作。原始 reader 在真正的新硬體量測時可送一筆現有 sensor_event；兩秒內快取讀取不各自送量測事件。學生不必製造 marker 或 IDs。保留內部 event_logging 設定。

## 完整最小範例

```python
from mangobox import Mango

m = Mango()
try:
    temperature, humidity = m.dht()
    print("Temperature:", temperature, "C")
    print("Humidity:", humidity, "%RH")
except OSError as error:
    print("DHT11 measurement failed:", error)
finally:
    m.close()
```

[事件與門檻教學](../guides/dht11.md) · [Carrier 差異](../../../carrier/zh-TW/reference/dht11.md)。此家族沒有 dht_status()；不要把 Carrier 錯誤狀態流程套用過來。

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/rc6f_recovered/mb_dht/dht11.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
