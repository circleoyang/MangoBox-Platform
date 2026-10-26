/* Candidate reader reuses the AI Context profile/document contract. */
(function(root){
  "use strict";
  const escape = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function safeHref(raw,base) {
    if (/[\u0000-\u0020\u007f]/.test(raw)) return null;
    try { const url = new URL(raw,base); return ["http:","https:"].includes(url.protocol) ? url.href : null; }
    catch { return null; }
  }
  function inline(text,base) {
    const tokens=/`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^\s()]+\)/g;
    let result="", offset=0;
    for(const token of text.matchAll(tokens)){
      result+=escape(text.slice(offset,token.index));
      const value=token[0];
      if(value.startsWith("`"))result+="<code>"+escape(value.slice(1,-1))+"</code>";
      else if(value.startsWith("**"))result+="<strong>"+escape(value.slice(2,-2))+"</strong>";
      else {
        const match=value.match(/^\[([^\]]+)\]\((.+)\)$/), href=safeHref(match[2],base);
        result+=href?'<a href="'+escape(href)+'" rel="noopener noreferrer">'+escape(match[1])+"</a>":escape(match[1]);
      }
      offset=token.index+value.length;
    }
    return result+escape(text.slice(offset));
  }
  function row(text) {
    const clean=text.trim().replace(/^\|/,"").replace(/\|$/,"");
    const values=[];let current="",inCode=false;
    for(let i=0;i<clean.length;i++){
      if(clean[i]==="\\"&&clean[i+1]==="|"){current+="|";i++;continue;}
      if(clean[i]==="`")inCode=!inCode;
      if(clean[i]==="|"&&!inCode){values.push(current.trim());current="";}else current+=clean[i];
    }
    values.push(current.trim());return values;
  }
  function renderMarkdown(markdown,base) {
    const lines=markdown.replace(/\r\n?/g,"\n").split("\n"),output=[];
    let paragraph=[],list=[],listType="",code=[],inCode=false;
    const flushParagraph=()=>{if(paragraph.length){output.push("<p>"+inline(paragraph.join(" "),base)+"</p>");paragraph=[];}};
    const flushList=()=>{if(list.length){output.push("<"+listType+">"+list.map(item=>"<li>"+inline(item,base)+"</li>").join("")+"</"+listType+">");list=[];}};
    const flush=()=>{flushParagraph();flushList();};
    const flushCode=()=>{output.push('<div class="code-block"><button class="code-copy" type="button">複製程式碼 / Copy</button><pre><code>'+escape(code.join("\n"))+"</code></pre></div>");code=[];};
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      if(/^```/.test(line)){flush();if(inCode)flushCode();inCode=!inCode;continue;}
      if(inCode){code.push(line);continue;}
      if(!line.trim()){flush();continue;}
      const heading=line.match(/^(#{1,6})\s+(.+)$/);
      if(heading){flush();const n=heading[1].length;const id=heading[2].toLowerCase().replace(/[`*]/g,"").replace(/[^\p{L}\p{N}_-]+/gu,"-").replace(/^-|-$/g,"");output.push("<h"+n+' id="'+escape(id)+'">'+inline(heading[2],base)+"</h"+n+">");continue;}
      if(/^>\s?/.test(line)){flush();output.push("<blockquote>"+inline(line.replace(/^>\s?/,""),base)+"</blockquote>");continue;}
      if(/^\s*([-*_])\1\1+\s*$/.test(line)){flush();output.push("<hr>");continue;}
      const item=line.match(/^\s*(?:([-*])|\d+[.)])\s+(.+)$/);
      if(item){flushParagraph();const next=item[1]?"ul":"ol";if(next!==listType)flushList();listType=next;list.push(item[2]);continue;}
      if(line.includes("|")&&i+1<lines.length&&/^\s*\|?\s*:?-{3,}/.test(lines[i+1])){
        flush();const head=row(line),rows=[];i+=2;
        while(i<lines.length&&lines[i].includes("|")&&lines[i].trim()){rows.push(row(lines[i]));i++;}i--;
        output.push('<div class="table-scroll"><table><thead><tr>'+head.map(cell=>"<th>"+inline(cell,base)+"</th>").join("")+"</tr></thead><tbody>"+rows.map(cells=>"<tr>"+cells.map(cell=>"<td>"+inline(cell,base)+"</td>").join("")+"</tr>").join("")+"</tbody></table></div>");continue;
      }
      flushList();paragraph.push(line.trim());
    }
    flush();if(inCode)flushCode();return output.join("\n");
  }
  root.MangoCandidateMarkdown={render:renderMarkdown,safeHref};
})(typeof globalThis!=="undefined"?globalThis:this);

