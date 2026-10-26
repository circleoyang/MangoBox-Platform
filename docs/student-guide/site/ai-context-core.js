/* MangoBox AI Context: one profile-scoped renderer for browser and Node.js. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MangoAIContext = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const HEADER = "# MangoBox Official Student API — AI Context";
  const RULES = [
    "## Instructions for an LLM", "",
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
    "15. A foreground while-loop that calls m.run_once() must not also call m.run_forever(); never call run_once() or enter the scheduler recursively from a callback.",
    "16. A candidate profile describes reviewed source at its recorded commit. It is not a stable release, a flashed-device inventory, or proof of physical hardware acceptance.",
    "17. The Host package version, MangoThonny version and device firmware version are different identifiers. Do not substitute one for another.",
    "18. Use the runtime's documented event logging. Do not print fabricated @@MANGO_EVENT@@ records or add per-poll/per-frame logs; never log passwords, tokens or device secrets.",
    "19. An accepted playback, display or connection request is not proof of audible output, a displayed frame, network reachability or a completed operation. Inspect the documented result/status.",
  ];
  const normalizeMethod = name => String(name).replace(/^m\./, "").replace(/\s+/g, "").replace(/\(\)$/, "");
  // Attribution is separate from target profiles, contracts and API allowlists.
  function validateDeveloperProfile(developer) {
    if (!developer || developer.schema_version !== 1) throw Error("Developer profile is required (schema version 1)");
    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(developer.id || "") || !Number.isInteger(developer.profile_version) || developer.profile_version < 1)
      throw Error("Invalid developer profile identity/version");
    if (typeof developer.name !== "string" || !developer.name.trim()) throw Error("Developer name is required");
    if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(developer.github_username || "") ||
        developer.github_url !== "https://github.com/" + developer.github_username)
      throw Error("Invalid developer GitHub profile");
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(developer.project_repository || "") ||
        developer.project_url !== "https://github.com/" + developer.project_repository)
      throw Error("Invalid developer project repository");
    for (const language of ["zh-TW", "en"])
      if (typeof developer.description?.[language] !== "string" || !developer.description[language].trim())
        throw Error("Developer description is required for " + language);
  }
  function renderDeveloper(developer, lang="zh-TW") {
    validateDeveloperProfile(developer);
    if (!["zh-TW", "en"].includes(lang)) throw Error("Unsupported document language");
    return [lang === "en" ? "## Developer" : "## 開發者介紹", "",
      "**" + developer.name + "**", "", developer.description[lang], "",
      "- GitHub: [" + developer.github_username + "](" + developer.github_url + ")",
      "- " + (lang === "en" ? "Project repository" : "專案公開原始碼") + ": [" + developer.project_repository + "](" + developer.project_url + ")", ""
    ].join("\n");
  }
  function renderBundleReadme({developerProfile, lang="zh-TW", channel="stable"}) {
    if (!["stable", "candidate", "all"].includes(channel)) throw Error("Unknown export channel");
    const developer = renderDeveloper(developerProfile, lang);
    return ["# MangoBox AI API Context Bundle", "", developer.trimEnd(), "",
      lang === "en" ? "## Using this bundle" : "## 使用方式", "",
      "- Channel: " + channel,
      "- Document language: " + lang, "",
      lang === "en" ? "Select exactly one target/mode/version file. Candidate references are not stable releases or hardware-acceptance evidence." :
        "請選擇一份符合實際板型、執行模式與版本的文件。候選來源文件不代表穩定版發布或實機驗收完成。", "",
      lang === "en" ? "The Markdown is generated by the same renderer as the online AI Context Builder. MANIFEST.json records the exact files, their SHA-256 and the developer profile version." :
        "本套 Markdown 與線上 AI Context Builder 使用同一個生成核心。MANIFEST.json 記錄本次檔案、SHA-256 與開發者資料版本。", "",
      "Website: https://circleoyang.github.io/MangoBox-Platform/docs/student-guide/site/ai-context-builder.html", ""
    ].join("\n");
  }
  function isCandidate(profile) { return profile?.release_status === "candidate"; }
  function validateProfile(profile) {
    if (!profile || !Array.isArray(profile.capabilities) || !profile.id || !profile.target)
      throw Error("Missing release profile");
    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(profile.id) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(profile.target))
      throw Error("Invalid profile/target identifier");
    if (!["high_level_micropython", "host_python"].includes(profile.mode)) throw Error("Unsupported programming mode");
    if (!["stable", "candidate"].includes(profile.release_status)) throw Error("Unknown release status");
    if (isCandidate(profile)) {
      if (!/^[a-f0-9]{40}$/i.test(profile.source_commit || "")) throw Error("Candidate source commit is missing or invalid");
      if (!profile.source_repository || !profile.documentation_root) throw Error("Candidate source/documentation metadata is missing");
      if (!Array.isArray(profile.allowed_methods) || !profile.allowed_methods.length) throw Error("Candidate method allowlist is missing");
      if (profile.allowed_methods.some(name => !/^[A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*$/.test(normalizeMethod(name)))) throw Error("Candidate method allowlist contains an invalid name");
    }
  }
  function methodSet(profile) { return new Set((profile.allowed_methods || []).map(normalizeMethod)); }
  function selectedModules(profile, modules, ids) {
    validateProfile(profile);
    const methods = methodSet(profile);
    const allowed = modules.filter(m => profile.capabilities.includes(m.capability) &&
      (!isCandidate(profile) || !Array.isArray(m.methods) || !m.methods.length || m.methods.some(name => methods.has(normalizeMethod(name)))));
    const set = new Set(ids == null ? allowed.map(mod=>mod.id) : ids);
    for (const id of set) if (!allowed.some(m => m.id === id)) throw Error("Unsupported module: " + id);
    const visited = new Set(), visiting = new Set();
    function include(id) {
      // Guides may legitimately reference each other; include their closure once.
      if (visiting.has(id)) return;
      if (visited.has(id)) return;
      const mod = allowed.find(item=>item.id === id);
      if (!mod) throw Error("Unsupported module dependency: " + id);
      visiting.add(id);
      const dependencies = profile.module_dependencies?.[id] ?? mod.dependencies ?? [];
      if (!Array.isArray(dependencies)) throw Error("Invalid module dependencies: " + id);
      for (const dependency of dependencies) { include(dependency); set.add(dependency); }
      visiting.delete(id); visited.add(id);
    }
    for (const id of [...set]) include(id);
    return allowed.filter(mod => set.has(mod.id));
  }
  const BOOTSTRAP = ["supports", "capabilities", "run_once", "run_forever", "close", "config.get", "scheduler.add_task", "scheduler.remove_task"];
  function selectedMethodNames(profile, selected) {
    const possible = methodSet(profile);
    return new Set([...selected.flatMap(mod=>mod.methods || []), ...BOOTSTRAP].map(normalizeMethod).filter(name=>possible.has(name)));
  }
  function resolveContract(profile, apiContract, selected) {
    if (!isCandidate(profile)) return new Map();
    if (!apiContract || !Array.isArray(apiContract.entries)) throw Error("Candidate API contract is required");
    if (apiContract.source_commit !== profile.source_commit || apiContract.source_repository !== profile.source_repository)
      throw Error("Candidate contract/source mismatch");
    const needed = selectedMethodNames(profile, selected), resolved = new Map();
    for (const entry of apiContract.entries) {
      const name = normalizeMethod(entry.name);
      if (!needed.has(name) || !((entry.profiles || []).includes(profile.id) || (entry.targets || []).includes(profile.target))) continue;
      if (resolved.has(name)) throw Error("Ambiguous target API contract: " + name);
      if (typeof entry.signature !== "string" || !entry.signature || !Array.isArray(entry.parameters) || typeof entry.returns !== "string" || !Array.isArray(entry.requires) || !entry.source_url)
        throw Error("Incomplete target API contract: " + name);
      resolved.set(name, entry);
    }
    for (const name of needed) if (!resolved.has(name)) throw Error("Missing target API contract: " + profile.target + " / " + name);
    return resolved;
  }
  function contractMarkdown(entries, lang) {
    const cell = value => String(value ?? "—").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
    const parts = [];
    for (const entry of entries) {
      parts.push("#### `" + entry.signature + "`", "", entry[lang === "en" ? "en" : "zh"] || entry.name, "");
      if (entry.parameters.length) {
        parts.push("| Parameter | Calling convention | Required | Default | Source annotation |", "| --- | --- | --- | --- | --- |");
        for (const parameter of entry.parameters) parts.push("| `" + cell(parameter.name) + "` | " + cell(parameter.kind) + " | " + (parameter.required ? "yes" : "no") + " | " + (parameter.required ? "—" : "`" + cell(parameter.default) + "`") + " | " + cell(parameter.annotation || "See module reference") + " |");
        parts.push("");
      } else parts.push("Parameters: none.", "");
      parts.push("Return: " + entry.returns, "");
      if (entry.requires.length) parts.push("Prerequisites: " + entry.requires.join("; "), "");
      if (entry.notes) parts.push("Notes: " + entry.notes, "");
      parts.push("Source: [" + (entry.source_path || "recorded implementation") + "](" + entry.source_url + ")" + (entry.source_line ? " (line " + entry.source_line + ")" : ""), "");
    }
    return parts;
  }
  function safePath(value) {
    if (typeof value !== "string" || !value || value.startsWith("/") || /[\\?#:]/.test(value) || value.split("/").some(p => !p || p === "." || p === ".."))
      throw Error("Invalid canonical document path: " + value);
    return value;
  }
  function paths(profile, modules, ids, lang, includeGuides) {
    validateProfile(profile);
    const language = lang || "zh-TW";
    if (!["zh-TW", "en"].includes(language)) throw Error("Unsupported document language");
    const prefix = (profile.documentation_root ? safePath(profile.documentation_root) + "/" : "") +
      language + "/" + (profile.mode === "host_python" ? "host-python/" : "");
    return selectedModules(profile, modules, ids).flatMap(m =>
      ["reference", ...(includeGuides === false ? [] : ["guides"])].map(kind => {
        const key = kind === "guides" ? "guide" : "reference";
        const override = profile.documents?.[m.id]?.[key];
        const docPath = override ? override.replaceAll("{lang}", language) : prefix + kind + "/" + m.id + ".md";
        return {id:m.id, kind, path:safePath(docPath)};
      }));
  }
  // Strip Python strings/comments before inspecting m.method() calls in examples.
  // This is an additional documentation gate, not a substitute for source/hardware tests.
  function pythonCodeOnly(source) {
    let result = "", quote = null, triple = false;
    for (let i = 0; i < source.length;) {
      const c = source[i];
      if (quote) {
        if (c === "\\") { result += "  "; i += 2; continue; }
        if (triple && source.slice(i, i + 3) === quote.repeat(3)) { result += "   "; i += 3; quote = null; continue; }
        if (!triple && c === quote) { result += " "; i++; quote = null; continue; }
        result += c === "\n" ? "\n" : " "; i++; continue;
      }
      if (c === "#") { while (i < source.length && source[i] !== "\n") { result += " "; i++; } continue; }
      if (c === "'" || c === '"') { quote = c; triple = source.slice(i, i + 3) === c.repeat(3); const n = triple ? 3 : 1; result += " ".repeat(n); i += n; continue; }
      result += c; i++;
    }
    return result;
  }
  function validateExamples(profile, doc, docPath, scopedNames) {
    if (!isCandidate(profile)) return;
    const allowed = scopedNames || methodSet(profile);
    const fences = /^```(?:python|py|micropython)?[^\S\r\n]*\r?\n([\s\S]*?)^```/gm;
    for (const match of doc.matchAll(fences)) {
      const code = pythonCodeOnly(match[1]);
      for (const call of code.matchAll(/\bm\s*\.\s*([A-Za-z_]\w*(?:\s*\.\s*[A-Za-z_]\w*)*)\s*\(/g)) {
        const name = normalizeMethod(call[1]);
        if (!allowed.has(name)) throw Error("Undocumented method for " + profile.id + ": m." + name + "() in " + docPath);
      }
    }
  }
  function render(opts) {
    const {profile, modules, lang="zh-TW", ids=null, includeGuides=true, sourceDocs, apiContract, developerProfile} = opts;
    const developer = renderDeveloper(developerProfile, lang);
    const entries = paths(profile, modules, ids, lang, includeGuides);
    if (!entries.length) throw Error("Select at least one supported module");
    const selected = selectedModules(profile, modules, ids);
    const contract = resolveContract(profile, apiContract, selected);
    const scopedNames = isCandidate(profile) ? selectedMethodNames(profile, selected) : null;
    const parts = [HEADER, "",
      isCandidate(profile) ? "> Candidate source reference: use only with the exact target/runtime and documented setup below." : "> Canonical MangoBox Student API reference, assembled from the official published documents.",
      "> This document describes version-scoped APIs; it does not prove connected hardware or Host package support.", "",
      developer.trimEnd(), "",
      "## Environment", "",
      "- Target: " + profile.target,
      "- Mode: " + profile.mode,
      "- Profile: " + profile.id,
      "- Runtime: " + (profile.runtime ?? "unspecified"),
      "- Host Student API package: " + (profile.host_package || "not applicable"),
      "- Release status: " + (profile.release_status || "unspecified"),
      "- Document language: " + lang,
      "- Modules: " + selected.map(m => m.id).join(", "),
    ];
    if (ids) {
      parts.push("- Requested modules: " + ids.join(", "));
      const dependencies = selected.filter(mod=>!ids.includes(mod.id)).map(mod=>mod.id);
      if (dependencies.length) parts.push("- Required module dependencies included: " + dependencies.join(", "));
    }
    if (profile.source_commit) {
      parts.push("- Source repository: " + profile.source_repository, "- Source commit: " + profile.source_commit);
      if (profile.source_date) parts.push("- Source review date: " + profile.source_date);
    }
    if (isCandidate(profile)) {
      parts.push("", "## Validation boundaries", "");
      for (const level of ["source", "host", "windows", "hardware"])
        parts.push("- " + level + ": " + (profile.validation?.[level] || "not recorded / pending"));
      parts.push("", "## Method allowlist for this profile", "",
        "Use this allowlist as a boundary, not as a substitute for the signatures, initialization and examples in the selected modules.", "",
        [...scopedNames].sort().map(name => "`m." + name + "`").join(", "));
      if (profile.notes?.length) parts.push("", "## Profile notes", "", ...profile.notes.map(note => "- " + note));
    }
    parts.push("", ...RULES);
    if (isCandidate(profile)) {
      const moduleMethods = new Set(selected.flatMap(mod=>mod.methods || []).map(normalizeMethod));
      const helpers = [...contract.entries()].filter(([name])=>!moduleMethods.has(name)).map(([,entry])=>entry);
      if (helpers.length) parts.push("", "## Required runtime helpers", "", ...contractMarkdown(helpers, lang));
    }
    for (const mod of selected) {
      parts.push("", "## Module: " + mod.id, "");
      if (isCandidate(profile) && mod.methods?.length) {
        const moduleEntries = mod.methods.map(normalizeMethod).filter(name=>contract.has(name)).map(name=>contract.get(name));
        parts.push("### Exact API contract — " + profile.target + " / " + profile.mode + " / " + profile.runtime, "", ...contractMarkdown(moduleEntries, lang));
      }
      for (const entry of entries.filter(x=>x.id===mod.id)) {
        const doc = sourceDocs[entry.path];
        if (typeof doc !== "string" || !doc.trim()) throw Error("Missing/empty canonical source: " + entry.path);
        validateExamples(profile, doc, entry.path, scopedNames);
        parts.push("### " + (entry.kind==="reference" ? "API Reference" : "Learner Guide") + " — " + mod.id,
          "", "Canonical source: `" + entry.path + "`", "", doc.trim().replace(/\r\n?/g, "\n"), "");
      }
    }
    return parts.join("\n").replace(/\n+$/, "") + "\n";
  }
  return {render, renderDeveloper, renderBundleReadme, validateDeveloperProfile, paths, selectedModules, selectedMethodNames, resolveContract, validateProfile, validateExamples, isCandidate, normalizeMethod};
});
