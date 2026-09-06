# PIR Motion API Reference

PIR 用來偵測人體或其他熱源造成的紅外線變化；它不是距離感測器，也不能回傳「有幾個人」。只有目前 target / mode / version 確認提供 `motion` capability 時，才應顯示或使用本頁 API。

## `is_motion_detected()`

```python
m.is_motion_detected() -> bool
```

同步讀取目前 PIR 狀態。回傳 `True` 表示目前輸出處於 motion / detected 狀態，不代表系統知道物件距離、方向或人數。

```python
if m.is_motion_detected():
    print("motion")
```

## `on_motion_detected()`

```python
m.on_motion_detected(callback)
```

PIR 狀態由未偵測變為 detected 時執行 callback。

## `on_motion_cleared()`

```python
m.on_motion_cleared(callback)
```

PIR 狀態由 detected 回到 cleared 時執行 callback。

PIR callback 會自行啟動 watcher，不需要另外呼叫 `start_sensor()`；後續事件由 Scheduler 處理，因此 High-Level MicroPython 程式需維持 event loop。

> PIR 模組本身常有保持時間與靈敏度設定，因此 `cleared` 的時機不一定等於人體停止移動的瞬間。

## 範例：有人經過時亮燈

```python
from mangobox import Mango

m = Mango()

def detected():
    m.led_all("yellow")

def cleared():
    m.led_off()

m.on_motion_detected(detected)
m.on_motion_cleared(cleared)
m.run_forever()
```

## Availability / 設定

PIR 是否存在與 GPIO 由 target / Device Manager / Runtime config 管理。MangoLite **沒有把 PIR 當成固定板載元件**；外接 PIR 必須依目前設定判斷 capability。

目前正式 Student API 不提供 `is_motion_detected("name")` 或 callback 的 named-sensor 參數。

建議先檢查：

```python
print(m.supports("motion"))
```

## 相關 API

`is_motion_detected()`, `on_motion_detected()`, `on_motion_cleared()`, `supports("motion")`, `run_forever()`
