# Obstacle 障礙物感測使用指南

Obstacle API 將數位障礙物感測器的 raw 訊號整理成 `blocked` / `clear` 語意，學生程式不需要自行處理 active-high / active-low 反轉。

> **適用範圍**：目前 canonical contract 在 **MangoX2 + Host Python** 與 **MangoX2 + High-Level MicroPython** 提供 `obstacle` capability。MangoLite 目前不宣告此 capability。

## 30 秒快速測試

先只測感測器，不要一開始就接馬達：

```python
from mangobox import Mango
import time

m = Mango()

while True:
    print(
        "blocked =", m.is_blocked(),
        "state =", m.block_state()
    )
    time.sleep(0.2)
```

移動物體靠近／離開感測器，確認狀態會在：

```text
blocked
clear
```

之間切換。

## 布林值或文字狀態

需要條件判斷時，可用：

```python
if m.is_blocked():
    print("前方有障礙")
```

需要顯示或記錄可讀狀態時，可用：

```python
print(m.block_state())
```

## 事件方式

若希望只有狀態改變時才執行，可以註冊 callback：

```python
from mangobox import Mango

m = Mango()

m.on_blocked(lambda: print("BLOCKED"))
m.on_clear(lambda: print("CLEAR"))

m.run_forever()
```

- `on_blocked()`：從 clear 進入 blocked 時觸發。
- `on_clear()`：從 blocked 回到 clear 時觸發。
- callback 不帶參數。
- Runtime 會先建立目前狀態 baseline，所以「註冊 callback」本身不應被當成一次狀態變化。

### Host Python 與 High-Level MicroPython 的生命週期

High-Level MicroPython 的事件範例需要讓 Scheduler 持續執行：

```python
m.run_forever()
```

Host Python 端 callback 由 Host runtime reader / dispatcher 接收事件；程式本身仍必須保持執行中，但不應把 `m.run_forever()` 視為 Host Python 的必要 API。

## 多個障礙物感測器

目前 MangoX2 contract 支援 named obstacle sensor。可由 Device Manager / Runtime configuration 建立名稱，例如 `left`、`right`：

```python
print(m.is_blocked("left"))
print(m.is_blocked("right"))
```

事件也可指定感測器：

```python
m.on_blocked(
    lambda: print("left blocked"),
    sensor="left"
)
```

若未指定名稱，Student API 使用預設 sensor `obstacle1`。

## 與 Motor / Drive 結合

先確認感測器穩定，再加入車體控制：

```python
from mangobox import Mango
import time

m = Mango()

while True:
    if m.is_blocked():
        m.stop()
        m.led_all("red")
    else:
        m.forward(25)
        m.led_all("green")
    time.sleep(0.05)
```

這只是最小教學範例。實際避障行為通常還會加入停車距離、轉向策略、多感測器或超音波測距。

## 如果狀態顛倒

若靠近物體反而顯示 `clear`，先依序檢查：

1. 模組的 active-low / active-high 設定。
2. Device Manager / Runtime configuration。
3. 感測器接線。
4. 模組上的靈敏度旋鈕。
5. 感測器安裝角度與反射物材質。

不要只在學生程式內把 `True / False` 反轉；active level 應由 Runtime / module configuration 統一處理。

## 重要限制：`clear` 不等於連線一定正常

目前 `is_blocked()` / `block_state()` 在沒有取得有效感測值時，會落成 `False` / `clear`，而不是拋出通訊例外。因此：

- `clear` 適合表示 Student API 的語意狀態。
- 不應單靠 `clear` 判斷感測器、UART 或 Runtime 一定工作正常。
- 若狀態長期不變，應另外檢查 capability、設定與實際輸入。

## 建議的除錯順序

1. 確認 `m.supports("obstacle")` 為 `True`。
2. 確認目前 target / mode 的 profile 支援 Obstacle。
3. 先用 `block_state()` 持續輸出，不接馬達。
4. 檢查 active level、接線與感測器靈敏度。
5. 若使用 named sensor，確認名稱與 Device Manager / Runtime config 一致。
6. 最後才加入 callback 或 Motor / Drive。

## 小挑戰

使用左右兩顆 named obstacle sensors：

- 左側 blocked：紅燈
- 右側 blocked：藍燈
- 左右皆 clear：綠燈

先只做燈號，再把相同邏輯延伸成車體轉向。

## 進階閱讀

- [Obstacle API Reference](../reference/obstacle.md)
- [Motor / Drive 使用指南](motor.md)
- [Ultrasonic 使用指南](ultrasonic.md)
