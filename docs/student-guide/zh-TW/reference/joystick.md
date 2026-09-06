# Joystick API Reference

## `joystick()`

```python
m.joystick(sensor=None)
```

一次讀取搖桿的 X 軸、Y 軸與按鍵狀態。

| 參數 | 預設值 | 說明 |
|---|---:|---|
| `sensor` | `None` | 命名 Joystick；省略時使用目前預設設定。 |

回傳結構依目前 Student API contract 包含 X、Y 與 switch / button 狀態。實際數值已由 Runtime 依裝置設定整理，學生程式不應自行假設固定 ADC Pin。

```python
value = m.joystick()
print(value)
```

## 使用方式

適合做：

- 方向控制
- 遊戲角色移動
- Servo 角度輸入
- 車體速度／方向控制

範例：先觀察目前 Runtime 回傳結構，再使用需要的欄位。

```python
from mangobox import Mango
import time

m = Mango()

while True:
    print(m.joystick())
    time.sleep(0.1)
```

## Named sensor

多顆 Joystick 的 X/Y ADC 與 switch Pin 由 Device Manager / Runtime config 命名與管理：

```python
m.joystick("controller1")
```

## 校準與中立點

搖桿的中心值與實際 ADC 範圍會受元件誤差影響。若目前 Runtime / Device Manager 提供 calibration，應使用該設定，不要在每一份學生程式各自硬編碼不同 center threshold。

## 相關 API

`joystick()`, `supports("joystick")`, `capabilities()`
