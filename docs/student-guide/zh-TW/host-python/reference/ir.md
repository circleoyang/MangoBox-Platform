# IR Remote API Reference — Host Python

Host Python 的 IR learner path 必須由目前 Host package + Runtime compatibility resolver 確認；不能只因 Runtime config 有 IR Pin 就假設完整 API 可用。

## `on_ir_pressed()` / `on_ir_released()`

```python
m.on_ir_pressed(key, callback)
m.on_ir_released(key, callback)
```

| 參數 | 說明 |
|---|---|
| `key` | NEC teaching remote 的按鍵名稱，例如 `"ok"`, `"up"`, `"1"`, `"*"`。 |
| `callback` | 按下／放開事件時執行的 callable。 |

```python
def ok():
    print("OK")

m.on_ir_pressed("ok", ok)
m.run_forever()
```

Host process 必須持續接收 Runtime 事件，因此 callback 程式需要保持事件服務流程。

## `is_ir_pressed()`

```python
m.is_ir_pressed(key) -> bool
```

讀取 Runtime 維護的 held state。

## 標準 key

```text
1 2 3 4 5 6 7 8 9 * 0 # up left ok right down
```

## Capability

```python
print(m.supports("ir"))
```

MangoLite 的固定板載 IR 與 MangoX2 選配外接 IR 是不同硬體情境，線上文件以 target / resolver 顯示為準。
