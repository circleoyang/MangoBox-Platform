# BLE／Dabble：讓手機按鍵觸發程式

> 本頁只適用於所選 MangoLite 或 BarePico 的 Pico W／Pico 2 W 高層 MicroPython 候選版。這次來源的 MangoX2 尚未安裝 BLE Student API；普通 Pico 與 Host Python 也不可使用本頁程式。

## 1. 可以完成什麼

使用手機 Dabble 的 Digital Gamepad 按鍵與 Analog Joystick 觸發回呼函式。學生使用控制語意，不需要解析 BLE 封包。現在只有 `primary` 一個控制器；參數可保留名稱，不代表已支援多支手機同時控制。

先在 DM 啟用 BLE Control。BarePico 可選已設定的具名按鈕作為配對長按鍵；未選按鈕時可由程式明確開啟配對，不會自動占用 GP3。MangoLite 保留原本 GP3 的長按機制，配對服務會沿用 Runtime 的板載按鈕、RGB 與蜂鳴器；這些設定也要維持合法。

## 2. 30 秒快速測試

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("Triangle pressed")

m.on_control_pressed("triangle", pressed)
print("BLE name:", m.ble_name())
m.ble_pairing_open(seconds=60)
try:
    m.run_forever()
finally:
    m.close()
```

在手機打開 Dabble，選到程式顯示的裝置名稱並連線，進入 Gamepad 按 Triangle。`ble_name()`／`ble_status()` 不會單憑查詢就開始廣播；上例的 `ble_pairing_open()` 才是明確配對動作。

## 3. 預期觀察

每次按下 Triangle，Shell 出現一次提示。按鍵 callback 通常不用參數；搖桿 callback 則接收 `angle, radius` 兩個值。請區分「配對視窗已打開」與「手機已連線」：`ble_status()["connected"]` 才是目前連線狀態。

## 4. 常見用途

| 輸入 | 適合用途 | callback |
| --- | --- | --- |
| Triangle／Cross 等按下 | 切換模式、選擇燈效 | `def pressed():` |
| 按鍵放開 | 結束一個暫時動作 | `def released():` |
| Analog Joystick | 方向與強度輸入 | `def moved(angle, radius):` |
| 配對剩餘時間 | 顯示倒數／教學生辨識狀態 | 以低頻率讀取 `ble_status()` |

Dabble 搖桿的 angle 為角度，radius 為 0～7；它不是實體 PS2 搖桿的 x/y 百分比。不要把兩種搖桿 callback 混用。

## 5. 完整互動：Triangle 開燈、Cross 關燈

先在 DM 啟用具名 RGB 燈條 `strip1`。callback 只提出操作要求，由前景執行燈效切換。

```python
from mangobox import Mango

m = Mango()
pending = None

def light_on():
    global pending
    pending = "on"

def light_off():
    global pending
    pending = "off"

m.on_control_pressed("triangle", light_on)
m.on_control_pressed("cross", light_off)
m.ble_pairing_open(60)
try:
    while True:
        m.run_once()
        action = pending
        pending = None
        if action == "on":
            m.led_all("cyan", strip="strip1")
        elif action == "off":
            m.led_off(strip="strip1")
finally:
    try:
        m.led_off(strip="strip1")
    finally:
        m.close()
```

這個範例使用燈光作為回饋。若改成有實體動作的作品，必須另外設計限位及失聯停止；手機按鍵 callback 的存在不代表已具備整套安全控制。

## 6. 設定、生命週期與問題排除

配對視窗預設 60 秒，可指定 1～120 秒。倒數依事件迴圈推進，不可用長時間 `sleep()` 阻塞。只在 `pairing_open=True` 時把 `pairing_remaining_s` 當成待配對倒數；已連線時，它不是強制斷線計時器。`ble_pairing_close()` 只關閉尚未連線的配對視窗，不會強制斷開既有控制器。

裝置名稱包含預設短尾碼，方便同教室辨識；自訂名稱在這個 Mango 執行期間生效，不會自動存 Flash。`ble_set_name()` 必須在 BLE 停止且沒有連線或廣播時使用；不要在已連線的程式中改名。

排錯順序：核對 target/Runtime → DM 的 BLE enabled → 配對按鈕是否為正確具名裝置 → 程式是否明確開配對 → Dabble 是否選對裝置 → 事件迴圈是否持續。註冊成功不代表名稱拼對或已啟用 BLE；例如把 `triangle` 拼錯，可能沒有立即例外，但收不到相符事件。BarePico 無外接配對按鈕時，先用最小手動配對範例；不要把 GP3 當作固定腳位。

## 7. 小挑戰

每秒讀一次 `ble_status()`，只在連線狀態改變時顯示提示；另顯示 `pairing_remaining_s`。比較「讀取狀態」與「開啟配對」的副作用，並說明為何每個主迴圈都重新呼叫 `ble_pairing_open()` 會破壞預期流程。

參數與回傳請看 [BLE API Reference](../reference/ble-control.md)。
