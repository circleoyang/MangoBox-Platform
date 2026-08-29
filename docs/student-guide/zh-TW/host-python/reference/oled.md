# OLED API Reference — Host Python

適用：Host package `0.4.6` + 相容 Runtime。

## `clear_oled()`

```python
clear_oled() -> None
```

清除 OLED。

## `text()`

```python
text(text, x=0, y=0, size=1) -> None
```

Host 端會在需要時抽取／上傳中文字型 glyph，並支援 `\n` 多行文字。

## `flash_text()`

```python
flash_text(text, x=0, y=0, size=1, period=500, duration=0) -> None
```

## Execution lifecycle

Host OLED 與 High Level MicroPython 不同：

- 靜態 `text()` 會先處理 font upload，硬體模式使用 deferred `show_text` + render；
- Host 端 `threading.Timer` 會負責短暫的 deferred render 合併；
- `close()` 時也會 flush pending render；
- `flash_text()` 把持續效果交給 Runtime。

因此 Host 靜態 OLED 不需要 `m.run_forever()` 才顯示；Runtime 的 flashing 也不靠 Host event loop 驅動。

## Availability

使用 `m.supports("oled")` 與 compatibility profile 判定。MangoLite Host 的 OLED 可能是支援但目前裝置未 Enable，這兩種狀態不可混為一談。

## Configuration

```text
enabled_modules.oled
oled_i2c_id
oled_sda_pin
oled_scl_pin
oled_addr
```

Host 除錯以 Device Manager／Runtime configuration snapshot 為準，不使用 PC 端 `machine.I2C`。
