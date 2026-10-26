"use strict";
const BASE = "data/", ROOT = "../", byId = id => document.getElementById(id);
const TARGETS = {
  "mangox2-pico":"MangoX2 + Pico", "mangox2-picow":"MangoX2 + Pico W", "mangox2-pico2w":"MangoX2 + Pico 2 W",
  "mangolite-picow":"MangoLite + Pico W", "mangolite-pico2w":"MangoLite + Pico 2 W",
  "barepico-pico":"BarePico · Pico", "barepico-picow":"BarePico · Pico W", "barepico-pico2w":"BarePico · Pico 2 W"
};
let catalogs = {}, profiles = [], modules = [], output = "", downloadName = "", revision = 0;
let developerProfile = null;
const status = value => { byId("status").textContent = value; };
async function getText(path) {
  const response = await fetch(path, {cache:"no-store"});
  if (!response.ok) throw Error(path + " (HTTP " + response.status + ")");
  return response.text();
}
function option(value, label) { const node = document.createElement("option"); node.value = value; node.textContent = label; return node; }
async function init() {
  developerProfile = null;
  clearOutput();
  try {
    const [published, metadata, candidate, apiContract, developer] = await Promise.all([
      getText(BASE + "profiles.json").then(JSON.parse),
      getText(BASE + "modules.json").then(JSON.parse),
      getText(BASE + "candidate-profiles.json").then(JSON.parse).catch(error => ({profiles:[], modules:[], loadError:error.message})),
      getText(BASE + "candidate-api-contract.json").then(JSON.parse).catch(error => ({loadError:error.message})),
      getText(BASE + "developer-profile.json").then(JSON.parse)
    ]);
    MangoAIContext.validateDeveloperProfile(developer);
    developerProfile = developer;
    catalogs = {stable:{...published, modules:metadata.modules}, candidate:{...candidate, apiContract}};
    byId("channel").addEventListener("change", updateChannel);
    ["target", "mode"].forEach(id=>byId(id).addEventListener("change", updateProfiles));
    ["profile", "lang"].forEach(id=>byId(id).addEventListener("change", renderModules));
    byId("all").addEventListener("change", () => {
      byId("modules").querySelectorAll("input").forEach(input => { input.checked = byId("all").checked; input.disabled = byId("all").checked; });
      clearOutput();
    });
    byId("includeGuides").addEventListener("change", clearOutput);
    byId("generate").addEventListener("click", generate);
    byId("download").addEventListener("click", download);
    byId("copy").addEventListener("click", copyOutput);
    byId("print").addEventListener("click", printOutput);
    const params = typeof URLSearchParams === "function" ? new URLSearchParams(globalThis.location?.search || "") : null;
    if (["stable", "candidate"].includes(params?.get("channel"))) byId("channel").value = params.get("channel");
    if (["zh-TW", "en"].includes(params?.get("lang"))) byId("lang").value = params.get("lang");
    updateChannel();
    const requested = profiles.find(profile=>profile.id === params?.get("profile"));
    const target = requested?.target || params?.get("target");
    if (profiles.some(profile=>profile.target === target)) {
      byId("target").value = target;
      if (requested) byId("mode").value = requested.mode;
      updateProfiles();
      if (requested) { byId("profile").value = requested.id; renderModules(); }
    }
  } catch (error) {
    clearOutput();
    byId("generate").disabled = true;
    status("無法載入官網 API 資料：" + error.message);
  }
}
function updateChannel() {
  clearOutput();
  const catalog = catalogs[byId("channel").value];
  profiles = catalog?.profiles || [];
  modules = catalog?.modules || [];
  let catalogError = "";
  try {
    for (const profile of profiles) {
      MangoAIContext.validateProfile(profile);
      if ((byId("channel").value === "candidate") !== MangoAIContext.isCandidate(profile)) throw Error("Channel/profile mismatch: " + profile.id);
      if (MangoAIContext.isCandidate(profile)) MangoAIContext.resolveContract(profile, catalog.apiContract, MangoAIContext.selectedModules(profile, modules, null));
    }
  } catch (error) { catalogError = error.message; profiles = []; modules = []; }
  const previousTarget = byId("target").value;
  const targets = [...new Set(profiles.map(profile=>profile.target))];
  byId("target").replaceChildren(...targets.map(target=>option(target,TARGETS[target] || target)));
  byId("target").value = targets.includes(previousTarget) ? previousTarget : targets.includes("mangolite-pico2w") ? "mangolite-pico2w" : targets[0] || "";
  updateProfiles();
  if (catalogError) status("版本通道資料不一致，已停止輸出：" + catalogError);
  if (catalog?.loadError) status("候選版資料載入失敗；請稍後重新整理。正式版文件仍可使用。" + catalog.loadError);
}
function updateProfiles() {
  clearOutput();
  const target = byId("target").value, mode = byId("mode").value;
  const match = profiles.filter(profile=>profile.target === target && profile.mode === mode);
  byId("profile").replaceChildren(...match.map(profile=>option(profile.id,profile.label?.[byId("lang").value] || profile.id)));
  const preferred = catalogs[byId("channel").value]?.recommended?.[target]?.[mode];
  byId("profile").value = match.find(profile=>profile.id === preferred)?.id || match.at(-1)?.id || "";
  renderModules();
}
function selectedProfile() { return profiles.find(profile=>profile.id === byId("profile").value); }
function renderModules() {
  const previouslySelected = new Set([...byId("modules").querySelectorAll("input:checked")].map(input=>input.value));
  clearOutput();
  byId("modules").replaceChildren();
  const profile = selectedProfile();
  if (!profile) {
    byId("generate").disabled = true;
    byId("profileNotice").textContent = "目前沒有此裝置／模式在所選通道的支援設定。";
    status("請選擇另一個裝置、程式模式或版本通道。");
    return;
  }
  let supported;
  try { supported = MangoAIContext.selectedModules(profile, modules, null); }
  catch (error) { byId("generate").disabled = true; status("支援設定無效：" + error.message); return; }
  const candidate = MangoAIContext.isCandidate(profile);
  byId("profileNotice").textContent = candidate ?
    "候選版來源文件，尚未公開發布；不代表已安裝或已通過實機驗收。請核對韌體版本。來源：" + profile.source_commit + "。" :
    (profile.mode === "host_python" ? "Host Python 依已發布套件設定檔；新版韌體功能不會自動加入 MangoThonny。" : "僅列出此正式 Runtime 版本公告的模組。") + " 版本：" + profile.id;
  for (const mod of supported) {
    const label = document.createElement("label"), check = document.createElement("input");
    check.type = "checkbox"; check.value = mod.id; check.checked = byId("all").checked || previouslySelected.has(mod.id); check.disabled = byId("all").checked;
    check.addEventListener("change", clearOutput);
    label.append(check, document.createTextNode(" " + (mod.labels?.[byId("lang").value] || mod.id)));
    byId("modules").append(label);
  }
  byId("generate").disabled = !supported.length || !developerProfile;
  status("已載入 " + supported.length + " 個模組。選好後產生文件。");
}
function clearOutput() {
  revision++;
  output = ""; downloadName = ""; byId("preview").value = "";
  ["download", "copy", "print"].forEach(id=>byId(id).disabled = true);
  byId("generate").disabled = !selectedProfile() || !developerProfile;
}
async function generate() {
  clearOutput();
  const profile = selectedProfile();
  if (!profile) return;
  if (!developerProfile) { status("開發者資料尚未載入，已停止輸出。請重新整理頁面。"); return; }
  const generation = revision;
  const selectedCatalogModules = modules;
  const apiContract = catalogs[byId("channel").value]?.apiContract;
  const ids = [...byId("modules").querySelectorAll("input:checked")].map(input=>input.value);
  if (!ids.length) { status("請選擇至少一個支援模組。"); return; }
  const lang = byId("lang").value, includeGuides = byId("includeGuides").checked;
  byId("generate").disabled = true;
  status("正在讀取 " + ids.length + " 個模組的官方文件…");
  try {
    const entries = MangoAIContext.paths(profile, selectedCatalogModules, ids, lang, includeGuides);
    const results = await Promise.all(entries.map(async entry=>({entry, text:await getText(ROOT + entry.path)})));
    if (generation !== revision) return;
    const sourceDocs = Object.fromEntries(results.map(result=>[result.entry.path,result.text]));
    const generated = MangoAIContext.render({profile,modules:selectedCatalogModules,lang,ids,includeGuides,sourceDocs,apiContract,developerProfile});
    if (generation !== revision) return;
    output = generated;
    byId("preview").value = output;
    downloadName = "MangoBox_AI_Context_" + profile.target + "_" + profile.mode + "_" + profile.runtime + "_" + profile.release_status + ".md";
    ["download", "copy", "print"].forEach(id=>byId(id).disabled = false);
    const included = MangoAIContext.selectedModules(profile, selectedCatalogModules, ids).length;
    status("已產生 " + included + " 個模組" + (included > ids.length ? "（包含範例所需依賴）" : "") + "、" + output.length + " 個字元的 Markdown。");
  } catch (error) {
    if (generation === revision) status("缺少或不符合此版本的官方文件，已停止輸出：\n" + error.message);
  } finally {
    if (generation === revision) byId("generate").disabled = !developerProfile;
  }
}
function copyOutput() {
  if (!output) return;
  const current = revision;
  navigator.clipboard.writeText(output).then(()=>{if(current === revision)status("已複製 Markdown。");})
    .catch(()=>{if(current === revision)status("複製失敗，請從下方預覽框手動複製。");});
}
function printOutput() {
  if (!output) return;
  const popup = window.open("", "_blank");
  if (!popup) { status("瀏覽器阻擋了列印視窗。"); return; }
  popup.document.write("<!doctype html><meta charset='utf-8'><title>MangoBox API Manual</title><style>body{font-family:sans-serif;padding:2rem}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}</style><h1>MangoBox API Manual</h1><pre id='content'></pre>");
  popup.document.getElementById("content").textContent = output;
  popup.document.close(); popup.focus(); popup.print();
}
function download() {
  if (!output || !downloadName) return;
  const blob = new Blob([output], {type:"text/markdown;charset=utf-8"}), url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = downloadName;
  document.body.append(link); link.click(); link.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.addEventListener("DOMContentLoaded", init);
