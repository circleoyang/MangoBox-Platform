/* MangoBox BLE Control v1 public documentation overlay — 2026-09-13. */
(() => {
  "use strict";

  const overlayPromise = fetch("data/ble-control-api-overlay-v20260913.json")
    .then(response => {
      if (!response.ok) throw new Error(`ble-control-api-overlay-v20260913.json: ${response.status}`);
      return response.json();
    });

  let applied = false;
  let overlayData = null;

  async function applyBleOverlay() {
    if (applied) return;
    if (!overlayData) {
      try {
        overlayData = await overlayPromise;
      } catch (error) {
        console.error(error);
        window.MANGO_BLE_CONTROL_API_OVERLAY = {applied:false, failed:true};
        return;
      }
    }

    if (typeof state === "undefined" || !Array.isArray(state.api) || !state.api.length) {
      window.setTimeout(applyBleOverlay, 25);
      return;
    }

    const byName = new Map(state.api.map(entry => [entry.name, entry]));
    for (const entry of overlayData.entries || []) {
      if (entry?.name) byName.set(entry.name, {...(byName.get(entry.name) || {}), ...entry});
    }
    state.api = [...byName.values()];
    applied = true;

    window.MANGO_BLE_CONTROL_API_OVERLAY = {
      applied: true,
      failed: false,
      source_date: overlayData.source_date,
      runtime: overlayData.runtime,
      expected_total_public_methods: overlayData.expected_total_public_methods,
      methods: (overlayData.entries || []).map(entry => entry.name),
      count: state.api.length
    };

    if (overlayData.expected_total_public_methods && state.api.length !== overlayData.expected_total_public_methods) {
      console.error(
        `MangoBox BLE API overlay count mismatch: ${state.api.length} != ${overlayData.expected_total_public_methods}`
      );
    }

    if (state.view === "reference" && state.module === "ble-control" && typeof renderDocs === "function") {
      document.querySelector("[data-generated-api-details]")?.remove();
      renderDocs();
    }
    if (typeof renderSearch === "function") renderSearch();
  }

  window.addEventListener("mango-api-contract-ready", applyBleOverlay, {once: true});
  applyBleOverlay();
})();
