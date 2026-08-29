# RGB LED API Reference — Host Python

適用：Host package `0.4.6` + resolver 認可的相容 Runtime。

## `led_all()`

```python
led_all(color="#ffffff", duration=0, strip=None) -> None
```

控制指定 LED Strip 全部 LED。

## `led()` / `led_range()`

```python
led(index, color="#ffffff", duration=0, strip=None) -> None
led_range(start, end, color="#ffffff", duration=0, strip=None) -> None
```

## `brightness()`

```python
brightness(power=30, duration=0, strip=None) -> None
```

## `rainbow()` / `breath()`

```python
rainbow(period=20, duration=0, strip=None) -> None
breath(color="#ff00ff", period=50, duration=0, strip=None) -> None
```

## `led_off()`

```python
led_off(strip=None) -> None
```

## Execution lifecycle

Host API 呼叫會透過 `send_command()` 將命令送到 Runtime。持續燈效由 Runtime Scheduler 執行。

| API | Host `m.run_forever()` |
|---|---:|
| `led()` / `led_all()` / `led_range()` | 不需要 |
| `brightness()` | 不需要 |
| `rainbow()` / `breath()` / 其他燈效 | 不需要用它驅動燈效 |
| `led_off()` | 不需要 |

Host `run_forever()` 是保持 PC process 存活、接收事件的工具，不是 LED animation loop。

## Raises

顏色格式錯誤時可拋出 `ValueError`。

## Availability

以 `m.supports("led")` / `m.capabilities()` 與選定 Host + Runtime compatibility profile 為準。Runtime config key 不能單獨建立 API 支援。

## Configuration / diagnostics

Host 端不要使用 `machine.Pin`。Pin、LED 數量、Enable 狀態請以 Device Manager / Runtime configuration snapshot 為準。
