# IR 紅外線遙控器 — Host Python 使用指南

Host Python 透過目前 Runtime 的 structured JSON reply/event 路徑使用 NEC 紅外線遙控器。MangoLite 使用固定板載 GP22 IR；MangoX2 則使用由 `enabled_modules.ir_sensor` 與 `ir_sensor_pin` 管理的選配外接模組。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
print("IR supported =", m.supports("ir"))

while True:
    print("OK =", m.is_ir_pressed("ok"))
    time.sleep(0.1)
```

支援 key：`1..9`、`0`、`*`、`#`、`up`、`down`、`left`、`right`、`ok`。

## 按下／放開事件

```python
from mangobox import Mango
import time

m = Mango()

m.on_ir_pressed("ok", lambda: print("OK pressed"))
m.on_ir_released("ok", lambda: print("OK released"))

while True:
    time.sleep(1)
```

Host Python 的 callback 由背景 reader / dispatch 路徑接收 Runtime semantic event。**不需要為了 IR callback 額外呼叫 MicroPython 的 `m.run_forever()`**；只要 Host process 本身仍在執行即可。

裝置端 Runtime 負責 NEC pulse 解碼、repeat 與 released 判定；Host 不重新解碼 raw pulse timing。

## MangoLite / MangoX2 差異

- **MangoLite**：固定板載 GP22 IR，不因舊的 `enabled_modules.ir_sensor` 選配開關為 False 就消失。
- **MangoX2**：live Runtime config 必須啟用 `ir_sensor`，並由 `ir_sensor_pin` 決定外接 Signal GPIO。

## 常見問題

### `supports("ir")` 是 True，但按鍵沒反應

`supports()` 代表 Host Student API path 可用，不代表接線一定正常。MangoX2 應再確認 module enable、Pin、VCC/GND/Signal 與 receiver 方向。

### callback 沒有觸發

先確認 Host 程式沒有立刻結束，再確認 Runtime IR event 是否有進入。callback 不需要 `m.run_forever()`，但 Python process 必須保持存活。

## 進階閱讀

- [Host Python IR API Reference](../reference/ir.md)
