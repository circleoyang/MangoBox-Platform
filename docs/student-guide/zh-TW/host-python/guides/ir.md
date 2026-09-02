# IR 紅外線遙控器 — Host Python 使用指南

Host Python 透過目前 Runtime 的 structured JSON reply/event 路徑讀取 NEC 紅外線遙控器。MangoLite 是固定板載 GP22 IR；MangoX2 則是由 `enabled_modules.ir_sensor` 與 `ir_sensor_pin` 控制的選配外接模組。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
print('IR supported =', m.supports('ir'))
while True:
    print('OK =', m.is_ir_pressed('ok'))
    time.sleep(0.1)
```

可用 key：`1..9`、`0`、`*`、`#`、`up`、`down`、`left`、`right`、`ok`。

## 按下／放開事件

```python
from mangobox import Mango

m = Mango()

def pressed():
    print('OK pressed')

def released():
    print('OK released')

m.on_ir_pressed('ok', pressed)
m.on_ir_released('ok', released)
m.run_forever()
```

註冊 callback 時 Host 會要求 Runtime 啟動 IR monitor；事件由裝置端 NEC decoder 產生，Host 不重新解碼 pulse timing。

## MangoLite / MangoX2 差異

- MangoLite：固定板載 GP22 IR，不因舊的 `ir_sensor` 選配開關為 False 就消失。
- MangoX2：必須在目前 Runtime config 啟用 `ir_sensor`，否則 Host API 會拒絕使用。

## 如果按鍵沒反應

先看 `m.supports('ir')`，再到 Device Manager 確認 target、module enable 與 MangoX2 `ir_sensor_pin`。MangoLite 則確認固定 GP22 接收器與遙控器是否為 NEC protocol。

完整函式資料請看 [Host Python IR API Reference](../reference/ir.md)。
