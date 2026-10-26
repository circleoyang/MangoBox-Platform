# DHT11：先選正確家族的教學與參考

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

DHT11 可讀取攝氏溫度與相對濕度。同樣的 `dht()` 在兩種家族都回傳 `(temperature, humidity)`，但初始化、失敗處理與事件 API 不同，因此必須依選定目標使用對應完整教學。

| 家族 | 初始化 | 失敗結果 | 事件方式 |
|---|---|---|---|
| MangoX2／MangoLite | 讀 DM 腳位，再明確 dht_attach | 保留舊值或 None，另查 dht_status | 用自己的 Scheduler 任務 |
| BarePico | DM 啟用／設定後直接 dht | 原始讀取錯誤向外拋出 | on_dht(callback, period) |

共同單位是 °C 與 %RH；至少間隔 2000 ms 才取得下一筆硬體量測，較快呼叫可能取得快取。DHT11 的讀值不是即時連續串流。

## 依目標繼續

- [MangoX2／MangoLite 完整指南](../../../carrier/zh-TW/guides/dht11.md) · [Reference](../../../carrier/zh-TW/reference/dht11.md)
- [BarePico 完整指南](../../../barepico/zh-TW/guides/dht11.md) · [Reference](../../../barepico/zh-TW/reference/dht11.md)

各指南含完整快速測試、預期觀察、門檻互動、配置檢查與小挑戰。本入口不混放家族專用可執行範例。Host 0.4.6 仍無這組板端 DHT facade；`dht11()`、`on_temperature_change()`、`on_humidity_change()` 不是本快照實作的方法，AI 不應自行生成。

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/mangolite-pico2w/firmware/mangolite/student_api_services.py`
- `runtime/common/peripherals/firmware_candidate/mb_dht11.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/rc6f_recovered/mb_dht/dht11.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
