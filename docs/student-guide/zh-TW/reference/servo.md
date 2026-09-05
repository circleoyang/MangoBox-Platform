# Servo API Reference

工程導向參考。Servo capability 仍需由 target／mode／version resolver 判斷；named Servo 目前是 MangoX2 current contract，MangoLite 仍保留單一／default Servo learner path。

## 相容核心語法

以下語法可作為單 Servo / default Servo 的共同教學寫法：

```python
servo(angle) -> None
servo_set_angle(angle) -> None
servo_move_to(angle, step=5, period=60) -> None
servo_sweep(min_angle=0, max_angle=180, step=5, period=50) -> None
servo_stop() -> None
servo_get_angle()
servo_release() -> None
```

角度由 Student API 驗證；超出允許範圍會拋出 `ValueError`。`servo_sweep()` 亦要求 `min_angle < max_angle`。

## MangoX2 named Servo

MangoX2 current named-device contract 在上述方法增加可選的 `name`：

```python
servo(angle, name=None) -> None
servo_set_angle(angle, name=None) -> None
servo_move_to(angle, step=5, period=60, name=None) -> None
servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None) -> None
servo_stop(name=None) -> None
servo_get_angle(name=None)
servo_release(name=None) -> None
```

範例：

```python
from mangobox import Mango

m = Mango()
m.servo(30, name="arm")
m.servo_move_to(150, step=5, period=60, name="arm")
print(m.servo_get_angle(name="arm"))
m.servo_release(name="arm")
```

`name=None` 使用目前 default/current Servo，因此舊程式不需要修改。named instance 必須存在於目前 Runtime 的 Servo 設定中並處於可用狀態。

> MangoLite current profile 下請使用不帶 `name` 的共同語法；不要因為 MangoX2 已支援 named Servo，就假設 MangoLite 也已完成同一 named-device contract。

## Execution lifecycle

| API | High-Level MicroPython 行為 | `m.run_forever()` |
|---|---|---:|
| `servo()` / `servo_set_angle()` | Immediate，送至 local Runtime 並寫入目標位置 | 不需要 |
| `servo_get_angle()` | local Runtime reply path | 不需要 |
| `servo_release()` | Immediate | 不需要 |
| `servo_move_to()` | 後續步進由 Runtime / Scheduler 處理 | 需要持續服務 Scheduler |
| `servo_sweep()` | 持續 Runtime / Scheduler sweep | 需要 |
| `servo_stop()` | 停止指定／目前 Servo 的 sweep | 不需要 |

若要觀察完整漸進移動或持續 sweep，High-Level MicroPython 程式應保留 `m.run_forever()`。

## Configuration

MangoX2 current named-device 設定主要使用：

```text
enabled_modules.servo
servos
current_servo_setting
```

每個 named Servo 可包含自己的 `pin`、`min_angle`、`max_angle`、`min_us`、`max_us` 與 Enabled/Locked 狀態。舊的 scalar Servo keys 仍保留相容用途。

MangoLite 目前仍使用既有單 Servo 設定；實際 Pin 與角度/PWM 範圍以 Device Manager / Runtime config 為準。

## Availability

先用：

```python
m.supports("servo")
```

`True` 代表目前 learner API / target / config 可使用 Servo 語意，不代表實體 Servo 一定已正確接線或供電。

## Related

`servo()`, `servo_set_angle()`, `servo_move_to()`, `servo_sweep()`, `servo_stop()`, `servo_get_angle()`, `servo_release()`, `supports()`, `run_forever()`
