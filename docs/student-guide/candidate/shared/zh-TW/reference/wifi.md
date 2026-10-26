# Wi-Fi API Reference

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## Availability 與初始化

六個 W／2 W 的候選 HLMP 目標共用以下簽章；兩個非無線 Pico 僅提供不支援狀態。MangoLite 沒有 Pico 非無線候選。`Mango()` 與 API 安裝不啟動無線；Host 0.4.6 不包含這組新 facade。

## `wifi_status()`

```python
state = m.wifi_status()
```

回傳 `dict`，不啟動無線、不掃描。共同鍵為 `supported: bool`、`connected: bool`、`active: bool`、`ipv4: str | None`、`state: str`、`status_code: int | None`、`student_owned: bool`。無線目標另有 `hostname_applied: bool`，表示可選 hostname 設定是否被驅動接受；它不是連線必要條件。

`state` 可為 `unsupported/off/connecting/connected/wrong_password/ap_not_found/disconnected`。驅動未知狀態不自動映射成功。查詢可能反映一次真正的狀態轉換事件，但同樣的重複查詢不逐次產生日誌。API 不回傳密碼。

## `wifi_connect()`

```python
result = m.wifi_connect(ssid=None, password=None, allow_open=False)
```

| 參數 | 型別／預設 | 契約 |
|---|---|---|
| `ssid` | `str | None`／`None` | 明確指定時為 1–32 UTF-8 bytes；不是 Python 字元數 |
| `password` | `str | None`／`None` | 密碼為 8–63 個可列印 ASCII 字元；不會保存至 Flash |
| `allow_open` | `bool`／`False` | 無密碼網路須明確 `True`；教學預設使用受保護網路 |

三參數維持預設時，讀 DM 最近儲存的 `wifi_profile.sta_ssid/sta_password`；缺真實密碼即拒絕。明確指定 `password` 卻沒給 SSID 也拒絕。回傳 `{"started": True, "connected": bool}`，表示提出要求；之後仍需查 `wifi_status()`。

`ValueError`：SSID／密碼格式錯誤或未明確允許無密碼網路。`RuntimeError`：非無線目標、缺配置、AP 已啟用、其他服務正在連線／已連線、本物件已有未結束連線要求。底層無線錯誤可能向外傳遞。不能在每個 loop tick 重複呼叫。

## `wifi_disconnect()`

```python
stopped = m.wifi_disconnect()
```

成功回傳 `True`。只斷開本 Mango 物件提出的 STA 連線，清除自身擁有權；不強制 `STA.active(False)`。非無線板或不是自身擁有者時拋 `RuntimeError`。因此它不是可任意關閉系統無線的 API。

## `wifi_name()` 與 `wifi_set_name()`

```python
name = m.wifi_name(mode="ap")
name = m.wifi_set_name(name=None, mode="ap")
```

| 參數 | 契約 |
|---|---|
| `mode` | `"ap"` 或 `"sta"`；預設 `"ap"` |
| `name` | 自訂字串；`None` 恢復裝置 UID 尾碼衍生的預設名稱 |

兩者回傳有效名稱 `str`。getter 不啟動網路；setter 只改目前物件的 RAM 覆寫，必須 STA、AP 都閒置，不儲存 Flash、不改路由器 SSID、不自動廣播。無線名稱限制依來源 validator；無效名稱／mode 為 `ValueError`，沒有 Wi-Fi 或介面不閒置為 `RuntimeError`。`wifi_name("sta")` 與 `wifi_connect(ssid=...)` 的 SSID 是兩件不同的事。

## `wifi_ap_status()`

```python
ap = m.wifi_ap_status()
```

回傳 `supported/active/student_owned` 布林與 `ssid`；無線目標另回傳 `ipv4: str | None`。`ssid` 是本物件計畫使用的名稱，不能單憑此值認定正在使用的 AP 屬於本物件。`student_owned` 另核對目前 AP 身分。查詢不啟動 AP，不回傳密碼。

## `wifi_ap_start()` 與 `wifi_ap_stop()`

```python
result = m.wifi_ap_start()
stopped = m.wifi_ap_stop()
```

start 使用 DM 已儲存的 AP 密碼，成功回傳 `{"started": True, "active": True, "ipv4": ...}`。前提為無線目標、STA/AP 閒置、沒有既有本物件 AP owner、合法名稱與密碼。違反前提為 `RuntimeError` 或配置 validator 錯誤；驅動失敗可能向外傳遞。

stop 成功為 `True`；只停止本 Mango 物件開啟、且身分仍符合的 AP。其他服務接管或本物件未啟動時拋 `RuntimeError`。AP 建立不安裝網頁、HTTP、PIN 或離線規則；這些由智慧互動控制台的獨立配置流程處理。

## Execution lifecycle

狀態讀取可立即使用。連線提出後由無線驅動進行，學生以有期限的主迴圈查看；同時讓 `run_once()` 或 `run_forever()` 維持其他模組。不要在 callback 內阻塞等網路，不要為了重試搶占 AP／STA。程式結束時，明確釋放本程式所建立的連線；不能推定 `close()` 會代為關閉所有無線服務。

## 範例與相關 API

[完整連線範例](../guides/wifi.md) · [Clock API Reference](clock.md)。本組沒有公開 `on_wifi_change()` facade；使用狀態變化比較，不能依舊規劃名稱臆造 callback API。

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/barepico/firmware/barepico/student_wifi_v2.py`
- `runtime/mangox2-pico/firmware/mangox2/student_wifi_v2.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_wifi_v2.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
