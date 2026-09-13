# IR Remote API Reference — Host Python

> **Availability**：目前 MangoThonny Host 0.4.6 已提供完整 IR Student API。MangoLite 使用固定板載 IR；MangoX2 使用選配外接 IR，live Runtime config 未啟用時會拒絕使用。

## `is_ir_pressed()`

```python
m.is_ir_pressed(key) -> bool
```

同步向 Runtime 讀取目前 IR state，當指定 key 正處於 pressed / held 狀態時回傳 `True`。

未知 key 會丟出 `ValueError`。

## `on_ir_pressed()`

```python
m.on_ir_pressed(key, callback)
```

指定 NEC key 進入 pressed 狀態時執行 callback。

## `on_ir_released()`

```python
m.on_ir_released(key, callback)
```

指定 key 進入 released 狀態時執行 callback。

callback 不是 callable 時會丟出 `TypeError`。

## Host lifecycle

Host IR callback 由背景 reader / dispatch 路徑接收 Runtime event。註冊 callback 後，Host 會要求 Runtime 啟動 IR monitor；Host 不需要為 IR callback 額外執行 MicroPython 的 `m.run_forever()`。

Python process 本身仍必須保持存活，例如：

```python
from mangobox import Mango
import time

m = Mango()
m.on_ir_pressed("ok", lambda: print("OK"))

while True:
    time.sleep(1)
```

## 標準 key

```text
1 2 3 4 5 6 7 8 9 * 0 # up left ok right down
```

名稱會正規化為小寫。

## Target gate

### MangoLite

固定板載 IR 不以 `enabled_modules.ir_sensor` 作為可用性 gate。

### MangoX2

若 live Runtime snapshot 顯示 `ir_sensor=false`，Host API 會丟出 `RuntimeError`。active GPIO 由 `ir_sensor_pin` 管理。

## 相關 API

`is_ir_pressed()`, `on_ir_pressed()`, `on_ir_released()`, `supports("ir")`
