# PIR Motion API Reference — Host Python

## `is_motion_detected()`

```python
m.is_motion_detected() -> bool
```

同步取得目前 PIR motion 狀態。`True` 只表示偵測到熱源變化／移動，不代表距離、方向或人數。

## `on_motion_detected()`

```python
m.on_motion_detected(callback)
```

PIR 由未偵測轉為 active 時執行 callback。

## `on_motion_cleared()`

```python
m.on_motion_cleared(callback)
```

PIR 由 active 回到 inactive 時執行 callback。

PIR 模組本身常有保持時間，因此 `cleared` 不一定等於人體停止移動的瞬間。

## Host callback 生命週期

事件 watcher 由 Runtime 執行，Host 接收事件後派送 callback；**Host 程序／連線必須持續存活**。需要明確保持程式執行時，可在最後使用：

```python
m.run_forever()
```

## 範例

```python
from mangobox import Mango

m = Mango()

def detected():
    print("motion")

m.on_motion_detected(detected)
m.run_forever()
```

## Capability / 設定

```python
print(m.supports("motion"))
```

Runtime live config 的 `enabled_modules.pir_sensor` 必須啟用；GPIO 與實體模組設定由 target / Device Manager / Runtime config 管理。MangoLite 沒有固定板載 PIR，外接 PIR 必須依目前 capability 與設定判斷。

目前正式 Student API 不提供 named-PIR 參數。

## 相關 API

`is_motion_detected()`, `on_motion_detected()`, `on_motion_cleared()`, `supports("motion")`, `run_forever()`
