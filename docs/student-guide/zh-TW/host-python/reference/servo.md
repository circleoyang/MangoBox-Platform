# Servo API Reference — Host Python

適用：Host package `0.4.6` + 相容 Runtime。

## `servo()`

```python
servo(angle) -> None
```

角度必須在 0～180；無效角度會拋出 `ValueError`。

## `servo_move_to()`

```python
servo_move_to(angle, step=5, period=60) -> None
```

## `servo_sweep()`

```python
servo_sweep(min_angle=0, max_angle=180, step=5, period=50) -> None
```

無效範圍會拋出 `ValueError`。

## `servo_stop()` / `servo_release()`

```python
servo_stop() -> None
servo_release() -> None
```

`servo_stop()` 停止 sweep；`servo_release()` 停止 PWM 輸出。

## `servo_get_angle()`

```python
servo_get_angle() -> int | float | None
```

Host 0.4.6 送出 `get_angle`，等待 Runtime 的 `SERVO_ANGLE` 回覆。未收到有效新回覆時回傳 `None`。

## Execution lifecycle

`servo()`、`servo_move_to()`、`servo_sweep()` 都是 Host command。漸進移動與 sweep 的後續步進由 Runtime 處理，所以不需要 Host `m.run_forever()` 來驅動。

`servo_get_angle()` 是同步 reply path，最多等待 Host parity layer 的 timeout。

## Availability

Servo 是 configurable capability。使用 `m.supports("servo")`，並確認 Device Manager 中模組 Enable、`servo_pin` 與角度／PWM 設定。
