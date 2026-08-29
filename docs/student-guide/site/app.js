const I18N = {
  "zh-TW": {
    setupEyebrow: "開始前先確認",
    setupTitle: "選擇你手上的 MangoBox",
    setupBody: "文件會依照硬體、程式方式與軟體版本，只顯示你這一套真正可以使用的 API。",
    hardwareTitle: "硬體版本", modeTitle: "程式方式", versionTitle: "軟體版本",
    enterDocs: "開啟使用文件", versionHint: "預設顯示目前課程建議版本；舊版文件之後可由此切換。",
    modules: "功能模組", tools: "工具操作", guide: "使用指南", troubleshooting: "問題排除",
    footerNote: "本頁以 compatibility profile 過濾內容；裝置 Enable 狀態不等於 API 是否存在。",
    changeContext: "變更環境", supported: "此版本支援", supportedDisabled: "支援，但目前未啟用", unavailable: "此版本不支援",
    loading: "載入文件中…", loadError: "文件載入失敗。請確認文件路徑與版本設定。",
    currentPin: "目前設定 Pin（腳位）",
    disabledNotice: "此版本支援這個模組，但目前連線裝置顯示為未啟用。請先在 Device Manager 啟用，再確認 Pin（腳位）與真機接線。",
    unsupportedTitle: "這個環境目前沒有這項 Student API",
    unsupportedBody: "你選擇的硬體、程式方式或軟體版本沒有完整 learner API path，因此本頁不會把設定檔中的欄位誤當成可用 API。",
    chooseSupported: "請從左側選擇目前版本支援的功能。", profile: "軟體",
    modeHigh: "High Level MicroPython", modeHighDesc: "程式直接執行在 Pico 上，適合裝置端互動作品。",
    modeHost: "Host Python", modeHostDesc: "Python 執行在電腦上，再透過 MangoBox Runtime 控制硬體。",
    troubleshootingIntro: "請依順序檢查，不要一開始就改大量程式。每一步都先確認，再往下一層。",
    stepApi: "確認 API 是否支援", stepApiBody: "先用 supports() 判斷目前 target／mode／version 是否有這項語意 API。",
    stepEnable: "確認模組是否 Enable", stepEnableBody: "API 存在不代表目前裝置已啟用選配模組。請檢查 Runtime 設定。",
    stepPin: "確認 GPIO（General-Purpose Input/Output，通用輸入輸出）／Pin（腳位）", stepPinBody: "確認設定值與你實際接線使用的 Pin 完全相同。",
    stepDM: "到 Device Manager 核對設定", stepDMBody: "確認模組 Enabled、Pin 與其他必要參數。設定正確後再做最小診斷。",
    stepRaw: "執行最小 raw 診斷程式", stepRawBody: "依模組使用最小 GPIO、ADC 或 I2C 檢查，先確認實際 raw signal（原始訊號）是否會變化。",
    stepWire: "檢查真機接線與供電", stepWireBody: "確認 VCC、GND、Signal、Pin、訊號方向與模組方向。",
    diagnostic: "最小診斷程式", moduleDiagnostic: "這個模組的診斷程式",
    lifecycleEscalation: "如果 raw 訊號與接線都正常，但 firmware、execution mode、Recovery 或 Clean Flash 狀態異常，再使用 Hardware Lab 做裝置生命週期診斷。",
    noDeviceContext: "目前是一般線上文件，沒有連線裝置狀態。若由 Device Manager 開啟，可在這裡顯示目前 Enable 與 Pin。"
  },
  en: {
    setupEyebrow: "Before you start", setupTitle: "Choose the MangoBox you are using",
    setupBody: "The documentation filters by hardware, programming mode, and software version so you only see APIs that belong to your environment.",
    hardwareTitle: "Hardware", modeTitle: "Programming mode", versionTitle: "Software version",
    enterDocs: "Open documentation", versionHint: "The recommended classroom profile is selected by default. Historical versions can be added here later.",
    modules: "Modules", tools: "Tools", guide: "Guide", troubleshooting: "Troubleshooting",
    footerNote: "Content is filtered by compatibility profile; device enablement is not the same as API existence.",
    changeContext: "Change environment", supported: "Supported", supportedDisabled: "Supported, currently disabled", unavailable: "Not available",
    loading: "Loading documentation…", loadError: "Could not load the documentation. Check the document path and selected version.",
    currentPin: "Configured pin",
    disabledNotice: "This profile supports the module, but the connected-device context says it is disabled. Enable it in Device Manager, then verify the configured pin and physical wiring.",
    unsupportedTitle: "This Student API is not available in the selected environment",
    unsupportedBody: "The selected hardware, programming mode, or software version does not have a complete learner API path. Configuration fields alone are not treated as API support.",
    chooseSupported: "Choose a supported module from the navigation.", profile: "Software",
    modeHigh: "High Level MicroPython", modeHighDesc: "The program runs directly on the Pico for device-side interactive projects.",
    modeHost: "Host Python", modeHostDesc: "Python runs on the computer and controls hardware through the MangoBox Runtime.",
    troubleshootingIntro: "Check these layers in order. Confirm each layer before rewriting a large amount of code.",
    stepApi: "Check API support", stepApiBody: "Use supports() first to verify that the selected target/mode/version provides this semantic API.",
    stepEnable: "Check module enablement", stepEnableBody: "An API can exist even when an optional module is currently disabled in the device configuration.",
    stepPin: "Check GPIO / pin configuration", stepPinBody: "The configured pin must match the pin used by the physical signal wire.",
    stepDM: "Verify settings in Device Manager", stepDMBody: "Check Enabled state, pin assignment, and other required parameters before running a minimal diagnostic.",
    stepRaw: "Run a minimal raw diagnostic", stepRawBody: "Use a small GPIO, ADC, or I2C check appropriate for the module to verify that the raw physical signal changes.",
    stepWire: "Check physical wiring and power", stepWireBody: "Verify VCC, GND, Signal, pin assignment, signal direction, and module orientation.",
    diagnostic: "Minimal diagnostic program", moduleDiagnostic: "Module-specific diagnostic",
    lifecycleEscalation: "If raw signals and wiring are healthy but firmware, execution mode, Recovery, or Clean Flash state is abnormal, use Hardware Lab for device-lifecycle diagnostics.",
    noDeviceContext: "This is generic online documentation and no connected-device state was provided. Device Manager may deep-link with Enable/pin context."
  }
};

