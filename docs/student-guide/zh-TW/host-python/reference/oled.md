# OLED API Reference — Host Python

## `text()`

```python
m.text(text, x=0, y=0, size=1)
```

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `text` | 必填 | 要顯示的文字。 |
| `x` | `0` | X 座標。 |
| `y` | `0` | Y 座標。 |
| `size` | `1` | 文字倍率。 |

```python
m.clear()
m.text("Hello MangoBox", 0, 0, 1)
```

## `clear()` / `clear_oled()` / `clear_screen()`

```python
m.clear()
m.clear_oled()
m.clear_screen()
```

清除 OLED；學生程式建議使用最短的 `clear()`。

## `flash_text()`

```python
m.flash_text(text, x=0, y=0, size=1, period=500, duration=0)
```

`period` 為閃爍更新間隔 ms；`duration=0` 表示不設定自動停止時間。

```python
m.flash_text("READY", 0, 20, period=400, duration=5000)
```

持續效果由 Runtime Scheduler 執行，因此 Host 不需要靠 `m.run_forever()` 驅動 OLED animation 本身。

## 影像 API 狀態

目前 Runtime 的 `show_image()` / `start_image_loop()` 尚未形成可用的 current Student API，文件與搜尋不應把它們列成已完成教學功能。

## Capability

```python
print(m.supports("oled"))
```
