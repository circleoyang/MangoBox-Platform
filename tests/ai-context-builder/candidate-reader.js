"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),vm=require("vm");
const source=fs.readFileSync(path.join(__dirname,"../../docs/student-guide/site/candidate-docs.js"),"utf8");
const markdown={URL};vm.runInNewContext(source,markdown);
const render=markdown.MangoCandidateMarkdown.render,base="https://example.com/docs/candidate/shared/zh-TW/guides/led.md";
let checks=0;
function test(fn){fn();checks++;}
test(()=>{const html=render('<img src=x onerror="alert(1)">',base);assert(!html.includes("<img"));assert(html.includes("&lt;img"));});
test(()=>{const html=render('[unsafe](javascript:alert%281%29)',base);assert(!html.includes("href="));assert(!html.includes("javascript:"));});
test(()=>assert(!render('[unsafe](data:text/html,boom)',base).includes("href=")));
test(()=>assert(!render('[unsafe](file:///etc/passwd)',base).includes("href=")));
test(()=>assert(render('[reference](../reference/led.md)',base).includes('href="https://example.com/docs/candidate/shared/zh-TW/reference/led.md"')));
test(()=>assert(render('```python\nprint("<script>boom</script>")\n```',base).includes("&lt;script&gt;")));
test(()=>{const html=render('| Type | Meaning |\n| --- | --- |\n| `str | None` | value |',base);assert.strictEqual((html.match(/<td>/g)||[]).length,2);assert(html.includes("<code>str | None</code>"));});
test(()=>{const html=render('# Hello\n\n- one\n- two\n\n**bold** and `code`',base);assert(html.includes('<h1 id="hello">Hello</h1>'));assert(html.includes("<ul>"));assert(html.includes("<strong>bold</strong>"));});
class Element{
 constructor(tag="div"){this.tag=tag;this.children=[];this.value="";this.textContent="";this.innerHTML="";this.attributes={};this.listeners={};}
 append(...children){this.children.push(...children);}
 replaceChildren(...children){this.children=children;this.innerHTML="";if(this.tag==="select")this.value=children[0]?.value||"";}
 addEventListener(name,callback){this.listeners[name]=callback;}
 setAttribute(name,value){this.attributes[name]=value;}
 querySelectorAll(){return[];}
}
async function readerGuards(){
 const nodes=Object.fromEntries(["target","profile","lang","profileNotice","evidence","moduleNav","guideTab","referenceTab","methodSearch","methodResults","docContent","sourcePath","status","builderLink"].map(id=>[id,new Element(["target","profile","lang"].includes(id)?"select":"div")]));
 nodes.lang.value="zh-TW";
 const setup={id:"setup",capability:"setup",methods:["config.get"]};
 const mod={id:"led",capability:"led",dependencies:["setup"],methods:["led_all"],labels:{"zh-TW":"RGB LED","en":"RGB LED"}};
 const p={id:"fixture-candidate",target:"barepico-picow",mode:"high_level_micropython",runtime:"0.1.0-rc6",release_status:"candidate",source_commit:"b".repeat(40),source_repository:"circleoyang/MangoBox",documentation_root:"candidate/shared",allowed_methods:["led_all","config.get"],capabilities:["led","setup"],validation:{hardware:"pending"}};
 const location={href:"https://example.com/docs/student-guide/site/candidate-docs.html?target=barepico-picow&module=led",search:"?target=barepico-picow&module=led"};
 let ready,delayed=false,pending=[],bad=false;
 const context={URL,URLSearchParams,console,MangoAIContext:require("../../docs/student-guide/site/ai-context-core.js"),navigator:{},
  document:{getElementById:id=>nodes[id],createElement:tag=>new Element(tag),addEventListener:(name,fn)=>{if(name==="DOMContentLoaded")ready=fn;}},
  window:{location,history:{replaceState:(a,b,url)=>{location.href=url.href;location.search=url.search;}}},
  fetch:async url=>{
   if(url==="data/candidate-profiles.json")return{ok:true,text:async()=>JSON.stringify({profiles:[p],modules:[setup,mod]})};
   if(url==="data/candidate-api-contract.json")return{ok:true,text:async()=>JSON.stringify({source_commit:p.source_commit,source_repository:p.source_repository,entries:[{name:"config.get",module:"setup",signature:"m.config.get(key, default=None)",targets:[p.target],parameters:[],returns:"configured value",requires:[],source_url:"https://example.com/source"},{name:"led_all",module:"led",signature:"m.led_all(color)",targets:[p.target],parameters:[{name:"color",kind:"positional_or_keyword",required:true}],returns:"None",requires:[],source_url:"https://example.com/source"}]})};
   const value="# "+(url.includes("reference")?"Reference":"Guide")+"\n\n```python\nm."+(bad?"unknown":"led_all")+"('red')\n```\n";
   if(delayed)return new Promise(resolve=>pending.push(()=>resolve({ok:true,text:async()=>value})));
   return{ok:true,text:async()=>value};
  }};
 vm.createContext(context);vm.runInContext(source,context);await ready();
 const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};await flush();
 assert(nodes.docContent.innerHTML.includes("<h1"));assert(nodes.sourcePath.textContent.includes("guides/led.md"));assert(nodes.builderLink.href.includes("channel=candidate"));checks++;
 nodes.methodSearch.value="led_all";nodes.methodSearch.listeners.input();assert.strictEqual(nodes.methodResults.children.length,1);checks++;
 delayed=true;nodes.referenceTab.listeners.click();await flush();
 assert.strictEqual(nodes.docContent.innerHTML,"");assert.strictEqual(nodes.docContent.attributes["aria-busy"],"true");
 nodes.guideTab.listeners.click();await flush();const late=pending.shift();const current=pending.shift();current();await flush();assert(nodes.docContent.innerHTML.includes("Guide"));late();await flush();assert(!nodes.docContent.innerHTML.includes("Reference"));checks++;
 delayed=false;bad=true;nodes.referenceTab.listeners.click();await flush();
 assert.strictEqual(nodes.docContent.innerHTML,"");assert(nodes.status.textContent.includes("Undocumented method"));checks++;
 console.log("CANDIDATE READER GUARDS PASS",checks,"checks (safe Markdown, deep links, method filtering, stale reads, fail-closed examples)");
}
readerGuards().catch(error=>{console.error(error);process.exitCode=1;});
