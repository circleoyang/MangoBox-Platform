/* Temporary public documentation bridge for the 2026-09-06 Student API contract.
 * Source metadata and method patches live in data/api-contract-overlay-v20260906.json.
 */
(() => {
  "use strict";

  const overlayPromise = fetch("data/api-contract-overlay-v20260906.json")
    .then(response => {
      if (!response.ok) throw new Error(`api-contract-overlay-v20260906.json: ${response.status}`);
      return response.json();
    });

  let overlayData = null;

  async function applyOverlay() {
    if (window.MANGO_API_CONTRACT_OVERLAY?.applied || window.MANGO_API_CONTRACT_OVERLAY?.failed) return;

    if (!overlayData) {
      try {
        overlayData = await overlayPromise;
      } catch (error) {
        console.error(error);
        window.MANGO_API_CONTRACT_OVERLAY = {
          applied: false,
          failed: true,
          fallback: "base-api-index"
        };
        window.dispatchEvent(new CustomEvent("mango-api-contract-ready"));
        return;
      }
    }

    if (typeof state === "undefined" || !Array.isArray(state.api) || !state.api.length) {
      window.setTimeout(applyOverlay, 25);
      return;
    }

    const byName = new Map(state.api.map(entry => [entry.name, entry]));
    for (const patch of overlayData.entries || []) {
      if (!patch?.name) continue;
      byName.set(patch.name, {...(byName.get(patch.name) || {}), ...patch});
    }
    state.api = [...byName.values()];

    window.MANGO_API_CONTRACT_OVERLAY = {
      applied: true,
      failed: false,
      source: overlayData.source_private_pr,
      source_head: overlayData.source_head,
      source_date: overlayData.source_date,
      expected_public_methods: overlayData.expected_public_methods,
      deferred_not_promoted: overlayData.deferred_not_promoted || [],
      count: state.api.length
    };

    if (overlayData.expected_public_methods && state.api.length !== overlayData.expected_public_methods) {
      console.error(
        `MangoBox API contract overlay count mismatch: ${state.api.length} != ${overlayData.expected_public_methods}`
      );
    }

    // If a Reference page rendered before the overlay was applied, force the
    // stable shell to render once more. Structured detail observers rebuild
    // against the corrected method set; search reads state.api dynamically.
    if (state.view === "reference" && state.module && typeof renderDocs === "function") {
      document.querySelector("[data-generated-api-details]")?.remove();
      renderDocs();
    }

    window.dispatchEvent(new CustomEvent("mango-api-contract-ready"));
  }

  applyOverlay();
})();
