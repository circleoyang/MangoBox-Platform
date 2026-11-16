/* MangoBox AI Context v1: one canonical renderer for browser and Node.js. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MangoAIContext = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const HEADER = "# MangoBox Official Student API — AI Context";
  const RULES = [
    "## Instructions for an LLM",
    "",
    "1. Use only documented API signatures and callback parameters from this selected profile.",
    "2. Do not combine Host Python and High-Level MicroPython methods or infer version parity.",
    "3. Use `from mangobox import Mango` and `m = Mango()` where documented.",
    "4. Check actual hardware wiring, enabled modules and configured device names before execution.",
    "5. Do not invent API names, GPIO, threshold units or missing features.",
    "6. If a capability is missing from this reference, state that it is unavailable or unverified.",
    "7. Include imports and a runnable event loop only when the documented API requires it.",
    "8. Pico ADC GPIO input must remain within the supported voltage range.",
    "9. For custom polling, LED animations or repeated actions in High-Level MicroPython, consult the Scheduler module before using time.sleep() loops.",
    "10. Only use m.scheduler.add_task/remove_task in High-Level MicroPython profiles documenting Scheduler; never invent a Host Python equivalent or call scheduler.clear() to stop a single task.",
    "11. In High-Level MicroPython, read DM-defined hardware parameters through documented m.config.get() keys instead of hardcoding LED counts, names or pins.",
    "12. Check existence, enabled flags and valid ranges before accessing named modules. Never invent m.led_count(), m.led_info() or an undocumented configuration key.",
    "13. The Runtime Config access pattern is not automatically applicable to Host Python; never assume both execution modes expose the same configuration object.",
    "14. In High-Level MicroPython, keep Button/Sensor Scheduler callbacks short: for effect/music/hardware mode transitions, record a pending request in the callback and process it in the foreground after m.run_once() returns.",
    "15. A foreground while-loop that calls m.run_once() must not also call m.run_forever(); avoid deep synchronous LED/music transitions inside polling callbacks because MicroPython may raise maximum recursion depth exceeded.",
  ];
  function selectedModules(profile, modules, ids) {
    if (!profile || !Array.isArray(profile.capabilities)) throw Error("Missing release profile");
    const allowed = modules.filter(m => profile.capabilities.includes(m.capability));
    const set = ids == null ? null : new Set(ids);
    if (set) {
      for (const id of set) if (!allowed.some(m => m.id === id)) throw Error("Unsupported module: " + id);
    }
    return allowed.filter(m => !set || set.has(m.id));
  }
  function paths(profile, modules, ids, lang, includeGuides) {
    const prefix = (lang || "zh-TW") + "/" + (profile.mode === "host_python" ? "host-python/" : "");
    return selectedModules(profile, modules, ids).flatMap(m =>
      ["reference", ...(includeGuides === false ? [] : ["guides"])]
      .map(kind => ({id:m.id, kind, path:prefix + kind + "/" + m.id + ".md"})));
  }
  function render(opts) {
    const {profile, modules, lang="zh-TW", ids=null, includeGuides=true, sourceDocs} = opts;
    const entries = paths(profile, modules, ids, lang, includeGuides);
    if (!entries.length) throw Error("Select at least one supported module");
    const selected = selectedModules(profile, modules, ids);
    const parts = [
      HEADER, "",
      "> Canonical MangoBox Student API reference, assembled from the official published documents.",
      "> This document describes version-scoped APIs; it does not prove connected hardware or Host package support.",
      "",
      "## Environment", "",
      "- Target: " + profile.target,
      "- Mode: " + profile.mode,
      "- Profile: " + profile.id,
      "- Runtime: " + (profile.runtime ?? "unspecified"),
      "- Host Student API package: " + (profile.host_package || "not applicable"),
      "- Release status: " + (profile.release_status || "unspecified"),
      "- Document language: " + lang,
      "- Modules: " + selected.map(m => m.id).join(", "),
      "",
      ...RULES,
    ];
    for (const mod of selected) {
      parts.push("", "## Module: " + mod.id, "");
      for (const e of entries.filter(x=>x.id===mod.id)) {
        const doc = sourceDocs[e.path];
        if (typeof doc !== "string" || !doc.trim()) throw Error("Missing/empty canonical source: " + e.path);
        parts.push("### " + (e.kind==="reference" ? "API Reference" : "Learner Guide") + " — " + mod.id, "", doc.trim().replace(/\r\n?/g, "\n"), "");
      }
    }
    return parts.join("\n").replace(/\n+$/, "") + "\n";
  }
  const CURRENT_SOURCE = "353cc577c8d96e6d9fb945c60ed4f987823f3642";
  const CURRENT_TARGETS = ["mangox2-pico","mangox2-picow","mangox2-pico2w","mangolite-pico","mangolite-picow","mangolite-pico2w","barepico-pico","barepico-picow","barepico-pico2w"];
  function validateCurrent(pack) {
    if (!pack || pack.schema_version !== 2 || pack.source_commit !== CURRENT_SOURCE || pack.status !== "RELEASED_PARTIAL_HARDWARE" || pack.developer !== "歐陽芳泉") throw Error("Invalid firmware source metadata");
    if (pack.release_tag !== "firmware-oled16-20261116") throw Error("Invalid release tag");
    if (!Array.isArray(pack.targets) || pack.targets.length !== 9) throw Error("Expected exactly nine firmware targets");
    const ids = new Set();
    for (const t of pack.targets) {
      if (!CURRENT_TARGETS.includes(t.id) || ids.has(t.id)) throw Error("Invalid or duplicate firmware target");
      ids.add(t.id);
      for (const key of ["label","family","mcu","runtime_version","markdown","markdown_en"]) if (typeof t[key] !== "string" || !t[key].trim()) throw Error("Missing target field: " + key);
      const family = t.id.split("-")[0], board = t.id.split("-")[1];
      if (t.family !== family || t.mcu !== (board === "pico2w" ? "RP2350" : "RP2040") || t.wireless !== (board !== "pico")) throw Error("Invalid target hardware metadata");
      if (t.runtime_version !== ({mangox2:"0.2.11",mangolite:"0.6.6",barepico:"0.1.1"})[family]) throw Error("Invalid firmware version");
    }
    return pack;
  }
  function renderCurrent(pack, id, lang="zh-TW") {
    validateCurrent(pack);
    if (!["zh-TW","en"].includes(lang)) throw Error("Unsupported document language");
    const target=pack.targets.find(t=>t.id===id);
    if (!target) throw Error("Unknown firmware target");
    return [HEADER, "", "## Firmware source alignment — OLED16 release", "",
      "- Developer: " + pack.developer, "- Target: " + target.label + " (" + target.id + ")",
      "- Family: " + target.family, "- MCU: " + target.mcu, "- Wireless board: " + target.wireless,
      "- Source commit / BUILD_ID: " + pack.source_commit, "- Firmware version: " + target.runtime_version, "- Release: " + pack.release_tag, "- Status: " + pack.status,
      "- Mode: High-Level MicroPython firmware source; not Host Python",
      "- Source and automated checks do not establish nine-board physical acceptance. Release evidence covers MangoLite + Pico W and MangoX2 + Pico; seven combinations are not hardware-accepted.", "",
      (lang==="en" ? target.markdown_en : target.markdown).trim(), ""].join("\n");
  }
  return {render, paths, selectedModules, validateCurrent, renderCurrent, CURRENT_SOURCE, CURRENT_TARGETS};
});

