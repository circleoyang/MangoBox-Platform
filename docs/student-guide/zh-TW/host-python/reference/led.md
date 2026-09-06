# RGB LED API Reference — Host Python

適用：Host Python Student API + resolver 認可的相容 Runtime。方法名稱、顏色格式與主要參數語意與 High-Level MicroPython 對齊；差別是命令由 PC 傳給 Runtime，持續燈效由裝置端 Scheduler 執行。

```python
from mangobox import Mango
m = Mango()
```

## 常用 API

| API | 主要參數 | 功能 |
|---|---|---|
| `led(index, color="#ffffff", duration=0, strip=None)` | `index`, `color`, `duration`, `strip` | 單顆 LED |
| `led_all(color="#ffffff", duration=0, strip=None)` | `color`, `duration`, `strip` | 全部 LED |
| `led_range(start, end, color="#ffffff", duration=0, strip=None)` | `start`, `end`, `color`, `duration`, `strip` | 範圍 LED |
| `brightness(power=30, duration=0, strip=None)` | `power` 0..100 | 整體亮度 |
| `breath(color="#ff00ff", period=50, duration=0, strip=None)` | `color`, `period`, `duration` | 呼吸燈 |
| `rainbow(period=20, duration=0, strip=None)` | `period`, `duration` | 彩虹循環 |
| `led_off(strip=None)` | `strip` | 停止燈效並熄燈 |

`duration` 與 `period` 單位皆為 ms。`duration=0` 表示不設定自動停止／還原時間；`period` 是動畫更新間隔，不是完整一次循環時間。

## 呼吸燈

```python
m.breath("#0080ff", period=80)
```

完整名稱亦可使用：

```python
m.led_start_breathing(color="#ff00ff", period=50, duration=0, strip=None)
```

搜尋「呼吸燈、漸亮漸暗、breathing、pulse、fade」都應導向這個 API。

## 進階燈效

```python
m.led_start_meteor(color="#ffffff", size=5, period=50, duration=0, strip=None)
m.led_start_color_wipe(colors=None, period=50, duration=0, strip=None)
m.led_start_random_sparkle(color="#ffffff", period=50, duration=0, strip=None)
m.led_start_fire_flicker(color="#ff6600", period=50, duration=0, strip=None)
```

- `size`：流星拖尾長度。
- `colors`：顏色 list；省略時使用 Runtime 預設。
- `period`：更新間隔（ms）。
- `duration=0`：持續執行。

## 顏色

可使用支援的英文名稱，例如 `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`, `white`, `orange`, `pink`, `purple`，或 `#RRGGBB`。

格式不合法時可能拋出 `ValueError`。

## Host lifecycle

LED animation 由 Runtime Scheduler 執行，因此 Host 端不需要靠 `m.run_forever()` 驅動呼吸燈或彩虹燈本身。Host `run_forever()` 的用途是保持 PC process 存活與接收事件 callback。

```python
from mangobox import Mango

m = Mango()
m.breath("purple", period=80)
```

## 多燈條

```python
m.select_led_strip("external")
m.led_all("blue")
```

或在單次呼叫指定 `strip="external"`。

## Capability

```python
print(m.supports("led"))
```

是否支援以 Host package + Runtime compatibility profile 為準，不要僅因 config 裡有 LED Pin 就假設 API 一定可用。
