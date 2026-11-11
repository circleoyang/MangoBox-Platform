"use strict";
const BASE="data/",ROOT="../",byId=id=>document.getElementById(id);
const TARGETS={"mangox2-pico":"MangoX2 + Pico","mangox2-picow":"MangoX2 + Pico W","mangox2-pico2w":"MangoX2 + Pico 2 W","mangolite-picow":"MangoLite + Pico W","mangolite-pico2w":"MangoLite + Pico 2 W"};
let profiles=[],modules=[],currentPack=null,currentError="",legacyError="",output="",downloadName="",generation=0;
const status=x=>{byId("status").textContent=x};
const isCurrent=()=>byId("source").value==="current";
async function getText(path){const r=await fetch(path,{cache:"no-store"});if(!r.ok)throw Error(path+" (HTTP "+r.status+")");return r.text()}
function options(select, entries){select.replaceChildren();for(const [value,label] of entries){const o=document.createElement("option");o.value=value;o.textContent=label;select.append(o)}}
async function init(){
 await Promise.all([
  (async()=>{try{const [p,m]=await Promise.all([getText(BASE+"profiles.json").then(JSON.parse),getText(BASE+"modules.json").then(JSON.parse)]);profiles=p.profiles;modules=m.modules}catch(e){legacyError=e.message}})(),
  (async()=>{try{currentPack=MangoAIContext.validateCurrent(JSON.parse(await getText(BASE+"firmware-current.json")))}catch(e){currentError=e.message}})()
 ]);
 byId("source").addEventListener("change",updateSource);
 ["target","mode"].forEach(id=>byId(id).addEventListener("change",updateProfiles));
 ["profile","lang","all","includeGuides"].forEach(id=>byId(id).addEventListener("change",renderModules));
 byId("generate").addEventListener("click",generate);
 byId("download").addEventListener("click",download);
 byId("copy").addEventListener("click",()=>navigator.clipboard.writeText(output).then(()=>status("已複製 Markdown。")).catch(()=>status("複製失敗，請從預覽框手動複製。")));
 byId("print").addEventListener("click",()=>{if(!output)return;const w=window.open("","_blank");if(!w){status("瀏覽器阻擋了列印視窗。");return}w.document.write("<!doctype html><meta charset='utf-8'><title>MangoBox API Manual</title><style>body{font-family:sans-serif;padding:2rem}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}</style><h1>MangoBox API Manual</h1><pre id='content'></pre>");w.document.getElementById("content").textContent=output;w.document.close();w.focus();w.print()});
 updateSource();
}
function clearOutput(){generation++;output="";downloadName="";byId("preview").value="";["download","copy","print"].forEach(id=>byId(id).disabled=true)}
function updateSource(){
 clearOutput();const current=isCurrent();
 options(byId("target"),current?(currentPack?.targets||[]).map(t=>[t.id,t.label]):Object.entries(TARGETS));
 if(!current)byId("target").value="mangolite-pico2w";
 options(byId("mode"),current?[["high_level_micropython","High-Level MicroPython（八板來源 TEST_ONLY）"]]:[["high_level_micropython","High-Level MicroPython（舊資料）"],["host_python","Host Python（舊套件資料）"]]);
 byId("mode").disabled=current;byId("all").disabled=current;byId("includeGuides").disabled=current;
 byId("currentNotice").hidden=!current;updateProfiles();
}
function updateProfiles(){
 clearOutput();const current=isCurrent();
 if(current){options(byId("profile"),currentPack?[["firmware-current","BUILD_ID "+currentPack.source_commit+" · TEST_ONLY"]]:[]);byId("profile").disabled=true;renderModules();return}
 byId("profile").disabled=false;
 const match=profiles.filter(p=>p.target===byId("target").value&&p.mode===byId("mode").value);
 options(byId("profile"),match.map(p=>[p.id,"歷史資料 · "+(p.label?.["zh-TW"]||p.id)]));
 if(match.length)byId("profile").value=match[match.length-1].id;
 renderModules();
}
function selectedProfile(){return profiles.find(x=>x.id===byId("profile").value)}
function renderModules(){
 clearOutput();const box=byId("modules");box.replaceChildren();
 if(isCurrent()){
  byId("profileNotice").textContent=currentPack?"開發者：歐陽芳泉。來源 "+currentPack.source_commit+"；TEST_ONLY 工程測試資料，不代表八板實機驗收或 Host Python 支援。":"八板資料不可用，已停止新版輸出："+currentError;
  byId("generate").disabled=!currentPack;status(currentPack?"選擇板型後產生完整中英對照文件；兩個語言選項目前均含同一份雙語全文與來源附錄，並非另譯純英文版。":"請提供有效的 firmware-current.json；舊資料可由來源選單獨立開啟。");return;
 }
 const p=selectedProfile();byId("generate").disabled=!p;
 byId("profileNotice").textContent="歷史文件，不代表最新八款韌體支援或驗收。"+(p?" 版本："+p.id:" 此裝置／模式無舊版資料。 "+legacyError);
 status("舊版官網／Host Python 資料。請核對版本與模組。");if(!p)return;
 for(const m of modules.filter(m=>p.capabilities.includes(m.capability))){const label=document.createElement("label"),check=document.createElement("input");check.type="checkbox";check.value=m.id;check.checked=byId("all").checked;check.disabled=byId("all").checked;check.addEventListener("change",clearOutput);label.append(check,document.createTextNode(" "+(m.labels?.[byId("lang").value]||m.id)));box.append(label)}
}
async function generate(){
 clearOutput();const token=generation,lang=byId("lang").value;
 try{
  if(isCurrent()){
   output=MangoAIContext.renderCurrent(currentPack,byId("target").value,lang);
   downloadName="MangoBox_AI_Context_"+byId("target").value+"_"+lang+"_"+currentPack.source_commit.slice(0,8)+"_TEST_ONLY.md";
  }else{
   const p=selectedProfile();if(!p)return;
   const ids=[...byId("modules").querySelectorAll("input:checked")].map(x=>x.value),includeGuides=byId("includeGuides").checked;
   if(!ids.length){status("請選擇至少一個支援模組。");return}
   const entries=MangoAIContext.paths(p,modules,ids,lang,includeGuides),sourceDocs={};
   status("正在讀取舊版官方文件…");byId("generate").disabled=true;
   for(const e of entries){sourceDocs[e.path]=await getText(ROOT+e.path);if(token!==generation)return}
   output="# Historical documentation / 歷史文件\n\nThis legacy profile is not the latest eight-firmware source or physical acceptance.\n\n"+MangoAIContext.render({profile:p,modules,lang,ids,includeGuides,sourceDocs});
   downloadName="MangoBox_AI_Context_LEGACY_"+p.target+"_"+p.mode+"_"+p.runtime+"_"+lang+".md";
  }
  if(token!==generation)return;
  byId("preview").value=output;["download","copy","print"].forEach(id=>byId(id).disabled=false);status("已產生 "+output.length+" 個字元；Markdown 與列印／PDF 使用相同內容。");
 }catch(e){if(token===generation){clearOutput();status("產生失敗，未輸出文件："+e.message)}}finally{byId("generate").disabled=isCurrent()?!currentPack:!selectedProfile()}
}
function download(){if(!output)return;const blob=new Blob([output],{type:"text/markdown;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=downloadName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
document.addEventListener("DOMContentLoaded",init);
