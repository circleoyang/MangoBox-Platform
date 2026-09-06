/* MangoBox method-level search enhancement.
 *
 * This file intentionally layers on top of app.js instead of replacing the
 * existing documentation shell. It improves search ranking and lets a search
 * result open the exact API heading inside the module Reference page.
 */
(() => {
  "use strict";

  const GENERIC_INTENT_WORDS = [
    "搜尋", "查詢", "查找", "查", "找", "我要", "我想", "想要",
    "怎麼", "如何", "的", "指令", "命令", "方法", "函式", "功能",
    "程式", "程式碼", "api", "function", "method", "command", "code"
  ];

  const METHOD_ID_PREFIX = "api-";

  function html(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[ch]);
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[()_.\-\/:,]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compact(value) {
    return normalizeText(value).replace(/\s+/g, "");
  }

  function simplifyIntent(value) {
    let text = String(value || "").toLowerCase();
    for (const word of GENERIC_INTENT_WORDS) {
      text = text.split(word).join(" ");
    }
    return text.replace(/\s+/g, " ").trim();
  }

  function methodId(name) {
    return METHOD_ID_PREFIX + String(name || "")
      .trim()
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function moduleFor(entry) {
    return state.modules.find(module => module.id === entry.module);
  }

  function entryAvailableInContext(entry) {
    const profile = activeProfile();
    if (!profile) return true;
    const module = moduleFor(entry);
    return Boolean(module && profile.capabilities.includes(module.capability));
  }

  function searchableFields(entry) {
    const module = moduleFor(entry);
    return [
      entry.name,
      entry.signature,
      entry.zh,
      entry.en,
      ...(entry.aliases || []),
      module?.labels?.["zh-TW"],
      module?.labels?.en,
      module?.summary?.["zh-TW"],
      module?.summary?.en
    ].filter(Boolean);
  }

  function intentAtoms(entry) {
    const module = moduleFor(entry);
    return [...new Set([
      entry.name,
      entry.zh,
      entry.en,
      ...(entry.aliases || []),
      module?.labels?.["zh-TW"],
      module?.labels?.en
    ].filter(Boolean).map(compact).filter(atom => atom.length >= 2 && atom.length <= 18))];
  }

  function queryVariants(raw) {
    const original = normalizeText(raw);
    const simplified = normalizeText(simplifyIntent(raw));
    return [...new Set([original, simplified].filter(Boolean))];
  }

  function scoreEntry(entry, rawQuery) {
    const variants = queryVariants(rawQuery);
    if (!variants.length) return null;

    const name = normalizeText(entry.name);
    const nameCompact = compact(entry.name);
    const signature = normalizeText(entry.signature);
    const aliases = (entry.aliases || []).map(normalizeText);
    const titles = [entry.zh, entry.en].filter(Boolean).map(normalizeText);
    const hay = normalizeText(searchableFields(entry).join(" "));
    const hayCompact = compact(searchableFields(entry).join(" "));
    const atoms = intentAtoms(entry);

    let best = null;
    for (const query of variants) {
      const qCompact = compact(query);
      if (!qCompact) continue;

      let score = 0;
      let matched = false;

      if (name === query || nameCompact === qCompact) {
        score += 120;
        matched = true;
      } else if (name.includes(query) || nameCompact.includes(qCompact)) {
        score += 72;
        matched = true;
      }

      if (aliases.some(alias => alias === query || compact(alias) === qCompact)) {
        score += 105;
        matched = true;
      } else if (aliases.some(alias => alias.includes(query) || compact(alias).includes(qCompact))) {
        score += 62;
        matched = true;
      }

      if (titles.some(title => title === query || compact(title) === qCompact)) {
        score += 90;
        matched = true;
      } else if (titles.some(title => title.includes(query) || compact(title).includes(qCompact))) {
        score += 55;
        matched = true;
      }

      if (signature.includes(query) || compact(signature).includes(qCompact)) {
        score += 48;
        matched = true;
      }

      // Chinese learners often type phrases without spaces (e.g. 呼吸燈的指令).
      // Compact matching plus removal of generic intent words keeps those
      // queries useful without requiring a heavyweight search dependency.
      if (hayCompact.includes(qCompact)) {
        score += 42;
        matched = true;
      }

      const words = query.split(" ").filter(Boolean);
      if (words.length && words.every(word => hay.includes(word) || hayCompact.includes(compact(word)))) {
        score += words.reduce((sum, word) => sum + Math.min(16, Math.max(4, word.length * 3)), 0);
        matched = true;
      }

      // Also support compact Chinese combinations such as "馬達前進" when
      // the index stores those learner intents as separate aliases.
      const coveredAtoms = atoms.filter(atom => qCompact.includes(atom));
      const coveredLength = coveredAtoms.reduce((sum, atom) => sum + atom.length, 0);
      if (coveredAtoms.length && coveredLength >= Math.max(2, Math.ceil(qCompact.length * 0.6))) {
        score += 36 + Math.min(30, coveredLength * 4);
        matched = true;
      }

      if (matched && (best === null || score > best)) best = score;
    }

    return best;
  }

  function rankedResults(rawQuery) {
    return state.api
      .filter(entryAvailableInContext)
      .map(entry => ({ entry, score: scoreEntry(entry, rawQuery) }))
      .filter(item => item.score !== null)
      .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
      .slice(0, 16);
  }

  function renderMethodSearch() {
    const input = document.getElementById("apiSearch");
    const section = document.getElementById("searchSection");
    const results = document.getElementById("searchResults");
    const count = document.getElementById("searchCount");
    if (!input || !section || !results || !count) return;

    const raw = input.value.trim();
    if (!raw) {
      section.classList.add("hidden");
      results.innerHTML = "";
      return;
    }

    const ranked = rankedResults(raw);
    section.classList.remove("hidden");
    count.textContent = String(ranked.length);

    if (!ranked.length) {
      results.innerHTML = `<p class="muted">${html(t("noResult"))}</p>`;
      return;
    }

    const openLabel = state.lang === "zh-TW" ? "直接開啟 API" : "Open API";
    const referenceLabel = "API Reference";

    results.innerHTML = ranked.map(({ entry }) => {
      const module = moduleFor(entry);
      const moduleLabel = module?.labels?.[state.lang] || module?.labels?.en || entry.module;
      const summary = state.lang === "zh-TW" ? entry.zh : entry.en;
      return `<article class="api-result method-result">
        <div class="method-result-main">
          <code>${html(entry.signature)}</code>
          <p><strong>${html(summary)}</strong><br><small>${html(referenceLabel)} · ${html(moduleLabel)}</small></p>
        </div>
        <button type="button" data-api-name="${html(entry.name)}">${html(openLabel)}</button>
      </article>`;
    }).join("");

    results.querySelectorAll("[data-api-name]").forEach(button => {
      button.addEventListener("click", () => {
        const entry = state.api.find(item => item.name === button.dataset.apiName);
        if (entry) openMethod(entry, true);
      });
    });
  }

  function methodNamesFromHeading(heading) {
    return [...heading.querySelectorAll("code")]
      .map(code => String(code.textContent || "").trim().replace(/\(\)$/, ""))
      .filter(name => state.api.some(entry => entry.name === name));
  }

  function ensureMethodAnchors() {
    const content = document.getElementById("docContent");
    if (!content) return;
    content.querySelectorAll("h2,h3,h4").forEach(heading => {
      for (const name of methodNamesFromHeading(heading)) {
        const id = methodId(name);
        if (document.getElementById(id)) continue;
        const anchor = document.createElement("span");
        anchor.id = id;
        anchor.className = "api-method-anchor";
        anchor.dataset.apiName = name;
        heading.parentNode.insertBefore(anchor, heading);
      }
    });
  }

  function findMethodHeading(name) {
    const content = document.getElementById("docContent");
    if (!content) return null;
    for (const heading of content.querySelectorAll("h2,h3,h4")) {
      if (methodNamesFromHeading(heading).includes(name)) return heading;
    }
    return null;
  }

  function highlightHeading(heading) {
    if (!heading) return;
    document.querySelectorAll(".api-method-highlight").forEach(node => node.classList.remove("api-method-highlight"));
    heading.classList.add("api-method-highlight");
    window.setTimeout(() => heading.classList.remove("api-method-highlight"), 2200);
  }

  function scrollToMethod(name, attempt = 0) {
    ensureMethodAnchors();
    const anchor = document.getElementById(methodId(name));
    const heading = findMethodHeading(name);
    if (anchor || heading) {
      (anchor || heading).scrollIntoView({ behavior: "smooth", block: "start" });
      highlightHeading(heading);
      return;
    }
    if (attempt < 30) window.setTimeout(() => scrollToMethod(name, attempt + 1), 80);
  }

  function replaceMethodUrl(entry) {
    const params = new URLSearchParams(location.search);
    params.set("lang", state.lang);
    if (state.target) params.set("target", state.target); else params.delete("target");
    params.set("mode", state.mode);
    params.set("module", entry.module);
    params.set("view", "reference");
    params.set("api", entry.name);
    history.replaceState(null, "", `${location.pathname}?${params.toString()}#${methodId(entry.name)}`);
  }

  function openMethod(entry, updateUrl) {
    state.module = entry.module;
    state.view = "reference";
    document.getElementById("homePanel")?.classList.add("hidden");
    document.getElementById("setupPanel")?.classList.add("hidden");
    document.getElementById("docsShell")?.classList.remove("hidden");
    renderDocs();
    if (updateUrl) replaceMethodUrl(entry);
    scrollToMethod(entry.name);
  }

  function installStyles() {
    if (document.getElementById("methodSearchStyles")) return;
    const style = document.createElement("style");
    style.id = "methodSearchStyles";
    style.textContent = `
      .method-result{align-items:center;gap:1rem}
      .method-result-main{min-width:0;flex:1}
      .method-result-main code{overflow-wrap:anywhere}
      .method-result-main small{opacity:.72}
      .api-method-anchor{display:block;height:0;scroll-margin-top:7rem}
      .api-method-highlight{outline:2px solid currentColor;outline-offset:.45rem;border-radius:.2rem}
    `;
    document.head.appendChild(style);
  }

  function installSearchEnhancement() {
    const input = document.getElementById("apiSearch");
    const hints = document.getElementById("searchHints");
    const clear = document.getElementById("clearSearch");
    const content = document.getElementById("docContent");
    if (!input || !hints || !clear || !content) return;

    installStyles();

    // app.js has already bound its handlers when state.api is populated.
    // Registering these handlers afterwards intentionally makes this renderer
    // the final search presentation without modifying the stable shell.
    input.addEventListener("input", renderMethodSearch);
    hints.addEventListener("click", event => {
      if (event.target.closest("button[data-q]")) window.setTimeout(renderMethodSearch, 0);
    });
    clear.addEventListener("click", () => window.setTimeout(renderMethodSearch, 0));

    new MutationObserver(ensureMethodAnchors).observe(content, { childList: true, subtree: true });

    const params = new URLSearchParams(location.search);
    const requested = params.get("api") || (location.hash.startsWith(`#${METHOD_ID_PREFIX}`)
      ? location.hash.slice(METHOD_ID_PREFIX.length + 1).replace(/-/g, "_")
      : null);
    if (requested) {
      const entry = state.api.find(item => item.name === requested);
      if (entry && entryAvailableInContext(entry)) openMethod(entry, false);
    }
  }

  function waitForApp() {
    if (typeof state !== "undefined" && Array.isArray(state.api) && state.api.length && typeof renderDocs === "function") {
      // Timers cannot interleave with init()'s synchronous bind/render calls;
      // reaching this point therefore means app.js has finished installing its
      // own handlers for the resolved data set.
      window.setTimeout(installSearchEnhancement, 0);
      return;
    }
    window.setTimeout(waitForApp, 40);
  }

  waitForApp();
})();
