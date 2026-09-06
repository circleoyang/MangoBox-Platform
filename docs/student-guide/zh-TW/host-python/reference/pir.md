# PIR Motion API Reference — Host Python

## `is_motion_detected()`

```python
m.is_motion_detected(sensor=None) -> bool
```

讀取目前 PIR motion 狀態。`sensor=None` 使用預設 PIR；回傳 `True` 只代表偵測到熱源變化／移動，不代表距離或人數。

## 事件

```python
m.on_motion_detected(callback, sensor=None, period=100)
m.on_motion_cleared(callback, sensor=None, period=100)
```

| 參數 | 說明 |
|---|---|
| `callback` | detected / cleared 邊緣事件執行的函式。 |
| `sensor` | 命名 PIR。 |
| `period` | Runtime 監看更新間隔（ms），預設 100。 |

```python
def detected():
    print("motion")

m.on_motion_detected(detected)
m.run_forever()
```

PIR 模組本身常有保持時間，因此 `cleared` 不一定等於人體停止移動的瞬間。

## Capability

```python
print(m.supports("motion"))
```

PIR 是否存在、名稱與 GPIO 由 target / Device Manager / Runtime config 管理。
