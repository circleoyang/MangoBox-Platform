# Buzzer 蜂鳴器 — Host Python 使用指南

Host Python 會把蜂鳴器命令送給 MangoBox Runtime。單音、旋律與音效的實際播放都由 Runtime 執行。

## 30 秒快速測試

```python
from mangobox import Mango

m = Mango()
m.bee()
```

也可以播放指定音調：

```python
m.tone(880, 300)
```

## 播放旋律／音效

```python
m.play_song("twinkle_star")
m.play_sound("win")
```

Host Python 不需要靠 `m.run_forever()` 驅動旋律的每一個 note；`play_song()` 只是把旋律資料送給 Runtime，之後由 Runtime 自己播放。

> 若你的程式還要繼續做別的 PC-side 工作，可以照一般 Python 的流程往下寫；只有需要長時間等待硬體事件時，才需要用 `m.run_forever()` 或自己的主迴圈維持 process。

## 常用 API

```python
m.bee()
m.tone(880, 300)
m.play_song("twinkle_star")
m.play_sound("win")
m.stop_song()
```

## 如果沒有聲音

先確認：

```python
from mangobox import Mango

m = Mango()
print(m.supports("buzzer"))
print(m.capabilities())
```

接著在 Device Manager 檢查 Buzzer 是否 Enable、`buzzer_pin`、`buzzer_mode`，再確認真機的 Signal / VCC / GND 與主動式／被動式蜂鳴器類型。

如果 `bee()` 與 `tone()` 都完全沒有聲音，優先檢查硬體與設定，不要先懷疑 `run_forever()`。

完整函式資料請看 [Host Python Buzzer API Reference](../reference/buzzer.md)。
