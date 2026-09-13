# IR 紅外線遙控器使用指南

IR Remote 可以用遙控器控制 MangoBox，例如方向鍵、OK、數字鍵、`*` 與 `#`。目前 canonical profile 已在 MangoX2 / MangoLite 的 High-Level MicroPython 與 Host Python 提供 `ir` capability；實際硬體差異與模組啟用方式依板卡而不同。

## 先確認支援狀態

```python
from mangobox import Mango

m = Mango()
print(m.supports("ir"))
```

`True` 代表目前 target / mode profile 提供 IR Student API，但不代表外接模組一定接線正確。

## 按 OK 控制 LED

```python
from mangobox import Mango

m = Mango()

def ok_pressed():
    print("OK pressed")
    m.led_all("#00ff00")

def ok_released():
    print("OK released")
    m.led_off()

m.on_ir_pressed("ok", ok_pressed)
m.on_ir_released("ok", ok_released)

m.run_forever()
```

High-Level MicroPython 需要持續服務 Scheduler，因此 callback 範例通常以 `m.run_forever()` 作結。Host Python 則由 Host reader / dispatch 路徑接收 Runtime IR 事件，不應把 MicroPython 的 event-loop 要求直接套到 Host 程式。

## `is_ir_pressed()`

```python
if m.is_ir_pressed("up"):
    print("UP is held")
```

Host Python 的 `is_ir_pressed()` 會向 Runtime 讀取目前 IR state；High-Level MicroPython 版本則依 decoder 持續維護 held state。若在 MicroPython 自己寫 polling loop，必須讓 Scheduler 有機會更新，否則單次讀值不能代表 IR decoder 完整運作狀態。

## MangoLite 與 MangoX2 的硬體差異

### MangoLite

- 板載固定 IR receiver
- current baseline 使用 GP22
- Host / MicroPython Student API 都不需要學生自行建立 raw GPIO receiver

### MangoX2

- IR 為選配外接模組
- 需在 Runtime 設定中啟用 `ir_sensor`
- active GPIO 由 `ir_sensor_pin` 管理
- Host Python 與 High-Level MicroPython 都使用同一組 learner-facing key semantics

## 支援的標準按鍵

```text
1 2 3
4 5 6
7 8 9
* 0 #
up left ok right down
```

未知 key 會產生 `ValueError`；callback 不是 callable 時會產生 `TypeError`。MangoX2 IR 未啟用時，Student API 可能丟出 `RuntimeError`。

## IR 沒反應時的建議順序

1. 確認 `m.supports("ir")`。
2. MangoX2 確認 `ir_sensor` 已啟用、`ir_sensor_pin` 與接線一致。
3. MangoLite 確認板載 IR receiver 沒有被其他 raw GPIO/IRQ 程式占用。
4. 用最小 callback 範例測試，不要先混入 Motor / OLED / BLE。
5. 若仍沒有事件，再做 raw edge 診斷；raw edge 測試時不要同時啟動 Student API IR receiver。

## 小挑戰

使用方向鍵控制 RGB：

- `up`：紅色
- `down`：藍色
- `ok`：熄燈

## 進階閱讀

- [IR Remote API Reference](../reference/ir.md)
