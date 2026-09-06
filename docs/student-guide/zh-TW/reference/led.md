# RGB LED API Reference

適用於 MangoBox High-Level MicroPython Student API。以下名稱與預設值依目前 Runtime 公開介面整理；一般學生建議優先使用短名稱 `led()`、`led_all()`、`led_range()`、`brightness()`、`rainbow()`、`breath()`、`led_off()`。

```python
from mangobox import Mango
m = Mango()
```

## 快速索引

| 想做什麼 | 建議 API |
|---|---|
| 點亮一顆 LED | `led()` |
| 全部顯示同一顏色 | `led_all()` |
| 點亮一段範圍 | `led_range()` |
| 調整亮度 | `brightness()` |
| 彩虹循環 | `rainbow()` |
| 呼吸燈／漸亮漸暗 | `breath()` / `led_start_breathing()` |
| 流星拖尾 | `led_start_meteor()` |
| 逐顆擦入顏色 | `led_start_color_wipe()` |
| 隨機星光閃爍 | `led_start_random_sparkle()` |
| 火焰閃爍 | `led_start_fire_flicker()` |
| 停止燈效並熄燈 | `led_off()` |

## 共用參數

| 參數 | 型別 | 預設值 | 說明 |
|---|---|---:|---|
| `color` | `str` | 視 API 而定 | 支援顏色名稱或 `#RRGGBB`，例如 `"red"`、`"#0080ff"`。 |
| `duration` | `int` | `0` | 單位 ms。`0` 代表不設定自動停止／還原時間，不是「執行 0 ms」。 |
| `period` | `int` | 視 API 而定 | 動畫更新間隔，單位 ms；通常越小越快。它不是完整一次動畫循環的時間。 |
| `strip` | `str | None` | `None` | 指定 LED strip 名稱。省略時使用目前預設 strip。 |

目前 Student API 支援的顏色名稱包含：`red`、`green`、`blue`、`yellow`、`cyan`、`magenta`、`white`、`orange`、`pink`、`purple`、`black`、`off`。其他顏色請使用 `#RRGGBB`。

---

## `led()` — 單顆 LED

```python
m.led(index, color="#ffffff", duration=0, strip=None)
```

設定指定索引的 LED 顏色。

| 參數 | 說明 |
|---|---|
| `index` | LED 索引，從 `0` 開始。 |
| `color` | 顏色名稱或 `#RRGGBB`。 |
| `duration` | 顯示多久（ms）；`0` 表示不自動還原。 |
| `strip` | LED strip 名稱；通常可省略。 |

```python
m.led(0, "red")
m.led(3, "#0080ff", duration=1000)
```

`duration` 到期時 Runtime 會回復該 LED 先前的 frame 狀態。

## `led_all()` — 全部 LED

```python
m.led_all(color="#ffffff", duration=0, strip=None)
```

把指定燈條全部 LED 設成同一顏色。

```python
m.led_all("green")
m.led_all("#ff6600", duration=2000)
```

## `led_range()` — 一段範圍

```python
m.led_range(start, end, color="#ffffff", duration=0, strip=None)
```

設定 `start` 到 `end` 範圍內的 LED。Runtime 會處理範圍邊界；`start > end` 時會交換順序。

```python
m.led_range(1, 4, "blue")
```

## `brightness()` — 整體亮度

```python
m.brightness(power=30, duration=0, strip=None)
```

| 參數 | 說明 |
|---|---|
| `power` | 亮度百分比，Runtime 實際限制為 `0..100`。 |
| `duration` | 暫時使用此亮度的時間（ms）；設定後到期會恢復先前亮度。 |

```python
m.brightness(20)
m.brightness(100, duration=1000)
```

---

## `breath()` / `led_start_breathing()` — 呼吸燈

```python
m.breath(color="#ff00ff", period=50, duration=0, strip=None)
m.led_start_breathing(color="#ff00ff", period=50, duration=0, strip=None)
```

讓整條 RGB LED 持續漸亮、漸暗。兩個方法對應同一種效果；`breath()` 是學生較容易記憶的短名稱。

