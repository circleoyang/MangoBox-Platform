# DHT11 使用指南：BarePico

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## 1. 可以完成什麼？

在裸 Pico／Pico W／Pico 2 W 外接 DHT11，讀取攝氏溫度與相對濕度，並用定期 callback 更新作品。BarePico 不假設 DHT11 存在，也不把 GP17 當成無條件預設接線。

## 2. 30 秒快速測試

先在 DM 啟用 DHT11 並儲存正確 dht11_pin。之後直接呼叫 dht()，第一次讀取才建立 driver；不需要先 attach，也不要另建同腳位的 machine.Pin。

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

## 3. 應該看到什麼？

回傳 `(temperature, humidity)` 兩個浮點數，單位 °C 與 %RH。Checksum／逾時等實際讀取錯誤會拋出；未啟用或未配置則是 RuntimeError，腳位衝突可為 ValueError。不要把讀取失敗補成 0°C 或虛構的室溫。

成功量測後兩秒內再讀會使用快取。temp()／humi() 也是從同一份 dht() 資料取得，所以通常直接一次取得 tuple 就能同時更新畫面。

## 4. 常見使用：事件與門檻

`on_dht()` 是定期成功量測的 callback，不是「只有溫度改變才通知」。callback 會收到溫度與濕度兩個參數。若只想在超過門檻時動作，需在程式維持自己的狀態；可以用 30°C 進入、28°C 解除的遲滯避免反覆觸發。

## 5. 完整互動範例

```python
from mangobox import Mango
import time

m = Mango()
latest = None
alert = False

def measured(temperature, humidity):
    global latest
    latest = (temperature, humidity)

m.on_dht(measured, period=2500)
try:
    while True:
        m.run_once()
        if latest is not None:
            temperature, humidity = latest
            latest = None
            print("C:", temperature, "RH:", humidity)
            if not alert and temperature >= 30:
                alert = True
                print("Temperature alert")
            elif alert and temperature <= 28:
                alert = False
                print("Temperature back in range")
        time.sleep_ms(10)
finally:
    m.stop_dht()
    m.close()
```

callback 只保存最新樣本；主迴圈在 run_once 返回後才處理狀態。這種「保留最新值」適合環境監測；如果每筆資料都必須保留，應另用有界佇列，不要誤認單一變數會保存所有事件。

## 6. 家族、模式與問題排除

依序確認候選目標、DM 的 dht11_sensor enabled、dht11_pin、腳位衝突與接線。on_dht 內部遇到 OSError／ValueError 會印讀取錯誤並略過那次 callback；沒有 callback 不等於溫度是 0，也不證明程式失去所有事件。

BarePico 沒有 Carrier 的 dht_status()。本頁也沒有 dht11()、on_temperature_change()、on_humidity_change()。不要從其他家族的範例直接混貼方法。Host 0.4.6 不是這個執行環境。

## 7. 小挑戰

顯示每次成功資料的時間間隔，並在很久沒有收到新資料時標示「感測器暫無新讀值」。接著把有效資料交給 OLED／語音，失敗時保留上次顯示但明確標示不是最新值。

[BarePico DHT11 Reference](../reference/dht11.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/rc6f_recovered/mb_dht/dht11.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
