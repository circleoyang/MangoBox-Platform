# Obstacle API Reference — Host Python

> **Availability**：目前 `obstacle` capability 只在 MangoX2 Host Python profiles 中提供。MangoLite Host profile 目前不宣告此 capability。

## `is_blocked()`

```python
m.is_blocked(sensor=None) -> bool
```

同步讀取指定 obstacle sensor；未指定名稱時使用預設 `obstacle1`。

## `block_state()`

```python
m.block_state(sensor=None) -> str
```

回傳 `"blocked"` 或 `"clear"`。

目前同步讀取若沒有取得有效值，可能形成 `False` / `clear` fallback，因此不要把 `clear` 當成 transport / wiring 健康檢查。

## `on_blocked()`

```python
m.on_blocked(callback, sensor=None, period=20)
```

狀態由 clear 轉入 blocked 時執行 callback。

## `on_clear()`

```python
m.on_clear(callback, sensor=None, period=20)
```

狀態由 blocked 轉入 clear 時執行 callback。

| 參數 | 說明 |
|---|---|
| `callback` | 必須為 callable。 |
| `sensor` | 命名感測器；`None` 使用 `obstacle1`。 |
| `period` | 請求監看週期（ms）；目前 command path 最小值為 10 ms。 |

## Host lifecycle

Host callback 由背景 reader / dispatch 接收 Runtime event，不需要 MicroPython 的 `m.run_forever()`。Python process 本身必須持續執行。

註冊 monitor 前會先讀取 current state 作為 baseline，因此註冊本身不會造成一次假的 transition callback。

## Configuration

多裝置名稱、Pin 與 active level 由 Runtime / Device Manager 管理。若狀態顛倒，應修正設定／接線，不要在每份學生程式自行反轉結果。

## 相關 API

`is_blocked()`, `block_state()`, `on_blocked()`, `on_clear()`, `supports("obstacle")`
