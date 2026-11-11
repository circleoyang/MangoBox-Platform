/* Offline controller tests with a deliberately minimal DOM, not browser/PDF acceptance. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const site=path.resolve(__dirname,'../../docs/student-guide/site');
const fixture=require('./current-fixture.js');
class Element {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.listeners={};this.disabled=false;this.checked=false;this.hidden=false;this._value='';this.textContent=''}
 get value(){return this.tagName==='select'?(this._value||this.children[0]?.value||''):this._value}
 set value(v){this._value=v}
 append(...elements){this.children.push(...elements)}
 appendChild(e){this.append(e)}
 replaceChildren(...elements){this.children=elements;this._value=''}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
 async event(name){for(const fn of this.listeners[name]||[])await fn()}
 querySelectorAll(query){const all=[];function walk(e){for(const c of e.children||[]){if(c.tagName==='input'&&(query!=='input:checked'||c.checked))all.push(c);walk(c)}}walk(this);return all}
 click(){this.clicked=true}
 remove(){}
}
async function load(pack, delayDoc=false){
 const ids={};for(const m of fs.readFileSync(path.join(site,'ai-context-builder.html'),'utf8').matchAll(/<(\w+)\b[^>]*\bid="([^"]+)"[^>]*>/g)){ids[m[2]]=new Element(m[1]);ids[m[2]].checked=/\bchecked\b/.test(m[0]);ids[m[2]].disabled=/\bdisabled\b/.test(m[0])}
 ids.source.value='current';ids.lang.value='zh-TW';
 let printed='',copied='',blob=null,blocked=false,release;
 const doc={getElementById:id=>ids[id],createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),addEventListener(){},body:new Element('body')};
 const popupContent={textContent:''};
 const ctx=vm.createContext({console,Blob,setTimeout:fn=>fn(),document:doc,navigator:{clipboard:{writeText:async s=>{copied=s}}},URL:{createObjectURL:b=>{blob=b;return 'blob:test'},revokeObjectURL(){}},window:{open:()=>({document:{write(){},getElementById:()=>popupContent,close(){}},focus(){},print(){printed=popupContent.textContent}})},fetch:async url=>{
  if(url==='data/firmware-current.json')return {ok:pack!==null,status:pack===null?404:200,text:async()=>JSON.stringify(pack)};
  if(delayDoc&&url.startsWith('../')&&!blocked){blocked=true;await new Promise(r=>release=r)}
  const file=path.resolve(site,url);return {ok:fs.existsSync(file),status:fs.existsSync(file)?200:404,text:async()=>fs.readFileSync(file,'utf8')};
 }});
 vm.runInContext(fs.readFileSync(path.join(site,'ai-context-core.js'),'utf8'),ctx);
 vm.runInContext(fs.readFileSync(path.join(site,'ai-context-builder.js'),'utf8'),ctx);
 await vm.runInContext('init()',ctx);
 return {ctx,ids,call:s=>vm.runInContext(s,ctx),printed:()=>printed,copied:()=>copied,blob:()=>blob,release:()=>release?.()};
}
(async()=>{
 let cases=0;
 for(const pack of [fixture,JSON.parse(fs.readFileSync(path.join(site,'data/firmware-current.json'),'utf8'))]){
  const h=await load(pack);assert.strictEqual(h.ids.target.children.length,8);assert(h.ids.mode.disabled);assert(!h.ids.generate.disabled);
  for(const t of pack.targets)for(const lang of ['zh-TW','en']){
   h.ids.target.value=t.id;await h.ids.target.event('change');h.ids.lang.value=lang;await h.ids.lang.event('change');assert(h.ids.download.disabled);
   await h.ids.generate.event('click');const md=h.ids.preview.value;assert(md.includes(pack.source_commit)&&md.includes('TEST_ONLY'));assert(md.includes((lang==='en'?t.markdown_en:t.markdown).trim()));
   await h.ids.print.event('click');assert.strictEqual(h.printed(),md);
   await h.ids.download.event('click');assert.strictEqual(await h.blob().text(),md);
   await h.ids.copy.event('click');assert.strictEqual(h.copied(),md);cases++;
  }
  h.ids.source.value='legacy';await h.ids.source.event('change');assert(h.ids.download.disabled);assert(!h.ids.mode.disabled);
  h.ids.all.checked=false;await h.ids.all.event('change');const pot=h.ids.modules.querySelectorAll('input').find(x=>x.value==='pot');assert(pot);pot.checked=true;await pot.event('change');await h.ids.generate.event('click');assert(h.ids.preview.value.includes('m.pot('));assert(h.ids.preview.value.includes('Historical documentation'));
  h.ids.mode.value='host_python';await h.ids.mode.event('change');assert(!h.ids.modules.querySelectorAll('input').some(x=>x.value==='pot'));assert(h.ids.download.disabled);
 }
 for(const pack of [null,{...fixture,status:'RELEASED'}]){const h=await load(pack);assert(h.ids.generate.disabled);assert(h.ids.download.disabled);h.ids.source.value='legacy';await h.ids.source.event('change');assert(!h.ids.generate.disabled)}
 // An in-flight legacy fetch must not overwrite a newly selected current source.
 const stale=await load(fixture,true);stale.ids.source.value='legacy';await stale.ids.source.event('change');const pending=stale.call('generate()');stale.ids.source.value='current';await stale.ids.source.event('change');await stale.call('generate()');const latest=stale.ids.preview.value;stale.release();await pending;assert.strictEqual(stale.ids.preview.value,latest);assert(latest.includes('TEST_ONLY'));
 console.log(`OFFLINE DOM SMOKE PASS: ${cases} fixture/real target-language exports, full-content/download/copy/print byte parity, legacy/Host gates, malformed/missing-data gate, stale-fetch protection. No real browser or PDF engine was exercised.`);
})().catch(e=>{console.error(e);process.exit(1)});
