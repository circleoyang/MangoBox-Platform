/* Temporary public documentation bridge for the 2026-09-06 Student API contract.
 * Source metadata and method patches live in data/api-contract-overlay-v20260906.json.
 */
(() => {
  "use strict";

  let overlayData = null;

  async function loadOverlay() {
    if (overlayData) return overlayData;
    const response = await fetch("data/api-contract-overlay-v20260906.json");
    if (!response.ok) throw new Error(`api-contract-overlay-v20260906.json: ${response.status}`);
    overlayData = await response.json();
    return overlayData;
  }

  async function applyOverlay() {
    if (typeof state === "undefined" || !Array.isArray(state.api) || !state.api.length) {
      window.setTimeout(applyOverlay, 25);
      return;
    }
    if (window.MANGO_API_CONTRACT_OVERLAY?.applied) return;

    let data;
    try {
      data = await loadOverlay();
    } catch (error) {
      console.error(error);
      return;
    }

    const byName = new Map(state.api.map(entry => [entry.name, entry]));
    for (const patch of data.entries || []) {
      if (!patch?.name) continue;
      byName.set(patch.name, {...(byName.get(patch.name) || {}), ...patch});
    }
    state.api = [...byName.values()];

    window.MANGO_API_CONTRACT_OVERLAY = {
      applied: true,
      source: data.source_private_pr,
      source_head: data.source_head,
      source_date: data.source_date,
      expected_public_methods: data.expected_public_methods,
      deferred_not_promoted: data.deferred_not_promoted || [],
      count: state.api.length
    };

    if (data.expected_public_methods && state.api.length !== data.expected_public_methods) {
      console.error(
        `MangoBox API contract overlay count mismatch: ${state.api.length} != ${data.expected_public_methods}`
      );
    }

    // If a Reference page rendered before the overlay was applied, force the
    // stable shell to render once more. Structured detail observers rebuild
    // against the corrected method set; search reads state.api dynamically.
    if (state.view === "reference" && state.module && typeof renderDocs === "function") {
      document.querySelector("[data-generated-api-details]")?.remove();
      renderDocs();
    }
  }

  applyOverlay();
})();