| 參數 | 型別 | 預設值 | 說明 |
|---|---|---:|---|
| `color` | `str` | `"#ff00ff"` | 呼吸燈顏色。 |
| `period` | `int` | `50` | 每次更新亮度的間隔（ms）。不是一次完整呼吸週期。 |
| `duration` | `int` | `0` | 效果持續時間（ms）；`0` 表示持續執行。 |
| `strip` | `str | None` | `None` | 要控制的燈條。 |

```python
m.breath("#0080ff", period=100)
```

較大的 `period` 會讓亮度更新較慢。RGB Runtime 排程的實際最小更新間隔為 20 ms，因此把 `period` 設得更小不會得到低於 20 ms 的更新週期。

如果 `duration=0`，效果會持續執行。要確實停止效果並熄燈：

```python
m.led_off()
```

> `duration` 到期代表停止呼吸動畫更新，不應理解為「時間到後一定自動熄燈」。

---

## `rainbow()` / `led_start_rainbow()` — 彩虹循環

```python
m.rainbow(period=20, duration=0, strip=None)
m.led_start_rainbow(period=20, duration=0, strip=None)
```

讓各顆 LED 依序顯示不同色相並持續移動。

```python
m.rainbow(period=40)
```

`period` 為畫面更新間隔（ms），數值越小通常越快。

## `led_start_meteor()` — 流星拖尾

```python
m.led_start_meteor(color="#ffffff", size=5, period=50, duration=0, strip=None)
```

| 參數 | 說明 |
|---|---|
| `color` | 流星主色。 |
| `size` | 拖尾包含的 LED 數量；至少會產生 1 顆。 |
| `period` | 流星往前移動一次的間隔（ms）。 |
| `duration` | 自動停止時間（ms）；`0` 表示持續。 |

```python
m.led_start_meteor("cyan", size=4, period=80)
```

## `led_start_color_wipe()` — 逐顆擦色

```python
m.led_start_color_wipe(colors=None, period=50, duration=0, strip=None)
```

`colors` 為顏色清單。省略時預設使用 `red → green → blue`。

```python
m.led_start_color_wipe(["red", "yellow", "blue"], period=100)
```

## `led_start_random_sparkle()` — 隨機星光

```python
m.led_start_random_sparkle(color="#ffffff", period=50, duration=0, strip=None)
```

每次更新隨機選一顆 LED 閃一下，適合星光、雪花或粒子感效果。

```python
m.led_start_random_sparkle("white", period=120)
```

## `led_start_fire_flicker()` — 火焰閃爍

```python
m.led_start_fire_flicker(color="#ff6600", period=50, duration=0, strip=None)
```

以指定基準色隨機改變 RGB 強度，產生類似火光／燭光的不規則閃爍。

```python
m.led_start_fire_flicker("#ff6600", period=70)
```

## `led_off()` — 停止並熄燈

```python
m.led_off(strip=None)
```

停止目前 strip 的燈效，並清空 LED frame。若只是啟動了持續燈效，通常用這個方法收尾最明確。

## `select_led_strip()` — 多燈條選擇

```python
m.select_led_strip(strip=None) -> str
```

設定後續 LED API 的預設 strip。`None` 或空字串會回到 `"board"`。

```python
m.select_led_strip("external")
m.led_all("blue")
```

## 完整範例：按鈕切換呼吸燈與彩虹燈

```python
from mangobox import Mango

m = Mango()
mode = 0

def pressed():
    global mode
    mode = (mode + 1) % 3
    if mode == 0:
        m.led_off()
    elif mode == 1:
        m.breath("#0080ff", period=70)
    else:
        m.rainbow(period=30)

m.on_pressed("button", pressed)
m.start_button()
m.run_forever()
```

## 常見問題

**搜尋「呼吸燈」應該用哪個 API？** 直接使用 `m.breath(...)`；完整名稱為 `m.led_start_breathing(...)`。

**`period=1000` 是否表示一秒完成一次呼吸？** 不是。`period` 是每次動畫更新的間隔。

**`duration=0` 是否表示不執行？** 不是。對持續燈效來說代表不設定自動停止時間。

**一定要填 `strip` 嗎？** 一般不用。只有多組 LED strip 時才需要指定。

## 相關 API

`led()`, `led_all()`, `led_range()`, `brightness()`, `breath()`, `rainbow()`, `led_start_meteor()`, `led_start_color_wipe()`, `led_start_random_sparkle()`, `led_start_fire_flicker()`, `led_off()`, `select_led_strip()`
