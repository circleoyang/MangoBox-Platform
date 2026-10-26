# Student API 文件與 AI Context 來源對齊 — 2026-10-26

## 目的與來源

本次更新對齊 MangoBox 現行候選來源，補齊原本七段式雙語教學，並更新原 AI Context Builder、批次 Markdown／ZIP 產生器及其 workflow 定義。正式 stable 資料與九月 overlay 保持原契約，不以候選內容覆寫。

- 工程來源：`circleoyang/MangoBox@f875289b5698f0e61faf64196b1165a3b18f2bd5`，PR #154 的已核對 head。
- 工程 main 比較基準：`be04e6642f7197183159231ca7e53b7bcb0c30a4`。
- Platform base：`5c05ff702640889b6901fd136812ebb70b5c8dc0`。
- 原規範：MangoBox `docs/student-guide/DOCUMENTATION_SPEC_V1.md`、實作 checklist、Student API contract，以及 callback 前景處理規則。
- 最新會話協定與狀態文件取自 MangoBox docs PR #155；Issue #153 與 RC9 兩份 acceptance JSON 只讀核對，沒有更改驗收。

## 更動與行為

新增八個 High-Level MicroPython candidate profiles、23 個模組的來源路由，以及 508 個家族別精確 API contract 項目（含三種必要的 nested helpers，非互異方法數）。可在候選閱讀器按 target／語言／模組讀 Guide 或 Reference，並搜尋實際可用方法。新增 92 份中英文教學／參考頁，補上 DHT、DFPlayer、Wi-Fi、時鐘、OLED 媒體、BLE、生命週期、Runtime Config、Scheduler，以及 BarePico 外接周邊與 Lite 專用簽章。

生成器與網頁共用 renderer；必須吻合來源 SHA、target 及方法契約，按所選模組加上必要依賴，拒絕錯誤 scope／缺資料／無契約方法。切換設定會清掉舊結果；ZIP 僅收當次 manifest 指定檔案。stable 預設與原 ZIP 名稱保留，新增 candidate／all 及雙語批次輸出。

文件分開解釋來源存在、請求被接受、排程完成與實體輸出。已核對的差異包括 BarePico 沒有 supports、DHT 的失敗／舊值語意、時鐘未校時與 NTP 請求狀態、say 回整數片段數、Audio overlay 條件、OLED 指令回傳差異、BLE 四個 target 限制、Lite 的 Light／Sound／Servo 簽章，以及 Bare 蜂鳴器／Servo／LED 的真實生命週期限制。

## 後續補充：開發者介紹

依開發者的公開署名要求，AI Markdown 及 ZIP README 新增 **歐陽芳泉教授（小歐老師）** 的介紹、[GitHub circleoyang](https://github.com/circleoyang) 與[公開專案連結](https://github.com/circleoyang/MangoBox-Platform)。中文介紹說明 MangoBox 以程式設計教學與硬體互動為核心，整合開發工具、學生 API 與教學文件；英文維持同義內容與中文姓名。沒有補入未確認的現職、年資、獎項或私人聯絡方式。

[developer-profile.json](../student-guide/site/data/developer-profile.json) 是唯一維護來源，透過共用 core 供 Browser、Node 與 Python ZIP 入口使用。所有 stable／candidate／all、繁中／英文、完整模組／子集及 Reference-only 輸出皆含介紹；「開發者介紹／Developer」放在 Markdown 前部，與 Environment、API 契約及 allowlist 分開。ZIP README 使用同一個介紹 renderer。

缺少姓名、任一語言描述或合法公開連結時會停止生成。瀏覽器在重新載入資料時清空舊內容，載入失敗時停用輸出；CLI 在寫入新輸出前驗證。Manifest 每個檔案項目新增 `developer_id`、`developer_profile_version`，保留既有欄位與 stable ZIP 檔名。介紹資料不參與 API 可用性判定，後續只須修訂 canonical JSON 並遞增其 profile version。

## 後續補充：已確認的目前行為限制

來源契約增加三家 Servo 未完成 move_to 不被 release 取消、Carrier 正常 close 不關 Servo PWM、Bare Scheduler 同輪取消缺陷，以及 LED/Buzzer 舊 expiry 與 Bare beeper 小 duration 的限制。這是對現有候選來源的描述，沒有宣稱 Runtime 已修復。

候選 X2 Servo 改走 `candidate/x2/{lang}/{guides,reference}/servo.md` 四頁，保留七段教學，完整範例採直接角度或有限 sweep，離開時明確 release/close；Lite 的四頁補相同 move_to 限制與 Carrier close 界線。既有 stable 歷史頁仍按自己的版本使用。已核准但未完成的 X2 BLE 等功能仍從現行 default profile 排除，不能以文件更新替代移植。

## 驗證

- 原 stable 文件守門：15 profiles／18 modules；133 搜尋方法與 24 smoke queries；480 個 reference/method 對應。
- 共享 renderer：原 stable parity 120 cases；candidate parity 64 cases。
- 防護測試：35 個 Builder checks（含缺署名、雙語描述、公開連結、README 一致性、API 隔離及資料載入失敗）；12 個 reader checks。
- 候選文件 gate：640 條雙語 Guide/Reference 路由、145 個不同頁面（含重用的 stable 頁）、42 份七段式候選 Guide、493 個 Python 範例、6517 次 profile-specific 簽章綁定、52 個合法 legacy declaration fences、296 個相對連結，全部通過。另以六個 unittest（含七組 integration negative mutations）確認錯誤 scope／缺檔／錯 keyword 等會被拒絕。
- CLI 已產生 candidate 繁中／英文各八份，驗證 ZIP 成員與 SHA-256；stable 相容入口另核對十份輸出。
- 開發者介紹補充另重跑 stable／candidate × 繁中／英文四批次，共 36 份 Markdown、4 個 ZIP README，逐檔核對姓名、對應語言、公開連結、章節位置、manifest 開發者 id／version、精確 ZIP 成員與 SHA-256，全部通過。
- 工程 repo 的 v1 gate 仍涵蓋 136 methods；新的候選 AST 安裝鏈、build／mode 界線由其 16 個 unittest 檢查。

以上是本機 Linux 文件／程式檢查。沒有 Chromium 執行檔，因此未宣稱視覺 E2E 通過；未執行 Windows／硬體測試、UF2 編譯／燒錄或 Actions。本次只更新 workflow 定義，提交以 skip-ci 保持交付範圍。合併與正式網站部署尚須依正常審核流程進行。

## 後續維護

完整生成與檢查命令見 [候選通道 README](../student-guide/candidate/README.md)。`contracts/source-snapshot.vnext.json` 是工程盤點的公開欄位子集；`source_commit` 鎖定實作／build 基準，文件契約指紋可以包含本變更集的編輯修正。不得把 planning ledger、isolated Audio version 或硬體 read-only smoke 當成全 target 已完成實作／驗收。

開發者資料與 API 快照分開維護。更新 `site/data/developer-profile.json` 時，保留已確認的公開資訊、同步修訂繁中／英文介紹並遞增 `profile_version`；執行 renderer parity、Builder guards 與雙語批次輸出檢查。不要在多份模板中複製作者介紹，也不要藉署名資料增加 capability 或方法。
