# OLED API Reference

工程導向 Reference。學生入門請先看 [OLED 使用指南](../guides/oled.md)。

## `clear_oled()`

```python
clear_oled() -> None
```

清除 OLED 顯示內容。

## `text()`

```python
text(text, x=0, y=0, size=1) -> None
```

| 參數 | 型別 | 說明 |
|---|---|---|
| `text` | `str` | 要顯示的文字。High Level MicroPython 可使用 `\n` 分行。 |
| `x` | `int` | X 座標。 |
| `y` | `int` | Y 座標。 |
| `size` | `int` | 字型倍率。 |

## `flash_text()`

```python
flash_text(text, x=0, y=0, size=1, period=500, duration=0) -> None
```

啟動文字閃爍效果。

## Execution lifecycle

目前 High Level MicroPython 的 OLED 執行語意有 target 差異：

| Target / API | 現況 | `m.run_forever()` |
|---|---|---:|
| MangoLite + Pico 2 W `clear_oled()` / `text()`（Runtime 0.6.0-rc22） | 指令先進 OLED queue，由 Scheduler 處理 | **目前需要** |
| MangoX2 + Pico / Pico 2 W `clear_oled()` / `text()`（Runtime 0.2.6-rc10） | handler 使用 immediate 路徑 | 不需要 |
| `flash_text()` | 持續閃爍，由 Scheduler 更新 | 需要 |

為了讓同一份學生範例可跨硬體執行，目前 Guide 的靜態 OLED 範例暫時保留 `m.run_forever()`。

已核定後續 Runtime 工作：MangoLite 的靜態 `clear_oled()` 與 `text()` 要改成 immediate，與 MangoX2 統一。完成 build 與三條硬體路徑實機驗證後，本 Reference 與 Guide 才移除靜態 OLED 的暫時 `run_forever()` 要求。

`flash_text()` 不受這項調整影響，仍屬 Scheduler-driven。

## Availability

是否可用必須由 target、Programming Mode、版本、Runtime module enablement 與實際 Student API method 一起判定。MangoLite OLED 為選配；MangoX2 預設 profile 通常啟用 OLED。Host Python 不可只因 Runtime 有 OLED config key 就宣告支援。

## Configuration

```text
enabled_modules.oled
oled_i2c_id
oled_sda_pin
oled_scl_pin
oled_addr
oled_width
oled_height
```

## Related

`supports("oled")`, `clear_oled()`, `text()`, `flash_text()`, `run_forever()`
