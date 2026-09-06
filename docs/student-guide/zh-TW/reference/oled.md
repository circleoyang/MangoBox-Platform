# OLED API Reference

```python
from mangobox import Mango
m = Mango()
```

## `text()`

```python
m.text(text, x=0, y=0, size=1)
```

在 OLED 顯示文字。High-Level MicroPython 的 `text()` 支援字串中的 `\n`，會自動分行送到 Runtime。

| 參數 | 型別 | 預設值 | 說明 |
|---|---|---:|---|
| `text` | 任意可轉字串值 | 必填 | 要顯示的文字。 |
| `x` | `int` | `0` | 左上角 X 座標。 |
| `y` | `int` | `0` | 左上角 Y 座標。 |
| `size` | `int` | `1` | 文字倍率。 |

```python
m.text("Hello", 0, 0)
m.text("Line 1\nLine 2", 0, 0, 1)
```

`text()` 不會自動清除既有畫面；需要乾淨畫面時先呼叫 `clear()`。

## `clear()` / `clear_oled()` / `clear_screen()`

```python
m.clear()
m.clear_oled()
m.clear_screen()
```

三者目前都用來清除整個 OLED。學生程式建議使用最短的 `clear()`。

```python
m.clear()
m.text("Ready", 0, 0)
```

## `flash_text()` / `start_flash_text()`

```python
m.flash_text(text, x=0, y=0, size=1, period=500, duration=0)
m.start_flash_text(text, x=0, y=0, size=1, period=500, duration=0)
```

讓文字週期顯示／隱藏，形成閃爍效果。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `text` | 必填 | 要閃爍的文字。 |
| `x` / `y` | `0` | 文字位置。 |
| `size` | `1` | 文字倍率。 |
| `period` | `500` | 閃爍更新間隔（ms）。 |
| `duration` | `0` | 效果時間（ms）；`0` 代表不自動停止。 |

```python
m.flash_text("WARNING", x=0, y=20, period=300, duration=5000)
m.run_forever()
```

持續效果需要 High-Level MicroPython Scheduler，因此程式必須維持 event loop。

## `send_text()`

```python
m.send_text(text, x=0, y=0, size=1)
```

較底層的單行文字送出方法。一般學生程式優先使用 `text()`，因為 `text()` 會處理多行字串。

## 影像 API 狀態

目前 Student API 類別內仍保留：

```python
m.show_image(...)
m.start_image_loop(...)
```

但目前 Runtime 會拋出 `NotImplementedError`，因此**線上教學不應把它們當成可用功能**。`stop_image_loop()` 為相容 Runtime 命令，但在目前影像功能未完成前不列為初學者建議 API。

## Execution lifecycle

| API | `m.run_forever()` |
|---|---:|
| `text()` / `clear()` | 不需要 |
| `flash_text()` | 需要 |

## 完整範例

```python
from mangobox import Mango

m = Mango()
m.clear()
m.text("MangoBox", 0, 0, 1)
m.flash_text("READY", 0, 24, 1, period=400)
m.run_forever()
```

## 相關 API

`text()`, `clear()`, `flash_text()`, `send_text()`, `run_forever()`
