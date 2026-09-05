# Servo API Reference — Host Python

適用：Host package `0.4.6` + 相容 Runtime。

## 共同單 Servo / default Servo 語法

```python
servo(angle) -> None
servo_set_angle(angle) -> None
servo_move_to(angle, step=5, period=60) -> None
servo_sweep(min_angle=0, max_angle=180, step=5, period=50) -> None
servo_stop() -> None
servo_get_angle() -> int | float | None
servo_release() -> None
```

角度會由 Student API 驗證；無效角度或 sweep 範圍會拋出 `ValueError`。

## MangoX2 named Servo

Host 0.4.6 的 MangoX2 current contract 支援可選 `name`：

```python
servo(angle, name=None) -> None
servo_set_angle(angle, name=None) -> None
servo_move_to(angle, step=5, period=60, name=None) -> None
servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None) -> None
servo_stop(name=None) -> None
servo_get_angle(name=None) -> int | float | None
servo_release(name=None) -> None
```

`name=None` 使用 default/current Servo。指定 `name` 時，Host 會把該名稱帶入 Servo Runtime command。

```python
from mangobox import Mango

m = Mango()
m.servo(90, name="arm")
print(m.servo_get_angle(name="arm"))
m.servo_release(name="arm")
```

MangoLite 目前仍使用既有單一／default Servo learner path；在 MangoLite profile 下請使用不帶 `name` 的共同語法。

## `servo_get_angle()` reply path

Host 0.4.6 送出 `get_angle`，等待 Runtime 的 `SERVO_ANGLE` 回覆。MangoX2 named Servo 使用對應名稱的 reply key；未收到有效新回覆時回傳 `None`。

## Execution lifecycle

`servo()`、`servo_move_to()`、`servo_sweep()` 都是 Host command。漸進移動與 sweep 的後續步進由 Runtime 處理，所以 Host 不需要以 `m.run_forever()` 作為 Servo motion engine。

`servo_get_angle()` 是有 timeout 的同步 reply path。

## Availability / configuration

先檢查：

```python
m.supports("servo")
```

MangoX2 current named-device 設定主要使用 `servos` 與 `current_servo_setting`；每個 instance 可有自己的 Pin、角度與 PWM 範圍。MangoLite 目前仍使用既有單 Servo 設定。

`supports("servo") == True` 代表 learner path 可用，不代表實體 Servo 已正確接線或供電。
