# Button API Reference

工程導向參考。實際可見內容應由 target／mode／version resolver 篩選。

## `read_button()`

```python
read_button() -> int | None
```

讀取板載 Button 的目前數位狀態。High Level MicroPython 內部等同於 `read_sensor("button")`。

### Returns

通常：

- `0`：released（放開）
- `1`：pressed（按下）
- `None`：尚未取得有效狀態的實作情境

## `on_pressed()`

```python
on_pressed(sensor: str, callback) -> None
```

註冊 sensor 由 released 轉為 pressed 時執行的 callback（回呼函式）。板載按鈕使用 `sensor="button"`。

## `on_released()`

```python
on_released(sensor: str, callback) -> None
```

註冊 sensor 由 pressed 轉為 released 時執行的 callback。

## `start_button()` / `stop_button()`

```python
start_button(period: int = 100) -> None
stop_button() -> None
```

啟動／停止 Button 的週期性監看。High Level MicroPython 使用 local Runtime bridge（本機 Runtime 橋接）與 Scheduler（排程器）。

## Execution lifecycle

| API | High Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `read_button()` | Immediate，直接讀取一次 | 不需要 |
| `on_pressed()` / `on_released()` | 只註冊 callback，不會自動開始 Button polling | 需要，而且還要先 `start_button()` |
| `start_button()` | 建立 Scheduler 週期監看工作 | 需要持續服務 Scheduler |
| `stop_button()` | 立即移除監看工作 | 不需要 |

這是目前 Button 與 IR／PIR／Light／Sound／Joystick callback 的重要差異：**Button callback 註冊後仍必須顯式呼叫 `start_button()` 或對應 `start_sensor()`。**

Host Python 的事件生命週期由 Host process（程序）、transport（傳輸方式）與目前 Host API 實作共同決定；線上文件必須依版本顯示正確模式，不能把裝置端 lifecycle 說明直接套到 Host。

## Availability

| Target | High Level MicroPython | Host Python |
|---|---:|---:|
| MangoX2 + Pico | 支援 | 支援（依 Host/Runtime 相容版本） |
| MangoX2 + Pico 2 W | 支援 | 支援（依 Host/Runtime 相容版本） |
| MangoLite + Pico 2 W | 支援 | 依 Host package/Runtime capability resolver |

## Configuration notes

固定板載 Button 與命名外接 Button 不應混為同一個接線假設。

外接 Button 可能還有：

- GPIO（General-Purpose Input/Output，通用輸入輸出）／Pin（腳位）
- pull-up / pull-down
- active level（有效電位）
- debounce（去彈跳）

診斷時應以 Device Manager 顯示的目前設定與真機接線為準。

## Example

```python
from mangobox import Mango

m = Mango()

def pressed():
    print("pressed")

m.on_pressed("button", pressed)
m.start_button(100)
m.run_forever()
```

## Related APIs

`read_sensor()`, `start_sensor()`, `stop_sensor()`, `when_pressed()`, `when_released()`, `run_forever()`
