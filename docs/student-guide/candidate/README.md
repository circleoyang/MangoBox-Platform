# MangoBox API 開發文件：來源候選通道

這個通道讓學生、教師與程式生成工具使用同一份已核對的 API 契約。它保留來源版本、家族、板型、執行模式與初始化條件，避免把提案、其他家族的方法或選配 build 當成目前裝置已安裝的功能。

閱讀入口：[候選教學與 API Reference](../site/candidate-docs.html)。產生給大型語言模型的 Markdown：[AI Context Builder](../site/ai-context-builder.html?channel=candidate)。頁面仍以 **MangoBox API 開發文件** 為名稱；既有 stable 文件與 Host profile 維持原入口。

## 本次核對範圍

來源為 `circleoyang/MangoBox`，commit `f875289b5698f0e61faf64196b1165a3b18f2bd5`，日期 2026-10-26。

| 家族 | 候選 Runtime | 目標 | 本通道模式 |
| --- | --- | --- | --- |
| MangoX2 | 0.2.10-rc2 | Pico、Pico W、Pico 2 W | High-Level MicroPython |
| MangoLite | 0.6.5-rc2 | Pico W、Pico 2 W | High-Level MicroPython |
| BarePico | 0.1.0-rc6 | Pico、Pico W、Pico 2 W | High-Level MicroPython |

這些版本來自來源的 Runtime `__version__`。它們與 Host package 0.4.6、MangoThonny 應用程式版本、內部 API_VERSION、隔離 Audio 建置覆寫的 rc3 各有不同用途。檔案存在、方法已安裝、裝置已燒入、實際接線／輸出通過，也都是不同事實。

Wi-Fi／NTP 對應六個無線 target；BLE 只有 Lite／BarePico 的四個無線 target。X2 installer 沒有 BLE，非 W Pico 不提供直接無線教學。Host installer 沒有本次板端 DHT、Wi-Fi、BLE、音訊、時鐘與 OLED media extension，因此不建立虛構的 Host candidate。

## 教學結構

每份模組 Guide 沿用七段：用途與準備、完整快速測試、可觀察結果、常見用法、完整互動例子、目標／模式／版本與排錯、小挑戰。繁中以國中學生能操作與判讀為原則，英文頁說明同樣的契約。shared DHT 頁只作為家族分流入口；真正課程在 carrier／barepico 的頁面。

Reference 與自動插入 AI Context 的來源契約互補：前者解釋參數範圍、回傳、錯誤、事件、初始化與生命週期；後者逐方法保留精確簽章、預設值、來源位置與 target。相同名稱不代表相同簽章，例如 Lite Servo 不接受 X2 的 `name=`，Lite Light／Sound 門檻方法也沒有 X2 的 `period=`。

BarePico 依 DM 的模組開關、具名裝置與真實 pin 設定使用 API，沒有 carrier 的預設接腳；不呼叫不存在的 `supports()`。callback 保持短小，跨模組工作留旗標交由前景處理。`run_once()` 前景迴圈與 `run_forever()` 選一種，不遞迴進入 Scheduler，不清除所有模組任務。事件標記 `@@MANGO_EVENT@@` 由 Runtime 產生，範例不偽造記錄、不逐輪或逐幀洗版，也不輸出完整含憑證配置。

## AI Markdown 的使用方式

先選 stable 或 candidate，再選實際 target、模式、版本、語言與模組。只把一個環境對應的 Markdown 交給 LLM；不要把不同板型與模式的整包混成一份介面。小範圍選取會自動加入範例真正用到的依賴，並明列額外模組，例如 OLED 互動範例使用 Pot。

候選生成器要求精確的 source SHA、method allowlist 與 API contract。缺檔、來源不符、無契約方法、無效依賴或範例使用不支援方法時中止生成；切換選項會清除舊輸出，過期請求不得恢復舊內容。Audio v1.1 overlay-only 方法未加入普通 default-build profile。

在 repository root 執行：

```bash
# 既有預設：十個推薦 stable board/mode 組合，保留原 ZIP 名稱
python scripts/build_ai_api_context_bundle.py --lang zh-TW

# 八個來源候選 target；繁中／英文分開產生
python scripts/build_ai_api_context_bundle.py --channel candidate --lang zh-TW --output dist/candidate-zh-TW
python scripts/build_ai_api_context_bundle.py --channel candidate --lang en --output dist/candidate-en

# 只取一個 target 和所需模組；依賴會自動加入
node scripts/build_ai_api_context_bundle.js --channel candidate --profile barepico-picow__hlmp__candidate-0.1.0-rc6 --modules oled --lang zh-TW --output dist/barepico-oled
```

