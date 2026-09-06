# MangoBox 首頁圖片交付規格
更新日期：2026-09-06

對應 index.html 的 data-image 欄位。以下是建議原始素材尺寸（寬 × 高，px），不是 CSS 固定顯示尺寸。圖片由使用者提供後再整合，目前保留預留區，不載入不存在的圖片。

| 區域 | 檔名 | 建議尺寸 | 比例 | 內容 |
| --- | --- | --- | --- | --- |
| 首屏 | mangobox-hero.png | 1600 × 1200 | 4:3 | MangoBox 套件、程式學習與師生教學情境，保留產品真實性 |
| Pico | raspberry-pi-pico.png | 800 × 1600 | 1:2 | 單板俯拍，USB 朝上，完整接腳 |
| Pico W | raspberry-pi-pico-w.png | 800 × 1600 | 1:2 | 單板俯拍，USB 朝上，完整接腳 |
| Pico 2 W | raspberry-pi-pico-2-w.png | 800 × 1600 | 1:2 | 單板俯拍，USB 朝上，完整接腳 |
| MangoX2 電路板 | mangox2-board.png | 1200 × 1200 | 1:1 | 完整 PCB；呈現 mini 麵包板安裝空間；不混入 OLED、RGB、Button 預安裝套件 |
| MangoLite 電路板 | mangolite-board.png | 1200 × 1200 | 1:1 | 完整 PCB 與板載元件 |
| MangoX2 Starter | mangox2-starter-kit.png | 1600 × 1200 | 4:3 | 組裝完成的智慧車，斜前方視角 |
| MangoX2 程式教育套件 | mangox2-programming-kit.png | 1600 × 1200 | 4:3 | 完整套件，呈現 OLED、RGB、Button 等預安裝模組 |
| MangoLite 物聯網套件 | mangolite-iot-kit.png | 1600 × 1200 | 4:3 | MangoLite + Pico 2 W 及實際套件配件；原型應註明 |
| AI 概念圖 | mangobox-ai-platform.png | 1200 × 1600 | 3:4 | 人、AI、程式與硬體歷程，以及學生／教師支持；標明研究概念，避免假裝已上線的介面 |
| 生態系總覽 | mangobox-ecosystem.png | 2400 × 800 | 3:1 | 電路板、套件、韌體軟體、AI 平台、學生學習與教師教學 |

## 素材交付
- 目標目錄：assets/home/。
- 硬體照片優先透明背景 PNG；也接受高解析原始 JPG，整合時另行處理。
- 白色背景亦可；板子完整入鏡，四周留 8–12% 空間，避免強烈陰影與反光。
- 三款 Pico 保持相同方向、光線與縮放基準，不把各板拉伸成同樣長寬。
- 不將標題、署名、標籤與長說明烘焙進照片；這些保留為網頁文字。
- 建議原始圖維持上述尺寸或更大；網頁版整合時壓縮，硬體單圖盡量 150–400 KB、主視覺／套件圖 300–700 KB。以清晰度優先，不為檔案大小破壞文字辨識。
- 插圖可另提供 SVG／可編輯原稿；圖表應使用精確繪圖工具。總覽圖可另附 1200 × 1600 直式版本 mangobox-ecosystem-mobile.png，方便手機閱讀，但不是目前 11 張必要圖之一。
- 圖片以 object-fit:contain 整合，不因卡片長寬裁掉 PCB 或套件內容。
- 目前導覽列已有 approved Logo：assets/brand/mangobox-core-refined-64.png，不需重製。
- 韌體與軟體區目前是六個文字／符號卡片，沒有截圖預留區；本次不需補六張軟體截圖。
- 本次不新增人物照片欄位，因此無須準備兩位研發者肖像。
