# RGB LED API Reference

工程導向參考。實際可見內容應由 target／mode／version resolver 篩選。

## `led_all()`

```python
led_all(color: str = "#ffffff", duration: int = 0, strip: str | None = None) -> None
```

讓指定 LED Strip 的所有 LED 顯示相同顏色。

### Parameters

| 參數 | 型別 | 說明 |
|---|---|---|
| `color` | `str` | 支援顏色名稱或 `#RRGGBB`。 |
| `duration` | `int` | 傳給 Runtime 的持續時間參數；`0` 表示不設定自動結束時間。 |
| `strip` | `str | None` | 指定 LED Strip；`None` 使用目前預設 strip。 |

### Raises

`ValueError`：顏色字串不是支援名稱，也不是合法 `#RRGGBB`。

## `led()`

```python
led(index: int, color: str = "#ffffff", duration: int = 0, strip: str | None = None) -> None
```

控制指定 index 的單顆 LED。

## `led_range()`

```python
led_range(start: int, end: int, color: str = "#ffffff", duration: int = 0, strip: str | None = None) -> None
```

控制指定範圍的 LED。

## `led_off()`

```python
led_off(strip: str | None = None) -> None
```

停止目前 LED effect（燈效）並清除 LED。

## `brightness()`

```python
brightness(power: int = 30, duration: int = 0, strip: str | None = None) -> None
```

設定 LED brightness（亮度／功率比例）。

## `rainbow()` / `breath()`

```python
rainbow(period: int = 20, duration: int = 0, strip: str | None = None) -> None
breath(color: str = "#ff00ff", period: int = 50, duration: int = 0, strip: str | None = None) -> None
```

啟動高階燈效。實作由 Runtime Scheduler（排程器）處理，不要求學生自行寫 blocking loop（阻塞式迴圈）。

## Execution lifecycle

| API / 使用方式 | High Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `led()` / `led_all()` / `led_range()`，`duration=0` | Immediate，立即寫入 LED frame | 不需要 |
| `brightness(..., duration=0)` | Immediate | 不需要 |
| `led_off()` | Immediate，停止 effect 並清除 | 不需要 |
| 靜態 LED API 使用 `duration > 0` | 立即顯示，但之後恢復動作由 Scheduler 排程 | 需要，若要讓 timed restore 發生 |
| `rainbow()` / `breath()` | 持續 Scheduler effect | 需要 |
| meteor / color wipe / sparkle / fire flicker | 持續 Scheduler effect | 需要 |

因此「LED 能亮」和「燈效會持續動」是兩種不同測試。若靜態 `led_all()` 正常但動畫不動，優先檢查 event loop，而不是先懷疑 GPIO。

## Availability

| Target | High Level MicroPython | Host Python |
|---|---:|---:|
| MangoX2 + Pico | 支援 | 支援（依 Host/Runtime 相容版本） |
| MangoX2 + Pico 2 W | 支援 | 支援（依 Host/Runtime 相容版本） |
| MangoLite + Pico 2 W | 支援 | 依 Host package/Runtime capability resolver |

網站不得只依 config key 判斷可用性，必須同時確認 learner method（學生 API 方法）與 compatibility metadata（相容性資料）。

## Hardware/config notes

- MangoX2 板載 LED baseline 使用可設定的 LED Strip configuration；目前 default board strip 為 GP6、8 顆。
- MangoLite 板載 LED 是固定產品配置；目前 board strip 為 GP2、6 顆。
- 外接 strip 應以裝置目前設定為準，不要求學生死背 Pin（腳位）。

## Example

立即型：

```python
from mangobox import Mango

m = Mango()
m.led_all("#0088ff")
```

Scheduler 型：

```python
from mangobox import Mango

m = Mango()
m.rainbow()
m.run_forever()
```

## Related APIs

`select_led_strip()`, `led_show_one()`, `led_show_all()`, `led_show_range()`, `led_clear()`, `led_start_rainbow()`, `led_start_breathing()`, `run_forever()`
