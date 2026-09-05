# Motor / Drive 馬達與車體使用指南

Motor / Drive API 用來控制雙馬達底盤。MangoX2 與目前 MangoLite Runtime 都採相同的高階 Drive 語意；實際左右輪方向與補償參數由 Runtime 設定負責。

## 30 秒快速測試

```python
from mangobox import Mango
import time

m = Mango()
print('Drive supported =', m.supports('drive'))
m.forward(20)
time.sleep(0.5)
m.stop()
```

第一次測試建議先用 20～30 的低速並把車輪架空，確認左右輪方向正確後再落地。

## 常用移動

```python
m.forward(60)
m.backward(60)
m.pivot_left(50)
m.pivot_right(50)
m.spin_left(50)
m.spin_right(50)
m.arc_left(80, 50)
m.arc_right(80, 50)
m.stop()
```

`pivot_*` 與 `spin_*` 的轉向方式不同；教學時可以讓學生觀察兩種轉彎軌跡。

## Tank Drive

```python
m.drive_tank(left=60, right=40)
```

左右值範圍為 `-100..100`。負值代表反向。若 Runtime 已完成 drivetrain 校正，可依教學需求使用 `assist=True`。

## 單顆馬達

```python
m.motor_run('M1', 40)
m.motor_run('M2', -40)
m.motor_brake('M1')
m.motor_coast('M2')
```

可接受 `M1/M2`，並保留 `A/B`、`left/right` 別名。

## 安全停止

程式結束前優先使用 `m.stop()`。若需要讓馬達自由滑行，可用 `m.coast()`。

## 如果方向不對

不要先在學生程式中把正負號亂反轉。先到 Device Manager 檢查 Motor / Drive 的左右輪對應、方向與校正設定，讓底層設定與實體車體一致。

## 進階閱讀

- [Motor / Drive API Reference](../reference/motor.md)
- [Device Manager 基本操作](../tools/device-manager.md)
