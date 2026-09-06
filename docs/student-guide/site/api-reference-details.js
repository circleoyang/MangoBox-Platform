/* Structured method details for MangoBox API Reference pages.
 *
 * The module Markdown remains the place for hardware/mode-specific discussion.
 * This layer provides one consistent method-by-method surface (signature,
 * parameters, return semantics, and runnable example) from the public API
 * index plus a shared parameter glossary.
 */
(() => {
  "use strict";

  let parameterHelp = null;

  const EXAMPLE_VALUES = {
    index: "0",
    color: '"blue"',
    sensor: '"button"',
    callback: "handler",
    frequency: "440",
    song: '"happy_birthday"',
    notes: '[["C4", 200], ["E4", 200], ["G4", 300]]',
    name: '"coin"',
    angle: "90",
    text: '"Hello"',
    key: '"ok"',
    speed: "70",
    outer_speed: "80",
    inner_speed: "50",
    left: "60",
    right: "60",
    motor: '"M1"',
    distance_cm: "20",
    threshold: "60",
    capability: '"led"',
    command: '{"target": "system", "action": "info"}'
  };

  const EXAMPLE_OVERRIDES = {
    select_led_strip: 'm.select_led_strip("external")',
    led: 'm.led(0, "red")',
    led_all: 'm.led_all("blue")',
    led_range: 'm.led_range(1, 4, "green")',
    brightness: 'm.brightness(60)',
    breath: 'm.breath("#0080ff", period=70)',
    led_start_breathing: 'm.led_start_breathing("#0080ff", period=70)',
    rainbow: 'm.rainbow(period=40)',
    led_start_rainbow: 'm.led_start_rainbow(period=40)',
    led_start_meteor: 'm.led_start_meteor("white", size=4, period=80)',
    led_start_color_wipe: 'm.led_start_color_wipe(["red", "green", "blue"], period=80)',
    led_start_random_sparkle: 'm.led_start_random_sparkle("white", period=100)',
    led_start_fire_flicker: 'm.led_start_fire_flicker("#ff6600", period=70)',
    tone: 'm.tone(440, duration=300)',
    play_song: 'm.play_song("happy_birthday")',
    music: 'm.music([["C4", 200], ["E4", 200], ["G4", 300]])',
    play_sound: 'm.play_sound("coin")',
    servo: 'm.servo(90)',
    servo_move_to: 'm.servo_move_to(120, step=5, period=60)',
    servo_sweep: 'm.servo_sweep(20, 160, step=5, period=50)',
    text: 'm.text("Hello MangoBox", x=0, y=0, size=1)',
    flash_text: 'm.flash_text("Ready", period=500)',
    read_button: 'print(m.read_button())',
    when_pressed: 'def handler():\n    print("pressed")\n\nm.when_pressed(callback=handler)',
    when_released: 'def handler():\n    print("released")\n\nm.when_released(callback=handler)',
    is_ir_pressed: 'print(m.is_ir_pressed("ok"))',
    forward: 'm.forward(70)',
    backward: 'm.backward(70)',
    arc_left: 'm.arc_left(80, 50)',
    arc_right: 'm.arc_right(80, 50)',
    drive_tank: 'm.drive_tank(60, 60)',
    motor_run: 'm.motor_run("M1", 70)',
    distance: 'print(m.distance())',
    is_near: 'print(m.is_near(20))',
    is_blocked: 'print(m.is_blocked())',
    block_state: 'print(m.block_state())',
    light: 'print(m.light())',
    sound_level: 'print(m.sound_level())',
    joystick: 'print(m.joystick())',
    line_left: 'print(m.line_left())',
    line_right: 'print(m.line_right())',
    line_state: 'print(m.line_state())',
    is_motion_detected: 'print(m.is_motion_detected())'
  };

  const RETURN_HELP = {
    select_led_strip: {
      "zh-TW": "回傳目前選定的預設 LED strip 名稱。",
      en: "Returns the currently selected default LED strip name."
    },
    read_button: {
      "zh-TW": "回傳按鈕目前狀態；目前教學語意可視為 0/1（未按下/按下）。",
      en: "Returns the current button state; learner-facing semantics use 0/1 (released/pressed)."
    },
    read_sensor: {
      "zh-TW": "回傳命名數位感測器的目前狀態。",
      en: "Returns the current state of the named digital sensor."
    },
    servo_get_angle: {
      "zh-TW": "回傳目前或最近可確認的 Servo 角度；無法確認時回傳 None。",
      en: "Returns the current/latest confirmed servo angle, or None when it cannot be confirmed."
    },
    is_ir_pressed: {"zh-TW": "回傳 bool。", en: "Returns bool."},
    distance: {
      "zh-TW": "回傳距離（cm）；沒有有效回波時可為 None。",
      en: "Returns distance in centimeters; may be None when no valid echo is available."
    },
    is_near: {"zh-TW": "回傳 bool。", en: "Returns bool."},
    line_left: {"zh-TW": "回傳左循跡感測器的布林狀態。", en: "Returns the left line sensor state as bool."},
    line_right: {"zh-TW": "回傳右循跡感測器的布林狀態。", en: "Returns the right line sensor state as bool."},
    line_state: {
      "zh-TW": "回傳 none / left / right / both 其中一種狀態字串。",
      en: "Returns one of the state strings none / left / right / both."
    },
    is_blocked: {"zh-TW": "回傳 bool。", en: "Returns bool."},
    block_state: {"zh-TW": "回傳 blocked 或 clear。", en: "Returns blocked or clear."},
    is_motion_detected: {"zh-TW": "回傳 bool。", en: "Returns bool."},
    light: {
      "zh-TW": "回傳校準後 0～100 相對亮度；不是 lux。",
      en: "Returns calibrated relative light level 0 to 100; this is not lux."
    },
    sound_level: {
      "zh-TW": "回傳 0～100 相對聲音強度；不是 dB。",
      en: "Returns relative sound level 0 to 100; this is not dB."
    },
    joystick: {
      "zh-TW": "回傳標準化的 Joystick X/Y 值；按鍵狀態使用對應的 pressed API 查詢。",
      en: "Returns normalized joystick X/Y values; use the corresponding pressed API for switch state."
    },
    supports: {"zh-TW": "回傳 bool。", en: "Returns bool."},
    capabilities: {"zh-TW": "回傳可用 capability 名稱清單。", en: "Returns a list of available capability names."}
  };

  function html(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    })[ch]);
  }

  function methodId(name) {
    return "api-" + String(name || "")
      .trim().toLowerCase().replace(/_/g, "-")
      .replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function splitParameters(raw) {
    const parts = [];
    let token = "";
    let depth = 0;
    let quote = null;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (quote) {
        token += ch;
        if (ch === quote && raw[i - 1] !== "\\") quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        token += ch;
      } else if ("([{<".includes(ch)) {
        depth += 1;
        token += ch;
      } else if (")]}>".includes(ch)) {
        depth = Math.max(0, depth - 1);
        token += ch;
      } else if (ch === "," && depth === 0) {
        if (token.trim()) parts.push(token.trim());
        token = "";
      } else {
        token += ch;
      }
    }
    if (token.trim()) parts.push(token.trim());
    return parts;
  }

  function parseSignature(signature) {
    const text = String(signature || "");
    const open = text.indexOf("(");
    const close = text.lastIndexOf(")");
    if (open < 0 || close < open) return [];
    const raw = text.slice(open + 1, close).trim();
    if (!raw) return [];
    return splitParameters(raw).map(part => {
      const eq = part.indexOf("=");
      const left = (eq >= 0 ? part.slice(0, eq) : part).trim();
      const name = left.replace(/^\*+/, "").split(":", 1)[0].trim();
      return {
        name,
        defaultValue: eq >= 0 ? part.slice(eq + 1).trim() : null,
        required: eq < 0
      };
    }).filter(param => param.name);
  }

  function parameterDescription(name) {
    const record = parameterHelp?.parameters?.[name];
    if (!record) {
      return state.lang === "zh-TW"
        ? "此參數依目前 method 語意使用；請參考下方模組說明。"
        : "This parameter follows the current method semantics; see the module notes below.";
    }
    return record[state.lang] || record.en || "";
  }

  function generatedExample(entry, params) {
    if (EXAMPLE_OVERRIDES[entry.name]) return EXAMPLE_OVERRIDES[entry.name];
    const required = params.filter(param => param.required);
    const hasCallback = required.some(param => param.name === "callback");
    const args = required.map(param => EXAMPLE_VALUES[param.name] || "value");
    const call = `m.${entry.name}(${args.join(", ")})`;
    if (hasCallback) return `def handler():\n    print("event")\n\n${call}`;
    if (/^(read_|is_|line_|block_state$|distance$|light$|sound_level$|joystick$)/.test(entry.name)) {
      return `print(${call})`;
    }
    return call;
  }

  function returnDescription(entry) {
    const record = RETURN_HELP[entry.name];
    if (record) return record[state.lang] || record.en;
    return state.lang === "zh-TW"
      ? "此 method 主要執行控制、設定或註冊事件；一般不需要使用回傳值。"
      : "This method primarily performs control, configuration, or event registration; learner code normally does not use a return value.";
  }

  function renderParameterTable(params) {
    if (!params.length) {
      return `<p class="muted">${state.lang === "zh-TW" ? "參數：無。" : "Parameters: none."}</p>`;
    }
    const head = state.lang === "zh-TW"
      ? "<tr><th>參數</th><th>預設值</th><th>說明</th></tr>"
      : "<tr><th>Parameter</th><th>Default</th><th>Description</th></tr>";
    const rows = params.map(param => `<tr>
      <td><code>${html(param.name)}</code></td>
      <td>${param.required ? (state.lang === "zh-TW" ? "必填" : "required") : `<code>${html(param.defaultValue)}</code>`}</td>
      <td>${html(parameterDescription(param.name))}</td>
    </tr>`).join("");
    return `<table><thead>${head}</thead><tbody>${rows}</tbody></table>`;
  }

  function renderMethodCard(entry) {
    const params = parseSignature(entry.signature);
    const summary = state.lang === "zh-TW" ? entry.zh : entry.en;
    const exampleLabel = state.lang === "zh-TW" ? "最小範例" : "Minimal example";
    const returnLabel = state.lang === "zh-TW" ? "回傳" : "Returns";
    return `<section class="generated-method-card">
      <h3 id="${methodId(entry.name)}"><code>${html(entry.name)}()</code></h3>
      <p>${html(summary)}</p>
      <pre><code>${html(entry.signature)}</code></pre>
      ${renderParameterTable(params)}
      <p><strong>${html(returnLabel)}：</strong>${html(returnDescription(entry))}</p>
      <h4>${html(exampleLabel)}</h4>
      <pre><code>${html(generatedExample(entry, params))}</code></pre>
    </section>`;
  }

  function renderDetails() {
    const content = document.getElementById("docContent");
    if (!content || typeof state === "undefined" || state.view !== "reference" || !state.module) return;
    if (!content.querySelector("h1,h2,h3")) return; // Still loading or unavailable.
    if (content.querySelector("[data-generated-api-details]")) return;

    const entries = state.api.filter(entry => entry.module === state.module);
    if (!entries.length) return;

    const title = state.lang === "zh-TW" ? "Method Quick Reference" : "Method Quick Reference";
    const lead = state.lang === "zh-TW"
      ? "以下內容由目前公開 Student API method index 產生，統一列出 signature、參數、回傳語意與最小範例；下方原有 Reference 則保留模組與模式特有的補充說明。"
      : "The following section is generated from the current public Student API method index and consistently shows signatures, parameters, return semantics, and minimal examples. The original Reference below keeps module- and mode-specific notes.";

    const wrapper = document.createElement("section");
    wrapper.dataset.generatedApiDetails = "1";
    wrapper.className = "generated-api-details";
    wrapper.innerHTML = `<h2>${html(title)}</h2><p>${html(lead)}</p>${entries.map(renderMethodCard).join("")}<hr>`;
    content.insertBefore(wrapper, content.firstChild);
  }

  function installStyles() {
    if (document.getElementById("apiReferenceDetailsStyles")) return;
    const style = document.createElement("style");
    style.id = "apiReferenceDetailsStyles";
    style.textContent = `
      .generated-api-details{margin-bottom:2rem}
      .generated-method-card{padding:1rem 0 1.35rem;border-bottom:1px solid rgba(127,127,127,.22)}
      .generated-method-card h3{scroll-margin-top:7rem}
      .generated-method-card h4{margin:.8rem 0 .35rem}
      .generated-method-card table{margin:.65rem 0}
    `;
    document.head.appendChild(style);
  }

  async function loadParameterHelp() {
    if (parameterHelp) return parameterHelp;
    const response = await fetch("data/api-parameter-help.json");
    if (!response.ok) throw new Error(`api-parameter-help.json: ${response.status}`);
    parameterHelp = await response.json();
    return parameterHelp;
  }

  async function install() {
    const content = document.getElementById("docContent");
    if (!content) return;
    try {
      await loadParameterHelp();
    } catch (error) {
      console.error(error);
      return;
    }
    installStyles();
    new MutationObserver(() => window.setTimeout(renderDetails, 0))
      .observe(content, { childList: true, subtree: false });
    renderDetails();
  }

  function waitForApp() {
    if (typeof state !== "undefined" && Array.isArray(state.api) && state.api.length) {
      window.setTimeout(install, 0);
      return;
    }
    window.setTimeout(waitForApp, 40);
  }

  waitForApp();
})();
