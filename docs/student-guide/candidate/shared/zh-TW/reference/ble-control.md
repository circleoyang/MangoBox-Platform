# BLE／Dabble API Reference（候選來源）

適用：MangoLite 0.6.5-rc2 與 BarePico 0.1.0-rc6 的 Pico W／Pico 2 W，高層 MicroPython。MangoX2、普通 Pico 與 Host Python 不在本頁支援範圍。接收控制事件與開啟配對需要 DM 啟用 BLE；狀態與名稱查詢可以回報停用的服務，是否有控制器連線則是另一個執行時狀態。

## 事件註冊

| 簽章 | 參數與回呼 | 回傳／錯誤 |
| --- | --- | --- |
| `m.on_control(control, action, callback, controller="primary")` | control 為控制名稱字串；action 為 `press`、`release`、`value`；callback 必須可呼叫 | 回傳 callback；空白 control 或錯誤 action 拋 `ValueError`，不可呼叫拋 `TypeError`；其他設定／初始化錯誤依家族路徑回報 |
| `m.on_control_pressed(control, callback, controller="primary")` | `press` 捷徑，按鍵 callback 建議零參數 | 回傳 callback，錯誤同上 |
| `m.on_control_released(control, callback, controller="primary")` | `release` 捷徑，按鍵 callback 建議零參數 | 回傳 callback，錯誤同上 |
| `m.on_control_joystick(callback, controller="primary")` | Dabble 搖桿 callback 為 `(angle, radius)`；角度以15度階段、radius 0～7；零半徑為中央 | 回傳 callback，錯誤同上 |

同一個 `(controller, control, action)` 再註冊會替換前一個 callback。現在只有 primary 控制器；填別的字串不會建立另一個實體連線。非搖桿事件底層有相容派送，但入門範例固定用零參數，避免錯把 callback 內的 `TypeError` 當作簽章切換。

Digital Gamepad 名稱為 `start`、`select`、`triangle`、`circle`、`cross`、`square`、`up`、`down`、`left`、`right`；搖桿使用 `on_control_joystick()`。名稱會轉為字串、去除前後空白並轉小寫，並沒有檢查完整控制名稱白名單，因此拼錯的非空名稱可能註冊成功卻永遠收不到事件。

DM 停用時兩家行為不同：BarePico 的事件註冊會撤回該次 callback 並拋 `RuntimeError`；MangoLite 可先登錄 callback，但沒有啟用的服務可派送事件。兩家 `ble_pairing_open()` 都會拒絕停用的 BLE。請用 `ble_status()["enabled"]` 檢查狀態，不以註冊是否成功推論。

```python
from mangobox import Mango

m = Mango()

def moved(angle, radius):
    print(angle, radius)

m.on_control_joystick(moved)
m.ble_pairing_open(60)
try:
    m.run_forever()
finally:
    m.close()
```

上例 print 是短期觀察，不應加成逐封包研究 log。實際作品的 callback 應短小，複雜模式切換在 `run_once()` 返回後執行。

## 名稱與連線查詢

| 簽章 | 回傳與副作用 |
| --- | --- |
| `m.control_name()` | `str`，實際 BLE 名稱；建立延後初始化的觀察服務，不主動開廣播 |
| `m.ble_name()` | `control_name()` 的同義入口 |
| `m.control_connected()` | `bool`，primary 控制器目前是否連線 |
| `m.ble_status()` | `dict`：enabled、connected、advertising、pairing_open、pairing_remaining_s、state、name；不自動配對 |
| `m.ble_set_name(name=None)` | 回傳有效名稱 `str`；None 還原 UID 衍生預設名；去除前後空白後為非空字串、最多20個 UTF-8 bytes；只改本次RAM設定 |

`ble_set_name()` 只在 runtime stopped／disabled、沒有連線或廣播時允許；否則 `RuntimeError`。名稱不合法為 `ValueError`。20 bytes 不等於20個中文字，請用短名稱。名稱查詢仍依 target 的無線能力與 DM 設定檢查，不是完全無狀態的全域函式。

查詢可建立延後初始化的 Runtime 與 Scheduler 工作。MangoLite 會沿用板載按鈕、RGB、蜂鳴器作為配對介面；BarePico 若設定具名配對按鈕，會沿用並視需要開始其輸入輪詢。這些都不等於自動開始藍牙廣播。`pairing_remaining_s` 在已連線狀態也可能保留數值，應搭配 `pairing_open` 解讀，不能當作連線即將被中止的期限。

## 配對視窗

| 簽章 | 參數／回傳 | 行為與限制 |
| --- | --- | --- |
| `m.ble_pairing_open(seconds=60)` | seconds 必須是 int 1～120；回傳是否成功開啟的 bool | 明確廣播/配對動作；DM停用會拒絕；需要事件迴圈推進倒數 |
| `m.ble_pairing_close()` | 無參數；回傳 bool | 只關未連線的視窗；已連線或不在配對狀態回傳False，不強制踢掉控制器 |

MangoLite 保留 GP3 長按7秒提示、10秒開啟的既有流程。BarePico 的 `ble_control.pairing_button` 參照 DM 的具名按鈕，沿用該按鈕 active／pull／debounce；None 表示只使用手動 API，不綁定 GP3。這是設定規則，不存在 `ble_open_pairing(button=...)` 這個新方法。

## 生命週期、記錄與相關方法

`run_forever()` 或持續 `run_once()` 驅動 BLE runtime，`close()` 關閉這個 Mango 所持有的服務。不要在 callback 中再次呼叫 `run_once()`，也不要用 `scheduler.clear()` 清掉所有模組工作。

有意義的按下／放開、連線／斷線可形成既有 `@@MANGO_EVENT@@` 事件；不得手動偽造 marker 或逐筆記錄原始搖桿封包。狀態查詢不應被改成每次都新增研究事件。

相關：`on_control()`、`ble_status()`、`ble_pairing_open()`、`run_once()`、`run_forever()`、[BLE 使用指南](../guides/ble-control.md)。文件檢查通過不代表手機配對、無線共存或每個實體板型已驗收。
