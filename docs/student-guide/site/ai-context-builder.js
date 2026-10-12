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
 const entries=MangoAIContext.paths(p,modules,ids,lang,byId("includeGuides").checked);
 const sourceDocs={};const missing=[];
 status("正在讀取 "+ids.length+" 個模組的官方文件…");byId("generate").disabled=true;
 try{
  for(const e of entries){
   try{sourceDocs[e.path]=await getText(ROOT+e.path)}
   catch(err){missing.push(e.path)}
  }
  if(missing.length){status("缺少官方文件，已停止輸出：\\n"+missing.join("\\n"));return}
  output=MangoAIContext.render({profile:p,modules,lang,ids,includeGuides:byId("includeGuides").checked,sourceDocs});
 byId("preview").value=output;
 downloadName="MangoBox_AI_Context_"+p.target+"_"+p.mode+"_"+p.runtime+".md";
 ["download","copy","print"].forEach(id=>byId(id).disabled=false);
 status("已產生 "+ids.length+" 個模組、"+output.length+" 個字元的 Markdown。");
 }catch(e){status("產生失敗："+e.message)}finally{byId("generate").disabled=false}
}
function download(){if(!output)return;const blob=new Blob([output],{type:"text/markdown;charset=utf-8"}),url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=downloadName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
document.addEventListener("DOMContentLoaded",init);