`--channel all` 可同時輸出十個 stable 與八個 candidate 檔案。`--no-guides` 只保留 Reference 與來源契約。每次 ZIP 僅包含當次 manifest 指定的 Markdown、README 與 manifest，並核對 SHA-256，不納入同目錄的舊輸出。stable ZIP 名稱維持 `MangoBox_AI_API_Context_zh-TW.zip`；candidate／all 名稱包含 channel。

## 開發者介紹與資料維護

開發者公開資料的唯一維護來源是 [developer-profile.json](../site/data/developer-profile.json)。目前署名為 **歐陽芳泉教授（小歐老師）**，GitHub 為 [circleoyang](https://github.com/circleoyang)，公開專案為 [circleoyang/MangoBox-Platform](https://github.com/circleoyang/MangoBox-Platform)。JSON 保留姓名、公開連結、繁中／英文介紹，以及開發者資料的 `id`、`schema_version`、`profile_version`；不在各頁或 CLI 另複製一份介紹。

所有生成的 AI Markdown 與 ZIP README 都包含對應語言的開發者介紹，適用 stable、candidate、all 通道，以及完整模組、模組子集與 `--no-guides`。Markdown 中的「開發者介紹／Developer」位於 Environment 之前，與環境條件、方法契約及 allowlist 分開。Browser、Node CLI 和 Python ZIP 入口共用同一個 core 產生介紹；Python 使用 Node 產生的 README 與 manifest 封裝。

姓名、雙語描述或合法公開連結缺漏時會停止生成，不會省略署名繼續輸出。瀏覽器重新載入資料時會清除舊預覽，資料載入失敗時停用生成、複製與下載；CLI 在寫入新輸出前檢查資料。`MANIFEST.json` 的每個檔案項目另記錄 `developer_id` 與 `developer_profile_version`，原有 profile、來源及 SHA-256 欄位保持不變。

修訂開發者介紹時，只更新這份 JSON 中已確認可公開的文案與連結，同時維護兩個語言並遞增 `profile_version`。描述採一般文字段落，避免加入 HTML、執行指令或 API capability 資料；署名不決定任何方法是否可用。修改後執行下方 parity／guards 與批次產生命令，確認 Markdown 和 ZIP README 一致。

## 下次 API 更新流程

1. 在 MangoBox 核對真實 installer、來源、目標與 build，更新其 `student_api_source_snapshot.vnext.json`。原 `student_api_catalog.vnext.json` 是規劃台帳，不可直接作方法白名單。
2. 依實際差異修訂雙語 Guide／Reference；必要時新增家族專用頁，不把所有同名 API 強制合併。
3. 匯入已審核快照，再執行資料與範例檢查：

```bash
python scripts/sync_candidate_api_docs.py --source-snapshot ../MangoBox/docs/student_api/student_api_source_snapshot.vnext.json
python scripts/sync_candidate_api_docs.py --check --source-root ../MangoBox
python scripts/check_candidate_docs.py
python tests/ai-context-builder/candidate-docs-gate.py
python scripts/check_student_docs.py
python scripts/check_student_search.py
python scripts/check_api_reference_completeness.py
node tests/ai-context-builder/parity.js
node tests/ai-context-builder/candidate-parity.js
node tests/ai-context-builder/guards.js
node tests/ai-context-builder/candidate-reader.js
```

Public repo 自行檢查可省略 `--source-root`，但仍須使用已審核的 compact snapshot；只有持有對應工程來源的工作區能重新驗證其 hashes。讀者可執行 `python -m http.server 8769`，開啟 `/docs/student-guide/site/candidate-docs.html` 與 Builder；不以 `file://` 開頁面，因為載入文件使用相對 fetch。

## 驗證界線

語法、簽章、路由、共享 renderer 與 manifest 檢查證明文件和工具的契約一致；不證明 Windows／瀏覽器視覺／實體周邊已驗收。本輪沒有編譯或燒錄 UF2，沒有更動 RC9 acceptance 狀態。實際 Chromium E2E 在這次環境因沒有瀏覽器執行檔而未執行；既有瀏覽器 workflow 定義保留，候選 guards 另外納入。所有硬體與其他產品的 release 決策仍遵循原專案規則。

2026-10-26 的開發者介紹補充已通過 stable parity 120 cases、candidate parity 64 cases 與 Builder guards 35 checks。另實際產生 stable／candidate × 繁中／英文四批次，共 36 份 Markdown、4 個 ZIP README，逐檔核對署名、語言、公開連結、前部章節位置、manifest 開發者版本與 SHA-256；保留原 stable ZIP 名稱。這些是文件生成檢查，沒有擴大上述驗收範圍。
