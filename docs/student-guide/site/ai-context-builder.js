"use strict";
const BASE="data/",ROOT="../",byId=id=>document.getElementById(id);
const TARGETS={"mangox2-pico":"MangoX2 + Pico","mangox2-picow":"MangoX2 + Pico W","mangox2-pico2w":"MangoX2 + Pico 2 W","mangolite-picow":"MangoLite + Pico W","mangolite-pico2w":"MangoLite + Pico 2 W"};
let profiles=[],modules=[],output="",downloadName="";
const escapeText=x=>String(x??"");
const status=x=>{byId("status").textContent=x};
async function getText(path){const r=await fetch(path,{cache:"no-store"});if(!r.ok)throw Error(path+" (HTTP "+r.status+")");return r.text()}
async function init(){try{
 const [p,m]=await Promise.all([getText(BASE+"profiles.json").then(JSON.parse),getText(BASE+"modules.json").then(JSON.parse)]);
 profiles=p.profiles;modules=m.modules;
 byId("target").innerHTML=Object.entries(TARGETS).map(([id,label])=>`<option value="${id}">${label}</option>`).join("");
 byId("target").value="mangolite-pico2w";
 ["target","mode"].forEach(id=>byId(id).addEventListener("change",updateProfiles));
 ["profile","lang","all"].forEach(id=>byId(id).addEventListener("change",renderModules));
 byId("generate").addEventListener("click",generate);
 byId("download").addEventListener("click",download);
 byId("copy").addEventListener("click",()=>navigator.clipboard.writeText(output).then(()=>status("已複製 Markdown。")).catch(()=>status("複製失敗，請從下方預覽框手動複製。")));
 byId("print").addEventListener("click",()=>{const w=window.open("","_blank");if(!w){status("瀏覽器阻擋了列印視窗。");return}w.document.write("<!doctype html><meta charset='utf-8'><title>MangoBox API Manual</title><style>body{font-family:sans-serif;padding:2rem}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}</style><h1>MangoBox API Manual</h1><pre id='content'></pre>");w.document.getElementById("content").textContent=output;w.document.close();w.focus();w.print()});
 updateProfiles();
 }catch(e){status("無法載入官網 API 資料："+e.message)}}
function updateProfiles(){
 const t=byId("target").value,mode=byId("mode").value;
 const match=profiles.filter(p=>p.target===t&&p.mode===mode);
 const box=byId("profile");box.innerHTML="";
 for(const p of match){const o=document.createElement("option");o.value=p.id;o.textContent=(p.label?.["zh-TW"]||p.id);box.append(o)}
 if(!match.length){status("目前沒有此裝置／模式的正式支援版本。");return}
 box.value=match[match.length-1].id;renderModules();
}
function selectedProfile(){return profiles.find(x=>x.id===byId("profile").value)}
function renderModules(){
 const p=selectedProfile();if(!p)return;
 const supported=modules.filter(m=>p.capabilities.includes(m.capability));
 byId("profileNotice").textContent=(p.mode==="host_python"?"Host Python 支援以已發布套件設定檔為準；不要假設新版韌體功能已進入 MangoThonny。":"僅列出此 Runtime 版本已公告的功能。")+" 版本："+p.id;
 const box=byId("modules");box.replaceChildren();
 for(const m of supported){const label=document.createElement("label"),check=document.createElement("input");check.type="checkbox";check.value=m.id;check.checked=byId("all").checked;check.disabled=byId("all").checked;label.append(check,document.createTextNode(" "+(m.labels?.[byId("lang").value]||m.id)));box.append(label)}
 byId("all").onchange=()=>box.querySelectorAll("input").forEach(c=>{c.checked=byId("all").checked;c.disabled=byId("all").checked});
 clearOutput();
}
function clearOutput(){output="";byId("preview").value="";["download","copy","print"].forEach(id=>byId(id).disabled=true)}
async function generate(){
 clearOutput();const p=selectedProfile();if(!p)return;
 const ids=[...byId("modules").querySelectorAll("input:checked")].map(x=>x.value);
 if(!ids.length){status("請選擇至少一個支援模組。");return}
 const lang=byId("lang").value,host=p.mode==="host_python";
 const root=ROOT+lang+"/"+(host?"host-python/":"");
 const intro=[
 "# MangoBox Official Student API — AI Context",
 "",
 "> Generated from published MangoBox documentation. Verify actual firmware, device configuration and Host package before executing.",
 "> Do not invent API methods, parameters, pins, capabilities or sensor units. Use only methods defined below.",
 "> Prefer `from mangobox import Mango` and `m = Mango()`. Never mix Arduino C++ or raw MicroPython methods into MangoBox examples unless specifically requested.",
 "> Treat the selected target, mode and version as authoritative. A newer firmware does not imply Host Python parity.",
 "> Never apply voltage above approximately 3.3V to Pico ADC GPIO.",
 "",
 "## Environment", "",
 "- Target: "+p.target,
 "- Mode: "+p.mode,
 "- Profile: "+p.id,
 "- Runtime: "+p.runtime,
 "- Host Student API package: "+(p.host_package||"not applicable"),
 "- Release status: "+p.release_status,
 "- Document language: "+lang,
 "- Modules: "+ids.join(", "),
 "",
 "## Instructions for an LLM", "",
 "1. Use only signatures supported by the selected profile.",
 "2. Keep named device identifiers such as pot1 and strip1 configurable; do not assume enabled hardware or fixed pinouts.",
 "3. Show a complete runnable example with appropriate imports and an event loop only when needed.",
 "4. When an API is absent or its package version is uncertain, explicitly say so instead of fabricating it.",
 "5. For callbacks, use the exact argument count and threshold units in the reference.",
 ""
 ];
 const sections=[];const missing=[];
 status("正在讀取 "+ids.length+" 個模組的官方文件…");byId("generate").disabled=true;
 try{
 for(const id of ids){
  const paths=[root+"reference/"+id+".md"];
  if(byId("includeGuides").checked)paths.push(root+"guides/"+id+".md");
  let parts=[];
  for(const path of paths){try{const data=await getText(path);parts.push("### "+(path.includes("/reference/")?"API Reference":"Learner Guide")+" — "+id+"\n\n"+data)}catch(e){missing.push(path)}}
  if(parts.length)sections.push("## Module: "+id+"\n\n"+parts.join("\n\n"));
 }
 if(missing.length){status("部分文件讀取失敗，為避免提供不完整 API，已停止下載：\n"+missing.join("\n"));return}
 output=[...intro,...sections].join("\n\n");
 byId("preview").value=output;
 downloadName="MangoBox_AI_Context_"+p.target+"_"+p.mode+"_"+p.runtime+".md";
 ["download","copy","print"].forEach(id=>byId(id).disabled=false);
 status("已產生 "+ids.length+" 個模組、"+output.length+" 個字元的 Markdown。");
 }catch(e){status("產生失敗："+e.message)}finally{byId("generate").disabled=false}
}
function download(){if(!output)return;const blob=new Blob([output],{type:"text/markdown;charset=utf-8"}),url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=downloadName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
document.addEventListener("DOMContentLoaded",init);
