# Obstacle API Reference

> **Availability**：目前 canonical contract 在 **MangoX2 + Host Python** 與 **MangoX2 + High-Level MicroPython** 提供 `obstacle` capability。MangoLite 目前不宣告此 capability。

Canonical import：

```python
from mangobox import Mango
m = Mango()
```

## `is_blocked()`

```python
m.is_blocked(sensor=None) -> bool
```

同步讀取指定障礙物感測器並回傳語意化布林值。

### Parameters

| 參數 | 型別 | 預設值 | 說明 |
|---|---|---:|---|
| `sensor` | str \| None | `None` | 命名感測器；省略時使用預設 `obstacle1`。 |

### Returns

- `True`：目前為 blocked。
- `False`：目前為 clear，或此次未取得有效值而落入目前 API 的 clear fallback。

```python
if m.is_blocked():
    m.stop()
```

> `False` 不應被當作 UART / Runtime / sensor 一定正常的健康檢查；它只代表目前 Student API 回傳的語意結果。

## `block_state()`

```python
m.block_state(sensor=None) -> str
```

以可讀字串回傳目前狀態：

```text
blocked
clear
```

### Parameters

與 `is_blocked()` 相同；`sensor=None` 使用 `obstacle1`。

### Returns

- `"blocked"`
- `"clear"`

目前實作在沒有取得有效值時也會落成 `"clear"`，因此 `clear` 不是連線診斷訊號。

## `on_blocked()`

```python
m.on_blocked(callback, sensor=None, period=20)
```

當狀態由 `clear` 轉成 `blocked` 時執行 callback。

### Parameters

| 參數 | 型別 | 預設值 | 說明 |
|---|---|---:|---|
| `callback` | callable | 必填 | 進入 blocked 時執行的函式；必須可呼叫。 |
| `sensor` | str \| None | `None` | 命名感測器；省略時使用 `obstacle1`。 |
| `period` | int | `20` | monitor 更新間隔，單位 ms；目前 Runtime command 最小送出值為 10 ms。 |

若 `callback` 不是 callable，會拋出 `TypeError`。

Callback 不帶參數：

```python
def blocked():
    print("BLOCKED")

m.on_blocked(blocked)
```

## `on_clear()`

```python
m.on_clear(callback, sensor=None, period=20)
```

當狀態由 `blocked` 回到 `clear` 時執行 callback。

參數與 `on_blocked()` 相同；callback 不帶參數，非 callable 會拋出 `TypeError`。

## Baseline 與 transition 行為

註冊 monitor 時會先讀取目前狀態作為 baseline，因此：

- 註冊 `on_blocked()` / `on_clear()` 本身不應立即製造一次事件。
- callback 只在後續狀態 transition 時觸發。
- 相同值持續重複輸入，不應反覆觸發相同 callback。

High-Level MicroPython 對同一 named sensor 的 blocked / clear callbacks 會共用 monitor；若後續要求更快的 `period`，Runtime 可以重啟成更快的 monitor。Host Python 端同樣會建立 Runtime monitor，但目前 Host adapter 的管理方式不應假設與 MicroPython 完全相同。

## Execution lifecycle

| API | Host Python | High-Level MicroPython |
|---|---|---|
| `is_blocked()` | 同步等待 Runtime read reply，最長約 0.8 s | 發送同步 read command 並使用目前 Runtime 回覆／快取狀態 |
| `block_state()` | 同上 | 同上 |
| `on_blocked()` / `on_clear()` | Host reader / callback dispatcher 接收事件；程式需保持執行 | Scheduler 處理 callback；事件程式需持續執行 |
| `m.run_forever()` | 不應視為 Host 必要 API | 標準事件程式結尾建議使用 |

High-Level MicroPython callback 範例：

```python
from mangobox import Mango

m = Mango()
m.on_blocked(lambda: print("BLOCKED"))
m.on_clear(lambda: print("CLEAR"))
m.run_forever()
```

Host Python 程式則只需要確保主程式沒有在註冊後立即結束。

## Named sensor

未指定名稱時，預設為：

```text
obstacle1
```

多顆障礙物感測器由 Device Manager / Runtime configuration 命名與管理。Student API 只用 `sensor="name"` 選擇：

```python
print(m.is_blocked("left"))
print(m.block_state("right"))
```

不要在每一份學生程式裡重建 GPIO driver 或自行交換 active level。

## Hardware / configuration notes

- Obstacle 通常是數位輸入模組，實際 active-high / active-low 由 Runtime / module configuration 統一管理。
- 感測距離會受到靈敏度旋鈕、物體材質、角度與環境光影響。
- 使用 named sensor 時，名稱必須與 Device Manager / Runtime config 一致。
- 使用前可先檢查：

```python
print(m.supports("obstacle"))
```

## 範例：障礙停車

```python
from mangobox import Mango

m = Mango()

def blocked():
    m.stop()
    m.led_all("red")

def clear():
    m.led_all("green")

m.on_blocked(blocked)
m.on_clear(clear)
m.forward(30)
m.run_forever()
```

此例適用 High-Level MicroPython 的事件生命週期。Host Python 使用相同 callback API 時，主程式需保持執行，不必依賴 `m.run_forever()`。

## Troubleshooting

### `block_state()` 一直是 `clear`

依序檢查 capability、模組啟用、named sensor 名稱、接線、active level、靈敏度旋鈕與實際輸入。不要只因為回傳 `clear` 就判斷 sensor 一定正常。

### callback 沒有觸發

確認狀態真的發生 transition。High-Level MicroPython 還要確認程式持續執行 Scheduler；Host Python 則確認主程式沒有立即結束。

### 狀態顛倒

先修正 Runtime / Device Manager 的 active-level 設定，不要在學生程式裡全面反轉 `True / False`。

## 相關 API

`is_blocked()`, `block_state()`, `on_blocked()`, `on_clear()`, `supports("obstacle")`, `run_forever()`, `stop()`, `forward()`
