# 生命週期與能力查詢 API Reference

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 的介面與執行模式請依 Host profile 文件核對。

## 適用範圍與共同入口

以下是八個候選 **High-Level MicroPython** 目標的共同生命週期。此表只宣告本頁 API；不是硬體周邊或所有無線功能的支援表。

| 目標 ID | 家族 | 本頁共同入口 |
|---|---|---|
| `mangox2-pico` | MangoX2 | 支援 |
| `mangox2-picow` | MangoX2 | 支援 |
| `mangox2-pico2w` | MangoX2 | 支援 |
| `mangolite-picow` | MangoLite | 支援 |
| `mangolite-pico2w` | MangoLite | 支援 |
| `barepico-pico` | BarePico | 支援 |
| `barepico-picow` | BarePico | 支援 |
| `barepico-pico2w` | BarePico | 支援 |

共同建構形式為 `from mangobox import Mango` 後呼叫 `Mango()`。此處不把各家族的其他建構參數合併成跨板承諾。Host Python 0.4.6 的建構與生命週期應讀 Host 文件；本頁的巢狀 `config`／Scheduler 契約不套用到 Host。

## 簽章、參數與回傳

| 方法 | MangoX2／MangoLite | BarePico |
|---|---|---|
| `Mango()` | 建立板端 Mango 物件 | 建立獨立 BarePico 物件；建構不自動啟動外接 GPIO、UART、I²C 或無線 |
| `m.capabilities()` | `list[str]`，內容依能力表、已啟用配置與已安裝方法計算 | `dict`，精確欄位見下表 |
| `m.run_once()` | 無參數，推進一次，回傳 `None` | 無參數，回傳本輪執行到的 Scheduler callback 數 `int`；不是感測事件數 |
| `m.run_forever(sleep_ms=10)` | `sleep_ms` 為迴圈間隔，單位 ms；共同教材採預設值；退出時自動 `close()`；回傳 `None` | 不適用此帶參數簽章 |
| `m.run_forever()` | 使用預設間隔的共同形式 | 無參數，約每輪等待 10 ms；正常結束回傳 `None`；呼叫端需安排 `finally: close()` |
| `m.close()` | 無參數，清理服務並要求 Runtime reset；回傳 `None` | 無參數，清理已啟用服務、資源及 Scheduler；回傳 `None` |

Carrier 的間隔實作仍有差異：X2 callback-queue wrapper 會以 `int()` 轉換並把負值限制為 0；Lite 使用自身 `_sleep_ms()` 實作。不要依賴非法值的轉換或把它當作通用驗證介面。跨板程式直接用無參數 `run_forever()`。

`run_once()` 不會等待下一個任務到期，也不保證每個註冊的 callback 都被呼叫。`run_forever()` 為阻塞呼叫；它佔有主流程直到退出。不要把回傳值當作硬體成功證明。

## `capabilities()` 的精確差異

BarePico 回傳這些欄位：

| 欄位 | 型別／目前意義 |
|---|---|
| `carrier_board` | `None` |
| `target` | `str`，目前 target ID |
| `mcu_family` | `str`，該 profile 的 MCU 家族 |
| `wireless_capable` | `bool`，板型具有無線硬體；非連線狀態 |
| `has_carrier_led` | `False` |
| `has_carrier_button` | `False` |
| `has_carrier_motor` | `False` |
| `has_carrier_buzzer` | `False` |

Carrier 的 `list[str]` 是既有 capability catalog 的查詢結果，包含符合啟用條件的基礎模組及來源已安裝的擴充。它不是完整的方法列舉，也不是外接硬體自我檢測。不要將 BarePico dict 的鍵名解讀為 Carrier 模組名稱。

**`supports(capability)` 僅限 Carrier**：輸入能力名稱，經來源既有正規化／別名處理後回傳 `bool`。不在能力 catalog 的名稱可能回 False，即使另有獨立 facade。BarePico 沒有 `supports`；跨八板範例不應呼叫它，也不應自行補上假方法。

## 事件處理與資源生命週期

建立物件後，依模組規範完成配置與註冊。選 `run_forever()` 或前景 `run_once()` 其中一種。MangoX2 在 Scheduler 返回後還會清空由它管理的 callback 佇列；直接叫 Scheduler 不能取代完整的一輪。

Callback 的參數由各模組定義，並不全部相同；自訂 Scheduler callback 才是無參數。callback 應快速返回，不要遞迴進入主迴圈、長時間 sleep 或在同一堆疊內切換多個複雜服務。先記旗標，再在前景執行。

正常結束或例外路徑都應安排 `close()`。重複清理可作為防護，但 `None` 不是實體資源全部停止的回執；服務清理錯誤可能被印出或忽略。若音訊等功能需要先送停止命令與推進佇列，在前景迴圈中、關閉之前完成。不要在 `close()` 後繼續控制這個物件。

## 錯誤與日誌

- BarePico 的 `run_once()` 在關閉後拋 `RuntimeError("Mango is closed")`；Carrier 不提供相同的關閉後檢查契約。
- Carrier `run_forever()` 捕捉 Ctrl+C 並進入清理；BarePico 的 Ctrl+C 會傳給呼叫端。共同範例用 `finally`。
- 到期任務的普通 `Exception` 通常由 Scheduler 捕捉並印出；這不代表任務恢復正確，重複任務下次仍可能再出錯。初始化、主迴圈或其他路徑的錯誤仍可能向外傳播。
- 結構化事件標記為 `@@MANGO_EVENT@@`，由 Runtime 發出。學生不手動建立事件列，不印出整份 config、Wi-Fi 密碼或私人資料；逐幀／逐輪列印也不能當成有效驗證。
- 不承諾捕捉所有未處理例外，也不把每個普通錯誤輸出稱為 canonical `run_error`。

## 最小完整範例

本例使用 `run_forever()`，一秒一個簡短 callback；按 Ctrl+C 結束。若需要前景旗標處理，改讀 Guide 的 `run_once()` 範例。

```python
from mangobox import Mango

m = Mango()
task_id = None

def tick():
    print("One scheduled update")

try:
    task_id = m.scheduler.add_task(tick, period=1000)
    m.run_forever()
finally:
    if task_id is not None:
        m.scheduler.remove_task(task_id)
    m.close()
```

## 版本判讀與相關介面

| 證據 | 能證明什麼 |
|---|---|
| 本頁來源 SHA | 教材核對的是哪份程式來源 |
| 候選 profile 的韌體／overlay 資訊 | 生成時預期使用哪組板端實作 |
| MangoThonny 應用程式版本 | 電腦端工具版本；不能替代板端韌體資訊 |
| 指定板子實測紀錄 | 該測試條件下的實體結果；本頁語法檢查不提供這項證據 |

[生命週期 Guide](../guides/lifecycle.md) · [Scheduler Reference](scheduler.md) · [Runtime Config Reference](runtime-config.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_callback_queue.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_capabilities.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_pot.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api_ble_control.py`
- `runtime/barepico/firmware/barepico/student_ble_control_vnext.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
