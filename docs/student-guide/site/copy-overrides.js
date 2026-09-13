I18N["zh-TW"].homeTitle = "MangoBox API 開發文件";
I18N["zh-TW"].homeLead = "查詢 API、程式範例與各功能模組的使用方式；如需接線、Pin 或硬體差異資訊，可再指定 MangoX2 / MangoLite 裝置環境。";
I18N["zh-TW"].universal = "通用 API";
I18N["zh-TW"].footer = "預設使用通用 API；硬體 context 只在需要時套用。";
I18N.en.homeTitle = "MangoBox API Documentation";
I18N.en.homeLead = "Search APIs, code examples, and module guides. Select a MangoX2 / MangoLite device context only when wiring, pin assignments, or hardware-specific details are needed.";
I18N.en.universal = "Universal API";
I18N.en.footer = "Universal API is the default; hardware context is applied only when needed.";

// Documentation copy correction: current Host Python has not yet published the
// Line Tracking Student API. The default GP12/GP13 mapping also overlaps the
// current Host UART mapping, but that pin conflict is configurable and is not a
// permanent hardware limitation.
const _renderNoticeBase = renderNotice;
renderNotice = function (m, p) {
  if (m && m.id === "line_tracking" && state.target && state.target.startsWith("mangox2")) {
    const n = $("deviceNotice");
    n.textContent = state.lang === "zh-TW"
      ? "目前 Host Python 尚未發布 Line Tracking Student API；預設 GP12/GP13 另與目前 Host UART 配置重疊，但可透過重新配置 GPIO 避開，並非硬體永久限制。"
      : "Host Python has not yet published the Line Tracking Student API. The default GP12/GP13 mapping also overlaps the current Host UART mapping, but the GPIO mapping can be changed; this is not a permanent hardware limitation.";
    n.classList.remove("hidden");
    return;
  }
  _renderNoticeBase(m, p);
};
