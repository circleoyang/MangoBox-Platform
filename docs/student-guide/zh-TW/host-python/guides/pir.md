# PIR 人體感測器 — Host Python 使用指南

Host Python 的 PIR API 使用 Runtime structured state reply 與 `motion_detected` / `motion_cleared` 事件，不直接從 PC 讀 GPIO。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
print('Motion supported =', m.supports('motion'))
while True:
    print(m.is_motion_detected())
    time.sleep(0.2)
```

## 事件方式

```python
from mangobox import Mango

m = Mango()
m.on_motion_detected(lambda: print('MOTION'))
m.on_motion_cleared(lambda: print('CLEAR'))
m.run_forever()
```

事件 monitor 由 Runtime 啟動；`is_motion_detected()` 則是同步 read，不必先啟動 streaming。

## 使用前注意

PIR 是 config-gated module。若目前 Runtime snapshot 中 `enabled_modules.pir_sensor=false`，Host API 會拒絕直接使用，避免設定檔停用時仍繞過 Runtime 讀硬體。

PIR 模組本身通常有 warm-up 與保持時間，剛上電時短暫變化不一定是程式錯誤。

完整函式資料請看 [Host Python PIR API Reference](../reference/pir.md)。