(function(){
  "use strict";
  if(typeof document==="undefined")return;
  const byId=id=>document.getElementById(id), ROOT="../";
  const labels={"mangox2-pico":"MangoX2 + Pico","mangox2-picow":"MangoX2 + Pico W","mangox2-pico2w":"MangoX2 + Pico 2 W","mangolite-picow":"MangoLite + Pico W","mangolite-pico2w":"MangoLite + Pico 2 W","barepico-pico":"BarePico · Pico","barepico-picow":"BarePico · Pico W","barepico-pico2w":"BarePico · Pico 2 W"};
  let catalog={profiles:[],modules:[]}, contract=null, moduleId="", view="guide", revision=0;
  const status=value=>{byId("status").textContent=value;};
  const currentProfile=()=>catalog.profiles.find(profile=>profile.id===byId("profile").value);
  const selectedModules=()=>currentProfile()?MangoAIContext.selectedModules(currentProfile(),catalog.modules,null):[];
  function option(value,label){const node=document.createElement("option");node.value=value;node.textContent=label;return node;}
  async function read(path){const response=await fetch(path,{cache:"no-store"});if(!response.ok)throw Error(path+" (HTTP "+response.status+")");return response.text();}
  function syncUrl(){
    const url=new URL(window.location.href), profile=currentProfile();
    const state={target:byId("target").value,profile:profile?.id,module:moduleId,view,lang:byId("lang").value};
    for(const[key,value]of Object.entries(state))if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
    window.history.replaceState(null,"",url);
    const builder=new URL("ai-context-builder.html",window.location.href);builder.searchParams.set("channel","candidate");
    for(const key of ["target","profile","lang"])if(state[key])builder.searchParams.set(key,state[key]);
    byId("builderLink").href=builder.href;
  }
  function updateProfiles(requested){
    const matches=catalog.profiles.filter(profile=>profile.target===byId("target").value);
    byId("profile").replaceChildren(...matches.map(profile=>option(profile.id,profile.label?.[byId("lang").value]||profile.id)));
    const preferred=requested||catalog.recommended?.[byId("target").value]?.high_level_micropython;
    byId("profile").value=matches.find(profile=>profile.id===preferred)?.id||matches.at(-1)?.id||"";
    updateModules();
  }
  function updateModules(){
    revision++;byId("docContent").replaceChildren();byId("sourcePath").textContent="";byId("moduleNav").replaceChildren();
    const profile=currentProfile();
    if(!profile){status("此裝置目前沒有可閱讀的候選版本。");return;}
    let modules;
    try{modules=selectedModules();}catch(error){status("候選設定無效："+error.message);return;}
    if(!modules.some(mod=>mod.id===moduleId))moduleId=modules[0]?.id||"";
    const lang=byId("lang").value;
    byId("profileNotice").textContent=lang==="en"?"Candidate source documentation — not a stable release or hardware-acceptance certificate. Verify the installed target and runtime before running examples.":"候選來源文件，尚未公開發布，也不代表已通過實機驗收。執行前請核對裝置、韌體版本、DM 設定與接線。";
    byId("evidence").textContent="Target: "+profile.target+" · Runtime: "+profile.runtime+" · Mode: "+profile.mode+" · Source commit: "+profile.source_commit+" · "+["source","host","windows","hardware"].map(level=>level+": "+(profile.validation?.[level]||"pending")).join(" · ");
    for(const mod of modules){const button=document.createElement("button");button.type="button";button.textContent=mod.labels?.[lang]||mod.id;button.setAttribute("aria-current",String(mod.id===moduleId));button.addEventListener("click",()=>{moduleId=mod.id;view="guide";updateModules();});byId("moduleNav").append(button);}
    renderSearch();renderDocument();syncUrl();
  }
  function methodEntries(){
    const profile=currentProfile();if(!profile)return[];
    const allowed=new Set(profile.allowed_methods.map(MangoAIContext.normalizeMethod)),result=[];
    for(const mod of selectedModules())for(const raw of mod.methods||[]){
      const name=MangoAIContext.normalizeMethod(raw);if(!allowed.has(name))continue;
      // A signature must be scoped to this exact target/profile; global entries never imply parity.
      const detail=(contract?.entries||[]).find(entry=>MangoAIContext.normalizeMethod(entry.name||"")===name&&entry.module===mod.id&&
        ((entry.profiles||[]).includes(profile.id)||(entry.targets||[]).includes(profile.target)));
      result.push({module:mod.id,name,label:mod.labels?.[byId("lang").value]||mod.id,signature:detail?.signature||"m."+name,description:detail?.[byId("lang").value==="en"?"en":"zh"]||""});
    }
    return result;
  }
  function renderSearch(){
    const query=byId("methodSearch").value.trim().toLowerCase(),box=byId("methodResults");box.replaceChildren();
    if(!query)return;
    const terms=query.split(/\s+/),entries=methodEntries().filter(entry=>terms.every(term=>(entry.name+" "+entry.label+" "+entry.description).toLowerCase().includes(term))).slice(0,20);
    if(!entries.length){const text=document.createElement("p");text.textContent=byId("lang").value==="en"?"No documented method matches this profile.":"此版本沒有符合條件且已記錄的方法。";box.append(text);return;}
    for(const entry of entries){const button=document.createElement("button"),code=document.createElement("code"),detail=document.createElement("span");button.type="button";button.className="candidate-result";code.textContent=entry.signature;detail.textContent=" · "+entry.label;button.append(code,detail);button.addEventListener("click",()=>{moduleId=entry.module;view="reference";updateModules();});box.append(button);}
  }
  async function renderDocument(){
    const generation=++revision, profile=currentProfile(), lang=byId("lang").value, selectedView=view;
    byId("docContent").replaceChildren();byId("sourcePath").textContent="";byId("docContent").setAttribute("aria-busy","true");
    byId("guideTab").setAttribute("aria-pressed",String(view==="guide"));byId("referenceTab").setAttribute("aria-pressed",String(view==="reference"));
    if(!profile||!moduleId){byId("docContent").setAttribute("aria-busy","false");status("請選擇支援模組。");return;}
    status(lang==="en"?"Loading the exact-profile document…":"正在讀取此版本的文件…");
    try{
      MangoAIContext.resolveContract(profile,contract,MangoAIContext.selectedModules(profile,catalog.modules,[moduleId]));
      const entry=MangoAIContext.paths(profile,catalog.modules,[moduleId],lang,true).find(item=>item.id===moduleId&&item.kind===(selectedView==="guide"?"guides":"reference"));
      const content=await read(ROOT+entry.path);
      if(generation!==revision)return;
      MangoAIContext.validateExamples(profile,content,entry.path);
      const base=new URL(ROOT+entry.path,window.location.href).href;
      byId("docContent").innerHTML=MangoCandidateMarkdown.render(content,base);
      byId("sourcePath").textContent=entry.path;
      wireContent(profile,lang);
      status(lang==="en"?"Loaded the selected profile. Source review and hardware validation remain separate.":"已載入所選版本；來源核對與實機驗收狀態分開記錄。");
    }catch(error){if(generation===revision)status((lang==="en"?"Document unavailable or outside this profile; no fallback was displayed: ":"文件缺漏或超出此版本的方法範圍，已停止顯示：")+error.message);}
    finally{if(generation===revision)byId("docContent").setAttribute("aria-busy","false");}
  }
  function wireContent(profile,lang){
    const known=MangoAIContext.paths(profile,catalog.modules,null,lang,true);
    byId("docContent").querySelectorAll("a").forEach(link=>{
      const wanted=new URL(link.href),match=known.find(entry=>new URL(ROOT+entry.path,window.location.href).pathname===wanted.pathname&&new URL(ROOT+entry.path,window.location.href).origin===wanted.origin);
      if(match)link.addEventListener("click",event=>{event.preventDefault();moduleId=match.id;view=match.kind==="reference"?"reference":"guide";updateModules();});
    });
    byId("docContent").querySelectorAll(".code-copy").forEach(button=>button.addEventListener("click",()=>{
      const code=button.parentElement.querySelector("code")?.textContent||"";
      if(!navigator.clipboard){status("請直接選取程式碼並複製。");return;}
      navigator.clipboard.writeText(code).then(()=>status(lang==="en"?"Code copied.":"程式碼已複製。")).catch(()=>status("請直接選取程式碼並複製。"));
    }));
  }
  async function init(){
    try{
      const[candidate,api]=await Promise.all([read("data/candidate-profiles.json").then(JSON.parse),read("data/candidate-api-contract.json").then(JSON.parse)]);
      for(const profile of candidate.profiles){
        MangoAIContext.validateProfile(profile);
        if(!MangoAIContext.isCandidate(profile))throw Error("Candidate channel contains a non-candidate profile");
        MangoAIContext.resolveContract(profile,api,MangoAIContext.selectedModules(profile,candidate.modules,null));
      }
      catalog=candidate;contract=api;
      const params=new URLSearchParams(window.location.search),targets=[...new Set(catalog.profiles.map(profile=>profile.target))];
      byId("target").replaceChildren(...targets.map(target=>option(target,labels[target]||target)));
      byId("target").value=targets.includes(params.get("target"))?params.get("target"):targets.includes("mangolite-pico2w")?"mangolite-pico2w":targets[0]||"";
      if(["zh-TW","en"].includes(params.get("lang")))byId("lang").value=params.get("lang");
      moduleId=params.get("module")||"";view=params.get("view")==="reference"?"reference":"guide";
      byId("target").addEventListener("change",()=>updateProfiles());
      byId("profile").addEventListener("change",updateModules);
      byId("lang").addEventListener("change",updateModules);
      byId("guideTab").addEventListener("click",()=>{view="guide";updateModules();});
      byId("referenceTab").addEventListener("click",()=>{view="reference";updateModules();});
      byId("methodSearch").addEventListener("input",renderSearch);
      updateProfiles(params.get("profile"));
    }catch(error){revision++;byId("docContent").replaceChildren();status("無法載入候選文件："+error.message);}
  }
  document.addEventListener("DOMContentLoaded",init);
})();
