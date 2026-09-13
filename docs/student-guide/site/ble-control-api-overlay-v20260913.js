/* MangoBox BLE Control v1 public documentation overlay — 2026-09-13.
 *
 * The public documentation shell already applies the 2026-09-06 Student API
 * contract overlay. This small additive overlay publishes only the six verified
 * MangoLite v0.6.3 BLE Control methods without duplicating the base API index.
 */
(() => {
  "use strict";

  const BLE_ENTRIES = [
    {
      module: "ble-control",
      name: "on_control",
      signature: "m.on_control(control, action, callback, controller=\"primary\")",
      zh: "註冊 BLE Control 正規化控制事件",
      en: "Register a normalized BLE Control event",
      aliases: ["BLE", "Dabble", "手機控制", "gamepad", "controller", "press", "release", "value"],
      role: "advanced"
    },
    {
      module: "ble-control",
      name: "on_control_pressed",
      signature: "m.on_control_pressed(control, callback, controller=\"primary\")",
      zh: "Dabble Digital Gamepad 指定按鍵按下時執行 callback",
      en: "Run a callback when a Dabble Digital Gamepad control is pressed",
      aliases: ["BLE", "Dabble", "Gamepad", "手機遙控", "按下", "方向鍵", "up", "down", "left", "right"],
      role: "teaching"
    },
    {
      module: "ble-control",
      name: "on_control_released",
      signature: "m.on_control_released(control, callback, controller=\"primary\")",
      zh: "Dabble Digital Gamepad 指定按鍵放開時執行 callback",
      en: "Run a callback when a Dabble Digital Gamepad control is released",
      aliases: ["BLE", "Dabble", "Gamepad", "手機遙控", "放開", "release"],
      role: "teaching"
    },
    {
      module: "ble-control",
      name: "on_control_joystick",
      signature: "m.on_control_joystick(callback, controller=\"primary\")",
      zh: "接收 Dabble Analog Joystick 的 angle 與 radius",
      en: "Receive angle and radius from the Dabble Analog Joystick",
      aliases: ["BLE", "Dabble", "Analog", "joystick", "搖桿", "angle", "radius", "色相環"],
      role: "teaching"
    },
    {
      module: "ble-control",
      name: "control_name",
      signature: "m.control_name()",
      zh: "取得目前有效的 BLE Control 裝置名稱",
      en: "Get the effective BLE Control device name",
      aliases: ["BLE name", "裝置名稱", "配對名稱", "Dabble", "device name"],
      role: "capability"
    },
    {
      module: "ble-control",
      name: "control_connected",
      signature: "m.control_connected()",
      zh: "檢查 primary BLE controller 是否已連線",
      en: "Check whether the primary BLE controller is connected",
      aliases: ["BLE connected", "連線狀態", "Dabble", "controller", "是否連線"],
      role: "capability"
    }
  ];

  let applied = false;

  function applyBleOverlay() {
    if (applied) return;
    if (typeof state === "undefined" || !Array.isArray(state.api) || !state.api.length) {
      window.setTimeout(applyBleOverlay, 25);
      return;
    }

    const byName = new Map(state.api.map(entry => [entry.name, entry]));
    for (const entry of BLE_ENTRIES) byName.set(entry.name, entry);
    state.api = [...byName.values()];
    applied = true;

    window.MANGO_BLE_CONTROL_API_OVERLAY = {
      applied: true,
      source_date: "2026-09-13",
      runtime: "0.6.3",
      methods: BLE_ENTRIES.map(entry => entry.name),
      count: state.api.length
    };

    if (state.view === "reference" && state.module === "ble-control" && typeof renderDocs === "function") {
      document.querySelector("[data-generated-api-details]")?.remove();
      renderDocs();
    }
    if (typeof renderSearch === "function") renderSearch();
  }

  window.addEventListener("mango-api-contract-ready", applyBleOverlay, {once: true});
  applyBleOverlay();
})();