const TARGETS = {
  "mangox2-pico": { product: "MangoX2", board: "Raspberry Pi Pico", mcu: "RP2040" },
  "mangox2-pico2w": { product: "MangoX2", board: "Raspberry Pi Pico 2 W", mcu: "RP2350" },
  "mangolite-pico2w": { product: "MangoLite", board: "Raspberry Pi Pico 2 W", mcu: "RP2350" }
};
const MODES = {
  high_level_micropython: { title: "modeHigh", desc: "modeHighDesc" },
  host_python: { title: "modeHost", desc: "modeHostDesc" }
};
const state = { lang:"zh-TW", target:null, mode:null, profileId:null, module:null, view:"guide", profiles:[], recommended:{}, modules:[], device:{moduleEnabled:null,pins:{}} };
const $ = id => document.getElementById(id);
const text = key => (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;

async function init(){
  try{
    const [p,m]=await Promise.all([fetch("data/profiles.json").then(r=>r.json()),fetch("data/modules.json").then(r=>r.json())]);
    state.profiles=p.profiles; state.recommended=p.recommended; state.modules=m.modules;
    readUrlState(); bindEvents(); applyLanguage(); renderSetup();
    if(validContext()) openDocs(false);
  }catch(error){ console.error(error); document.body.innerHTML=`<main><div class="unavailable"><h1>MangoBox Docs</h1><p>${text("loadError")}</p></div></main>`; }
}

function readUrlState(){
  const p=new URLSearchParams(location.search); const lang=p.get("lang");
  if(lang==="zh-TW"||lang==="en") state.lang=lang;
  state.target=p.get("target")||null; state.mode=p.get("mode")||null; state.profileId=p.get("profile")||null; state.module=p.get("module")||null;
  state.view=["guide","troubleshooting","reference"].includes(p.get("view"))?p.get("view"):"guide";
  if(p.has("module_enabled")) state.device.moduleEnabled=["1","true","yes"].includes(String(p.get("module_enabled")).toLowerCase());
  for(const [k,v] of p.entries()) if(k.endsWith("_pin")&&/^-?\d+$/.test(v)) state.device.pins[k]=Number(v);
}
function bindEvents(){
  document.querySelectorAll("[data-lang]").forEach(b=>b.addEventListener("click",()=>{state.lang=b.dataset.lang;applyLanguage();renderSetup();if(!$("docsShell").classList.contains("hidden"))renderDocs();syncUrl();}));
  $("contextButton").addEventListener("click",()=>{$("docsShell").classList.add("hidden");$("contextStrip").classList.add("hidden");$("setupPanel").classList.remove("hidden");renderSetup();scrollTo({top:0,behavior:"smooth"});});
  $("enterDocs").addEventListener("click",()=>openDocs(true));
  $("profileSelect").addEventListener("change",e=>state.profileId=e.target.value);
  $("viewTabs").addEventListener("click",e=>{const b=e.target.closest("button[data-view]");if(!b)return;state.view=b.dataset.view;renderDocs();syncUrl();});
}
function applyLanguage(){
  document.documentElement.lang=state.lang==="zh-TW"?"zh-Hant":"en";
  document.querySelectorAll("[data-i18n]").forEach(n=>n.textContent=text(n.dataset.i18n));
  document.querySelectorAll("[data-lang]").forEach(b=>b.classList.toggle("active",b.dataset.lang===state.lang));
  $("contextButton").textContent=text("changeContext");
}
function profilesFor(target,mode){return state.profiles.filter(p=>p.target===target&&(!mode||p.mode===mode));}
function recommendedProfileId(target,mode){return state.recommended[target]&&state.recommended[target][mode];}
function currentProfile(){return state.profiles.find(p=>p.id===state.profileId)||null;}
function validContext(){const p=currentProfile();return !!(state.target&&state.mode&&p&&p.target===state.target&&p.mode===state.mode);}

function renderSetup(){
  $("targetCards").innerHTML="";
  Object.entries(TARGETS).forEach(([id,t])=>{
    const b=document.createElement("button");b.type="button";b.className="choice-card"+(state.target===id?" selected":"");
    b.innerHTML=`<strong>${t.product} + ${t.board.replace("Raspberry Pi ","")}</strong><span>${t.board}</span><small>${t.mcu}</small>`;
    b.addEventListener("click",()=>{state.target=id;if(!profilesFor(id,state.mode).length)state.mode=null;state.profileId=null;renderSetup();});$("targetCards").appendChild(b);
  });
  $("modeStep").classList.toggle("hidden",!state.target); $("modeCards").innerHTML="";
  if(state.target) Object.entries(MODES).forEach(([id,meta])=>{const b=document.createElement("button");b.type="button";b.className="choice-card"+(state.mode===id?" selected":"");b.innerHTML=`<strong>${text(meta.title)}</strong><span>${text(meta.desc)}</span>`;b.addEventListener("click",()=>{state.mode=id;state.profileId=recommendedProfileId(state.target,id)||profilesFor(state.target,id)[0]?.id||null;renderSetup();});$("modeCards").appendChild(b);});
  $("profileStep").classList.toggle("hidden",!(state.target&&state.mode));
  if(state.target&&state.mode){const ps=profilesFor(state.target,state.mode);if(!state.profileId||!ps.some(p=>p.id===state.profileId))state.profileId=recommendedProfileId(state.target,state.mode)||ps[0]?.id||null;$("profileSelect").innerHTML=ps.map(p=>`<option value="${escapeHtml(p.id)}" ${p.id===state.profileId?"selected":""}>${escapeHtml(p.label[state.lang]||p.label.en)}</option>`).join("");}
}
function openDocs(updateUrl){if(!validContext())return;const supported=supportedModules();if(!state.module||!supported.some(m=>m.id===state.module))state.module=supported[0]?.id||null;$("setupPanel").classList.add("hidden");$("docsShell").classList.remove("hidden");$("contextStrip").classList.remove("hidden");renderDocs();if(updateUrl)syncUrl();}
function supportedModules(){const p=currentProfile();return p?state.modules.filter(m=>p.capabilities.includes(m.capability)):[];}
function renderDocs(){applyLanguage();renderContext();renderModuleNav();renderTabs();renderModule();renderToolLinks();}
function renderContext(){const p=currentProfile(),t=TARGETS[state.target],mode=state.mode==="host_python"?text("modeHost"):text("modeHigh");$("contextStrip").innerHTML=[`${t.product} + ${t.board.replace("Raspberry Pi ","")}`,mode,`${text("profile")}: ${p.label[state.lang]||p.label.en}`].map(v=>`<span class="context-chip">${escapeHtml(v)}</span>`).join("");}
function renderModuleNav(){const ms=supportedModules();$("moduleCount").textContent=String(ms.length);$("moduleNav").innerHTML="";ms.forEach(m=>{const b=document.createElement("button");b.type="button";b.className=state.module===m.id?"active":"";b.textContent=m.labels[state.lang]||m.labels.en;b.addEventListener("click",()=>{state.module=m.id;state.view="guide";renderDocs();syncUrl();});$("moduleNav").appendChild(b);});}
function renderTabs(){document.querySelectorAll("#viewTabs button[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===state.view));}
function contentPath(moduleId,view){const folder=view==="reference"?"reference":"guides";return state.mode==="host_python"?`../${state.lang}/host-python/${folder}/${moduleId}.md`:`../${state.lang}/${folder}/${moduleId}.md`;}

async function renderModule(){
  const m=state.modules.find(x=>x.id===state.module),p=currentProfile(),supported=!!(m&&p&&p.capabilities.includes(m.capability));
  if(!m||!supported){$("moduleTitle").textContent=m?(m.labels[state.lang]||m.labels.en):"—";$("moduleCapability").textContent=m?`capability: ${m.capability}`:"";setAvailability("danger",text("unavailable"));$("deviceNotice").classList.add("hidden");$("docContent").innerHTML=`<div class="unavailable"><h2>${text("unsupportedTitle")}</h2><p>${text("unsupportedBody")}</p><p>${text("chooseSupported")}</p></div>`;return;}
  $("moduleTitle").textContent=m.labels[state.lang]||m.labels.en;$("moduleCapability").textContent=`capability: ${m.capability}`;renderDeviceOverlay(m);
  if(state.view==="troubleshooting"){$("docContent").innerHTML=renderTroubleshooting(m);return;}
  $("docContent").innerHTML=`<p class="muted">${text("loading")}</p>`;
  try{const r=await fetch(contentPath(m.id,state.view));if(!r.ok)throw new Error(`${r.status}`);$("docContent").innerHTML=renderMarkdown(await r.text());wireDocLinks();}catch(error){console.error(error);$("docContent").innerHTML=`<div class="unavailable"><p>${text("loadError")}</p></div>`;}
}
function renderDeviceOverlay(m){const notice=$("deviceNotice");if(state.device.moduleEnabled===false){setAvailability("warning",text("supportedDisabled"));notice.textContent=text("disabledNotice");notice.classList.remove("hidden");return;}setAvailability("",text("supported"));const configured=(m.pins||[]).filter(k=>k in state.device.pins);if(configured.length){notice.innerHTML=`<strong>${text("currentPin")}：</strong> `+configured.map(k=>`<span class="pin-chip">${escapeHtml(k)} = GP${state.device.pins[k]}</span>`).join(" ");notice.classList.remove("hidden");}else{notice.classList.add("hidden");notice.textContent="";}}
function setAvailability(kind,label){const b=$("availabilityBadge");b.className="availability-badge"+(kind?` ${kind}`:"");b.textContent=label;}

function renderTroubleshooting(m){
  const note=m.target_notes&&m.target_notes[state.target];const pins=(m.pins||[]).map(pin=>`<span class="pin-chip">${escapeHtml(pin)}${state.device.pins[pin]!==undefined?` = GP${state.device.pins[pin]}`:""}</span>`).join("");
  const supports=`from mangobox import Mango\n\nm = Mango()\nprint(m.supports("${m.capability}"))`;
  const config=state.mode==="high_level_micropython"?`from mangobox import Mango\n\nm = Mango()\nprint("enabled =", m.config.get("enabled_modules", {}))\n${(m.pins||[]).map(pin=>`print("${pin} =", m.config.get("${pin}"))`).join("\n")}`:`from mangobox import Mango\n\nm = Mango()\nprint(m.capabilities())\n# Host Python: inspect Runtime configuration with Device Manager.`;
  const steps=[[text("stepApi"),text("stepApiBody")],[text("stepEnable"),`${text("stepEnableBody")} ${m.gate?`<code>${escapeHtml(m.gate)}</code>`:""}`],[text("stepPin"),`${text("stepPinBody")}<div class="pin-list">${pins}</div>`],[text("stepDM"),text("stepDMBody")],[text("stepRaw"),text("stepRawBody")],[text("stepWire"),text("stepWireBody")]];
  let diagnostic=m.diagnostic&&m.diagnostic[state.mode];if(diagnostic&&typeof diagnostic==="object")diagnostic=diagnostic[state.lang]||diagnostic.en||"";
  return `${note?`<blockquote>${escapeHtml(note[state.lang]||note.en)}</blockquote>`:""}<p>${text("troubleshootingIntro")}</p><div class="troubleshoot-flow">${steps.map((s,i)=>`<div class="troubleshoot-step"><span class="number">${i+1}</span><div><h3>${s[0]}</h3><p>${s[1]}</p></div></div>`).join("")}</div><h2>${text("diagnostic")}</h2><pre><code>${escapeHtml(supports)}</code></pre><pre><code>${escapeHtml(config)}</code></pre>${diagnostic?`<h3>${text("moduleDiagnostic")}</h3><pre><code>${escapeHtml(diagnostic)}</code></pre>`:""}<p class="muted">${text("lifecycleEscalation")}</p>${Object.keys(state.device.pins).length||state.device.moduleEnabled!==null?"":`<p class="muted">${text("noDeviceContext")}</p>`}`;
}
function renderToolLinks(){$("deviceManagerLink").href=`../${state.lang}/tools/device-manager.md`;$("hardwareLabLink").href=`../${state.lang}/tools/hardware-lab.md`;}
function syncUrl(){const p=new URLSearchParams();p.set("lang",state.lang);if(state.target)p.set("target",state.target);if(state.mode)p.set("mode",state.mode);if(state.profileId)p.set("profile",state.profileId);if(state.module)p.set("module",state.module);p.set("view",state.view);if(state.device.moduleEnabled!==null)p.set("module_enabled",state.device.moduleEnabled?"1":"0");Object.entries(state.device.pins).forEach(([k,v])=>p.set(k,v));history.replaceState(null,"",`${location.pathname}?${p}`);}

function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function inlineMarkdown(v){let s=escapeHtml(v);s=s.replace(/`([^`]+)`/g,"<code>$1</code>");s=s.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(m,label,href)=>`<a href="${escapeHtml(/^javascript:/i.test(href)?"#":href)}">${label}</a>`);return s;}
function parseTableRow(line){return line.trim().replace(/^\|/,"").replace(/\|$/,"").split("|").map(c=>c.trim());}
function renderMarkdown(markdown){
  const lines=markdown.replace(/\r/g,"").split("\n"),out=[];let paragraph=[],code=[],inCode=false,ul=[],ol=[];
  const fp=()=>{if(paragraph.length){out.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);paragraph=[];}};
  const fu=()=>{if(ul.length){out.push(`<ul>${ul.map(x=>`<li>${inlineMarkdown(x)}</li>`).join("")}</ul>`);ul=[];}};
  const fo=()=>{if(ol.length){out.push(`<ol>${ol.map(x=>`<li>${inlineMarkdown(x)}</li>`).join("")}</ol>`);ol=[];}};const fl=()=>{fu();fo();};
  for(let i=0;i<lines.length;i++){const line=lines[i];if(line.startsWith("```")){fp();fl();if(inCode){out.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);code=[];inCode=false;}else inCode=true;continue;}if(inCode){code.push(line);continue;}if(!line.trim()){fp();fl();continue;}if(/^\s*(---|\*\*\*|___)\s*$/.test(line)){fp();fl();out.push("<hr>");continue;}const h=line.match(/^(#{1,4})\s+(.+)$/);if(h){fp();fl();out.push(`<h${h[1].length}>${inlineMarkdown(h[2])}</h${h[1].length}>`);continue;}if(line.startsWith("> ")){fp();fl();out.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`);continue;}const um=line.match(/^[-*]\s+(.+)$/);if(um){fp();fo();ul.push(um[1]);continue;}const om=line.match(/^\d+[.)]\s+(.+)$/);if(om){fp();fu();ol.push(om[1]);continue;}if(line.includes("|")&&i+1<lines.length&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])){fp();fl();const header=parseTableRow(line);i+=2;const rows=[];while(i<lines.length&&lines[i].includes("|")&&lines[i].trim()){rows.push(parseTableRow(lines[i]));i++;}i--;out.push(`<table><thead><tr>${header.map(c=>`<th>${inlineMarkdown(c)}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${inlineMarkdown(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);continue;}fl();paragraph.push(line.trim());}
  fp();fl();if(inCode&&code.length)out.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);return out.join("\n");
}
function wireDocLinks(){
  $("docContent").querySelectorAll("a").forEach(a=>{const raw=a.getAttribute("href")||"";if(!raw||raw.startsWith("#")||/^https?:/i.test(raw)||/^mailto:/i.test(raw))return;let m=raw.match(/^\.\.\/(guides|reference)\/([a-z0-9_-]+)\.md/i);if(m){a.href="#";a.addEventListener("click",e=>{e.preventDefault();const module=state.modules.find(x=>x.id===m[2]),p=currentProfile();if(!module||!p||!p.capabilities.includes(module.capability))return;state.module=m[2];state.view=m[1]==="reference"?"reference":"guide";renderDocs();syncUrl();scrollTo({top:0,behavior:"smooth"});});}else if((m=raw.match(/^\.\.\/tools\/([a-z0-9_-]+)\.md/i)))a.href=`../${state.lang}/tools/${m[1]}.md`;});
}

init();
