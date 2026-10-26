# BarePico 旋鈕、原始值與變化事件 — API Reference

> 候選來源：v0.1.0-rc6；BarePico Pico / Pico W / Pico 2 W；High-Level MicroPython。這是來源核對，未宣告本輪 Windows 或實機驗收通過。

## 啟用、板型與模式

DM 啟用 `enabled_modules.potentiometer`，在 `potentiometers` 中配置具名、已啟用的 ADC 輸入。`pin` 是 GP26/27/28；校正須 `0 <= raw_min < raw_max <= 65535`，`sample_count` 為 1–32，`invert` 為 bool。`supply_voltage` 是計算參考值，預設 3.3，有限值範圍 `0 < supply_voltage <= 60`；它不是允許對 Pico ADC 輸入這個電壓的承諾。

明確傳 `name` 最可靠。省略時使用 `current_pot_setting`；只有該鍵**不存在**才採來源預設 `pot1`，鍵存在但為 None 不會自動挑唯一裝置。範例會先解析配置，再明確傳入名稱。

## 方法、精確簽章與回傳

所有預設值以下列簽章為準；使用 `from mangobox import Mango` 與 `m = Mango()`。

| 簽章 | 用途 | 回傳 |
| --- | --- | --- |
| `m.on_pot_above(threshold, callback, hysteresis=2, period=100, name=None, invert=None)` | 監看往上跨越門檻。 | `None` |
| `m.on_pot_below(threshold, callback, hysteresis=2, period=100, name=None, invert=None)` | 監看往下跨越門檻。 | `None` |
| `m.on_pot_change(callback, threshold=2, period=100, name=None, invert=None)` | 監看達指定幅度的變化，含初次有效值。 | `None` |
| `m.pot(name=None, invert=None)` | 讀取校正後百分比。 | `int` 0–100 |
| `m.pot_raw(name=None)` | 讀取原始 ADC 值。 | `int` 0–65535 |
| `m.pot_voltage(name=None, supply=None)` | 換算為電壓。 | `float` 伏特 |
| `m.stop_pot(name=None)` | 取消指定旋鈕的全部監看。 | `None` |

## 參數型別、範圍與預設

| 參數 | 型別與規則 |
| --- | --- |
| `name` | DM 具名項目 `str` 或 None；名稱必須存在且啟用。 |
| `invert` | 教材使用 bool 或 None。`pot()` 會驗證此型別，None 採 DM；watcher 註冊目前不做同一嚴格檢查，不應依賴其他值的比較結果。 |
| `supply` | None 採 DM；否則轉 float 後須為有限的 `0 < supply <= 60`，單位 V，只作估算。 |
| `threshold` | change 轉 int 後 1–100；above/below 轉 int 後 0–100，單位均為百分點。 |
| `hysteresis` | 轉 int 後 0–100 百分點，預設 2。 |
| `period` | 嚴格整數 20–10000 ms（bool 不算）；同一旋鈕共用一個 watcher task，後註冊決定週期。 |
| `callback` | change 接收一個 int 百分比；above/below 無參數；必須 callable。 |

## 事件與生命週期

`pot()` 為校正／clamp／四捨五入後 0–100 的 int。`pot_raw()` 是 sample_count 次 ADC 讀值的平均整數，範圍 0–65535，不代表實體 ADC 有 16-bit 精度。`pot_voltage()` 先以校正的 raw_min/raw_max 算出 0–1 比例，再乘 supply 並 round 到四位小數；它不受 invert 影響，並非直接量得供電電壓。三個方法會分別採樣，不是原子快照。

change 在第一個排程有效值通知，之後比較**最後一次已通知值**，差值 `>= threshold` 才通知。above 初次只記錄是否 `< threshold`；武裝後讀值 `>= threshold` 通知，再等 `<= threshold - hysteresis` 重新武裝。below 對稱：初次 `> threshold`、通知 `<= threshold`、重武裝 `>= threshold + hysteresis`。初次不發 above/below 事件。零回差在恰等於門檻時可能反覆重新武裝，初學保留預設 2。

重註冊同方向會替換 callback 並重設其基準，其他方向共用該旋鈕的新週期。`stop_pot(name)` 取消此名稱全部 watchers，回傳 None，不是釋放 ADC 硬體。讀取及 watcher 都使用第一次建立的校正設定；配置變更需 close 並重建。

## 錯誤與排查順序

模組未啟用或已關閉為 `RuntimeError`；未知／停用名稱、非 ADC pin、門檻或週期錯誤會拒絕；callback 非 callable 為 `TypeError`。使用後更改 pin/校正等設定需關閉並重建 Mango，否則 `RuntimeError`，不會靜默重用舊 ADC 配置。

## 可獨立執行的最小範例

```python
from mangobox import Mango
import time

m = Mango()
try:
    modules = m.config.get("enabled_modules", {})
    if not isinstance(modules, dict) or not modules.get("potentiometer", False):
        raise RuntimeError("Enable potentiometer in Device Manager")
    group = m.config.get("potentiometers", {})
    if not isinstance(group, dict):
        raise ValueError("Check the configured potentiometers table")
    items = {key: value for key, value in group.items()
             if isinstance(value, dict) and value.get("enabled", False)}
    name = m.config.get("current_pot_setting")
    if name not in items:
        if len(items) != 1:
            raise ValueError("Select one enabled potentiometers entry in Device Manager")
        name = next(iter(items))
    spec = items[name]

    print("Pot:", name, "GPIO:", spec["pin"])
    print("Percent:", m.pot(name))
    print("Raw average:", m.pot_raw(name))
    print("Voltage estimate:", m.pot_voltage(name))
finally:
    m.close()
```

## 相關閱讀

[Guide](../guides/pot.md) · [Lifecycle](../../../shared/zh-TW/guides/lifecycle.md) · [Runtime Config](../../../shared/zh-TW/reference/runtime-config.md)

## 核對來源與驗證

- [runtime/barepico/firmware/barepico/core.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/core.py)
- [runtime/barepico/firmware/barepico/config.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/firmware/barepico/config.py)
- [runtime/mangox2-pico/firmware/mangox2/devices/pot.py](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/mangox2-pico/firmware/mangox2/devices/pot.py)
- [runtime/barepico/scripts/build_all_targets.ps1](https://github.com/circleoyang/MangoBox/blob/f875289b5698f0e61faf64196b1165a3b18f2bd5/runtime/barepico/scripts/build_all_targets.ps1)

核對來源 SHA `f875289b5698f0e61faf64196b1165a3b18f2bd5`。本頁例子只經語法與來源契約檢查；沒有在本輪宣告實機 PASS。
