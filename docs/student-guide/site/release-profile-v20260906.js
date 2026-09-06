// Stable public release profile — 2026-09-06
// Loaded after app.js so the public documentation selector follows the five
// independently published Runtime targets without changing legacy deep links.

for (const key of Object.keys(TARGETS)) delete TARGETS[key];
Object.assign(TARGETS, {
  "mangox2-pico":   { product: "MangoX2",   board: "Raspberry Pi Pico",     mcu: "RP2040" },
  "mangox2-picow":  { product: "MangoX2",   board: "Raspberry Pi Pico W",   mcu: "RP2040" },
  "mangox2-pico2w": { product: "MangoX2",   board: "Raspberry Pi Pico 2 W", mcu: "RP2350" },
  "mangolite-picow":  { product: "MangoLite", board: "Raspberry Pi Pico W",   mcu: "RP2040" },
  "mangolite-pico2w": { product: "MangoLite", board: "Raspberry Pi Pico 2 W", mcu: "RP2350" }
});

I18N["zh-TW"].versionHint = "預設顯示 2026-09-06 正式版相容設定；舊版文件之後可由此切換。";
I18N.en.versionHint = "The 2026-09-06 stable compatibility profile is selected by default. Historical profiles can be added here later.";
I18N["zh-TW"].footerNote = "內容依五個正式 Runtime target 與 compatibility profile 過濾；裝置 Enable 狀態不等於 API 是否存在。";
I18N.en.footerNote = "Content is filtered by the five stable Runtime targets and compatibility profiles; device enablement is not the same as API existence.";

// Re-render immediately. This is safe whether init() is still loading JSON or has
// already completed, and keeps the selector order deterministic.
renderSetup();