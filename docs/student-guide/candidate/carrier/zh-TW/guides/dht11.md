# DHT11 使用指南：MangoX2／MangoLite

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## 1. 可以完成什麼？

讀取目前攝氏溫度與相對濕度，觀察教室環境、設定提醒，或把讀值交給 OLED／語音模組。這份指南適用 X2／Lite 的五個候選 HLMP 目標；不需要 Wi-Fi。

## 2. 30 秒快速測試

先在 DM 啟用 DHT11、指定與實際 DATA 線一致的 GPIO，通過腳位衝突檢查。程式從設定讀取腳位，只明確 attach 一次；不可把示意 GP17 當成所有裝置的空閒腳位。

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

## 3. 應該看到什麼？

`dht()` 回傳兩個值的 tuple，依序為溫度 °C、濕度 %RH；不是字典。請同時檢查 `dht_status()["ok"]`。第一次失敗可能是 `(None, None)`；之後失敗可能保留先前成功值。**保留舊數字不是新的成功量測。**

感測器最多約每兩秒才重新量測；在快取期間反覆呼叫不會增加新資料。短時間的細微變化、貼近熱源或供電雜訊也不能只從一次讀值判斷。

## 4. 常見使用：讀值、門檻與遲滯

只想觀察數字可每 2.5 秒讀一次。想做溫度提醒，可設定升至 30°C 進入提醒，降至 28°C 才解除；兩個不同門檻稱為遲滯（hysteresis），可避免數值在 30 附近來回時不斷重複提醒。

## 5. 完整互動範例

```python
from mangobox import Mango

m = Mango()
enabled = m.config.get("enabled_modules", {})
pin = m.config.get("dht11_pin")
if not enabled.get("dht11_sensor", False) or type(pin) is not int:
    raise RuntimeError("Configure and enable DHT11 in Device Manager")
m.dht_attach(pin=pin)
alert = False

def sample():
    global alert
    temperature, humidity = m.dht()
    if not m.dht_status()["ok"]:
        print("DHT11 read failed; keep the previous alert state")
        return
    print("C:", temperature, "RH:", humidity)
    if not alert and temperature >= 30:
        alert = True
        print("Temperature alert")
    elif alert and temperature <= 28:
        alert = False
        print("Temperature back in range")

task_id = m.scheduler.add_task(sample, period=2500)
try:
    m.run_forever()
finally:
    m.scheduler.remove_task(task_id)
    m.close()
```

這是你自己的排程任務，不是不存在的 `on_temperature_change()` API。callback 每次只做一次有節流的量測與簡單判斷。若要改成跨模組切換畫面／語音，callback 記下結果，主迴圈在 `run_once()` 返回後處理。結束時只移除自己的 task_id，不清空共用 Scheduler。

## 6. 家族、模式與問題排除

先核對候選 profile 與 dht_attach 方法，再確認 DM enabled、dht11_pin、實際 DATA 線、共地與供電。GPIO 衝突先回 DM 解決，勿另建同腳位的 Pin 或多個 DHT driver。沒有新讀值時查看 dht_status 的 last_error，不補成 0 或假造 25°C。

Carrier 的 dht_attach 不會替你自動讀 DM 腳位；本例刻意先讀配置再傳入。BarePico 的 on_dht/temp/humi 不是這份 Carrier facade。Host 0.4.6 也不能直接使用本頁板端程式。

## 7. 小挑戰

加入濕度提醒，但讓溫度與濕度各自維持提醒狀態。一次 dht() 取得兩個值後共用，避免為同一個畫面重複量測。之後再把已確認有效的資料送至 OLED 或 DFPlayer。

[DHT11 API Reference](../reference/dht11.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api_services.py`
- `runtime/common/peripherals/firmware_candidate/mb_dht11.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
