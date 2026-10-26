# DFPlayer 與語音 API Reference

> 候選 API 文件｜2026-10-26 原始碼快照｜僅適用選定候選 profile 的 High-Level MicroPython。本頁不是穩定版發布或跨八板實機驗收證明；Host Python 0.4.6 不宣告支援本頁新增介面。

## Availability、來源與初始化

本頁共同 beginner path 為八個候選 HLMP 目標的 `audio_begin/audio_volume/mp3/mp3_stop/speak/say`。每個目標仍需配置外接 DFPlayer。Host 0.4.6 不宣告新增 facade。Carrier 透過 RC6Original controller 委派；BarePico 會在初始化時動態安裝原始 Player／AudioManager 方法。

Audio v1.1、365 筆與分頁介面是另一個**實際 build overlay 條件**，不是「分支有檔案」就自動生效。本頁不將來源候選等同每個已裝 UF2。

## `audio_begin()`

```python
m.audio_begin()
```

回傳 `self`，使用 DM 配置 `enabled_modules.dfplayer`、`dfplayer_uart_no`、`dfplayer_tx_pin`、`dfplayer_rx_pin`、`dfplayer_busy_pin`。UART 為 0／1，TX/RX 需合法且不同，BUSY 可為 None。驗證既有 GPIO／UART 擁有者，只建立一個 Player；不寫 TF、Flash、不啟動網路。

未啟用、配置缺漏、已被其他 controller 使用時為 `RuntimeError`；GPIO 衝突可為 `ValueError`。同一個物件以同一份 DM 配置重複呼叫可重用；不能靠重新呼叫來偷偷切換 UART。`audio_begin()` 的成功不是喇叭實測。

## `audio_volume()`

```python
accepted = m.audio_volume(percent)
```

`percent` 必須為整數 0–100；bool 也拒絕。回傳接受的百分比整數，不是 raw 音量。內部換算到硬體 0–30。參數錯誤為 `ValueError`；未初始化為 `RuntimeError`。第一次或與上次已記錄值差至少 10 個百分點時才寫語意 log，不代表音量只會以 10% 改變。

## `mp3()` 與 `mp3_stop()`

| 家族 | 實際簽章 | 回傳 |
|---|---|---|
| Carrier | `m.mp3(index)` | 已接受時 True |
| BarePico | `m.mp3(track, loop=False, folder=None)` | 已接受時 True |
| 兩者停止 | `m.mp3_stop()` | None；停止命令進入 Player 佇列 |

共同寫法：

```python
m.mp3(1)
```

預設 `/MP3` 音樂編號範圍 1–9999；這不保證 TF 真的有該檔案。BarePico 額外 `folder` 為 1–99、folder track 為 1–255，`loop`／`folder` 不可帶進 Carrier 的共用 facade。錯誤編號為 `ValueError`；未初始化／資源問題可能為 `RuntimeError`，Bare 動態方法未安裝時也可能 AttributeError。

播放／停止為排程驅動命令，不應用回傳值當成 BUSY 或人耳的播放證據。`mp3_stop()` 停止 Player 的音樂／目前語音狀態，不承諾清除 AudioManager 中所有待播句子或通知規則；已有更高層排程時應按其擁有者流程停止。示範程式結束可關閉自己的 Mango，但不能接管其他服務的播放器。

## `speak()`

```python
accepted = m.speak(key_or_id, mode="auto")
```

| 參數 | 型別／預設 | 說明 |
|---|---|---|
| `key_or_id` | `str` 或正整數 | 曲庫中的 key 或邏輯語音 ID；不能傳 bool |
| `mode` | `str`／`"auto"` | `auto/queue/replace`；replace 僅在當前語音存在時取代／清理相應語音佇列 |

回傳 True 表示接受。鍵不存在可為 `KeyError`；錯誤型別 `TypeError`；ID／mode／catalog 格式錯誤 `ValueError`；沒有相符 Player 或高 ID 插播受限時 `RuntimeError`。`replace` 不代表可以繞過能力檢查。

Audio v1.1 可依 v2 catalog 將高 ID 語音映射至 folder 90／91；目前音樂播放中的 ID >255 ADVERT 仍明確拒絕，不會偷偷停背景音樂來假裝完成。語音包與曲庫均需同步一致，不手動把 `id` 截到 255 或以檔名猜索引。

## `say()`

Carrier 簽章為 `m.say(name, **kwargs)`，委派給既有 AudioManager；BarePico 為 `m.say(topic, temp=None, humi=None, priority="normal", replace=False, style="auto")`。第一個位置參數共用以下 topic：

| topic | 前提 |
|---|---|
| `time`／`date` | 同一 Mango 已有可信時間，曲庫含所需片段 |
| `weather` | 有有效溫度／濕度；未提供 temp 時可能讀取該家族的 DHT |
| `temp` | 有有效溫度 |
| `number` | 使用 `temp=<整數>` 指定要唸的數字，這是既有參數命名 |
| `welcome` | 曲庫有 `welcome_phrase` |

`priority` 為 `normal/high/alarm`；`replace` 為是否取代既有待播語句；`style` 為 `auto/legacy`。回傳本次組合的語音片段數 `int`，不是秒數或播放完成。佇列最多六句等待、每句 1–64 片段；缺片段、未接 BUSY 又沒有 duration 資料、無效參數為 `ValueError`，佇列已滿或時間不可信可為 `RuntimeError`。

從感測器播報時先在主流程取得新且有效的讀值，再將 `temp/humi` 傳入；Carrier 讀失敗可能保留舊值，因此不能只測 tuple 裡有數字就播放成「目前」溫度。

## 家族專用延伸與不應假設的別名

Carrier 額外 facade 有 `mp3_play/mp3_volume/mp3_status/audio_catalog/rc6_audio/mp3_attach`。BarePico 初始化後可能有 `mp3_info/mp3_busy/audio_status/audio_playlist/audio_on_event` 等原始 controller 方法。`mp3_page/voice_page` 還需 Audio v1.1 overlay；不要生成未核對的全家族通用程式。

`m.volume()` 不是本頁音量入口。不要把原始 controller 的方法名稱直接當成 `Mango` 方法。pause/resume 與高 ID 插播均需按實際來源和驗收界線處理。

## Execution lifecycle

先配置 DM，再明確初始化，之後保持同一 Mango 的 Scheduler。控制命令、語音片段銜接、BUSY 觀察都需要 loop。callback 短小，複雜控制延後主迴圈；不能在 callback 中用等待完成的迴圈或再呼叫 `run_once()`。學生無需自行發 UART packet 或製造 `@@MANGO_EVENT@@`。

[完整範例與問題排除](../guides/dfplayer.md) · [DHT11](dht11.md) · [Clock](clock.md)

## 來源與驗證範圍

核對 MangoBox 原始碼 `f875289b5698f0e61faf64196b1165a3b18f2bd5`：

- `runtime/mangox2-pico/firmware/mangox2/student_api_services.py`
- `runtime/barepico/firmware/barepico/core.py`
- `runtime/common/peripherals/firmware_candidate/rc6_original.py`
- `runtime/common/peripherals/audio_v11_candidate/mb_mp3/player.py`
- `runtime/common/peripherals/audio_v11_candidate/mb_audio_rc6/manager.py`

本頁程式碼經 Python 語法檢查；感測數值、聲音、網路及實體裝置行為仍需在指定韌體與硬體驗證。
