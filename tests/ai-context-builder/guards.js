"use strict";
const assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm");
const core = require("../../docs/student-guide/site/ai-context-core.js");
const developerProfile = JSON.parse(fs.readFileSync(path.join(__dirname,"../../docs/student-guide/site/data/developer-profile.json"),"utf8"));
const modules = [
  {id:"led", capability:"led", methods:["led_all"], labels:{"zh-TW":"RGB LED"}},
  {id:"wifi", capability:"wifi", methods:["wifi_status"]}
];
const stable = {id:"stable-test",target:"mangolite-pico2w",mode:"high_level_micropython",runtime:"0.6.4",release_status:"stable",capabilities:["led"]};
const candidate = {...stable,id:"candidate-test",runtime:"0.6.5-rc2",release_status:"candidate",source_commit:"a".repeat(40),source_repository:"circleoyang/MangoBox",documentation_root:"candidate/shared",allowed_methods:["led_all","run_once","run_forever","config.get","scheduler.add_task"],validation:{source:"fixture-reviewed",hardware:"pending"}};
const fixtureContract = profile => ({source_commit:profile.source_commit,source_repository:profile.source_repository,entries:profile.allowed_methods.map(name=>({name,module:name === "led_all" ? "led" : "lifecycle",signature:"m."+name+"()",targets:[profile.target],parameters:[],returns:"None (test fixture)",requires:[],source_url:"https://example.com/source"}))});
const apiContract = fixtureContract(candidate);
const renderCandidate = options => core.render({apiContract,developerProfile,...options});
const sourcesFor = (profile, text="```python\nm.led_all('red')\n```\n") => Object.fromEntries(core.paths(profile,modules,null,"zh-TW",true).map(entry=>[entry.path,text]));
let checks=0;
function test(name, callback) { callback(); checks++; }
test("candidate root is separate",()=>assert(core.paths(candidate,modules,null,"en",true).every(entry=>entry.path.startsWith("candidate/shared/en/"))));
test("explicit audited override",()=>assert.strictEqual(core.paths({...candidate,documents:{led:{reference:"{lang}/reference/led.md"}}},modules,null,"en",false)[0].path,"en/reference/led.md"));
test("reject traversal",()=>assert.throws(()=>core.paths({...candidate,documentation_root:"candidate/../en"},modules,null,"en",true),/Invalid canonical/));
test("missing candidate source commit",()=>assert.throws(()=>core.paths({...candidate,source_commit:"latest"},modules,null,"en",true),/source commit/));
test("missing candidate allowlist",()=>assert.throws(()=>core.paths({...candidate,allowed_methods:[]},modules,null,"en",true),/allowlist/));
test("reject unsupported mode",()=>assert.throws(()=>core.paths({...candidate,mode:"automatic"},modules,null,"en",true),/mode/));
test("method evidence is required for module",()=>assert.throws(()=>core.selectedModules({...candidate,capabilities:["led","wifi"]},modules,["wifi"]),/Unsupported module/));
test("unknown selected module",()=>assert.throws(()=>core.selectedModules(candidate,modules,["dfplayer"]),/Unsupported module/));
test("no selected module",()=>assert.throws(()=>renderCandidate({profile:candidate,modules,ids:[],sourceDocs:{}}),/at least one/));
test("missing document never exports partial context",()=>assert.throws(()=>renderCandidate({profile:candidate,modules,sourceDocs:{}}),/Missing\/empty/));
test("candidate rejects undocumented example call",()=>assert.throws(()=>renderCandidate({profile:candidate,modules,sourceDocs:sourcesFor(candidate,"```python\nm.wifi_connect('x','y')\n```\n")}),/Undocumented method.*wifi_connect/));
test("comments and strings are not calls",()=>renderCandidate({profile:candidate,modules,sourceDocs:sourcesFor(candidate,"```python\n# m.fake() is unavailable\nprint('m.fake()')\nm.led_all('red')\n```\n")}));
test("compound methods are checked",()=>core.validateExamples(candidate,"```python\nm.config.get('led_strips', {})\nm.scheduler.add_task(tick, period=1000)\n```","fixture"));
test("unknown compound methods are rejected",()=>assert.throws(()=>core.validateExamples(candidate,"```python\nm.scheduler.clear()\n```","fixture"),/scheduler.clear/));
test("metadata is explicit",()=>{const text=renderCandidate({profile:candidate,modules,sourceDocs:sourcesFor(candidate)});assert(text.includes("Release status: candidate"));assert(text.includes("Source commit: "+"a".repeat(40)));assert(text.includes("hardware: pending"));assert(text.includes("Method allowlist"));});
test("stable output is not a candidate",()=>{const text=core.render({profile:stable,modules,sourceDocs:sourcesFor(stable),developerProfile});assert(text.includes("Release status: stable"));assert(!text.includes("## Method allowlist"));});

test("missing API contract is rejected",()=>assert.throws(()=>core.render({profile:candidate,modules,sourceDocs:sourcesFor(candidate),developerProfile}),/API contract is required/));
test("contract source drift is rejected",()=>assert.throws(()=>renderCandidate({profile:candidate,modules,sourceDocs:sourcesFor(candidate),apiContract:{...apiContract,source_commit:"c".repeat(40)}}),/source mismatch/));
test("wrong target contract is rejected",()=>assert.throws(()=>renderCandidate({profile:candidate,modules,sourceDocs:sourcesFor(candidate),apiContract:{...apiContract,entries:apiContract.entries.map(entry=>({...entry,targets:["other-target"]}))}}),/Missing target API contract/));
test("ambiguous target signature is rejected",()=>assert.throws(()=>renderCandidate({profile:candidate,modules,sourceDocs:sourcesFor(candidate),apiContract:{...apiContract,entries:[...apiContract.entries,apiContract.entries[0]]}}),/Ambiguous/));
test("dependencies are expanded",()=>{const ms=[{...modules[0],dependencies:["setup"]},{id:"setup",capability:"setup",methods:["config.get"]}];assert.deepStrictEqual(core.selectedModules({...candidate,capabilities:["led","setup"]},ms,["led"]).map(mod=>mod.id),["led","setup"]);});
test("mutual guide dependencies are included once",()=>{const ms=[{...modules[0],dependencies:["setup"]},{id:"setup",capability:"setup",methods:["config.get"],dependencies:["led"]}];assert.deepStrictEqual(core.selectedModules({...candidate,capabilities:["led","setup"]},ms,["led"]).map(mod=>mod.id),["led","setup"]);});
test("target dependencies override shared dependencies",()=>{const ms=[{...modules[0],dependencies:["unsupported"]}];assert.deepStrictEqual(core.selectedModules({...candidate,module_dependencies:{led:[]}},ms,["led"]).map(mod=>mod.id),["led"]);});
test("unselected methods are excluded",()=>{const p={...candidate,capabilities:["led","wifi"],allowed_methods:[...candidate.allowed_methods,"wifi_status"]};const text=core.render({profile:p,modules,ids:["led"],sourceDocs:sourcesFor(candidate),apiContract:fixtureContract(p),developerProfile});assert(!text.includes("m.wifi_status"));});
test("stable requires developer attribution",()=>assert.throws(()=>core.render({profile:stable,modules,sourceDocs:sourcesFor(stable)}),/Developer profile is required/));
test("candidate requires developer attribution",()=>assert.throws(()=>renderCandidate({profile:candidate,modules,sourceDocs:sourcesFor(candidate),developerProfile:null}),/Developer profile is required/));
test("both developer languages are required",()=>assert.throws(()=>core.validateDeveloperProfile({...developerProfile,description:{"zh-TW":developerProfile.description["zh-TW"]}}),/description is required for en/));
test("unsafe developer link is rejected",()=>assert.throws(()=>core.validateDeveloperProfile({...developerProfile,github_url:"javascript:alert(1)"}),/Invalid developer GitHub/));
test("attribution cannot expand the API allowlist",()=>{
  const options={profile:candidate,modules,sourceDocs:sourcesFor(candidate)};
  const baseline=renderCandidate(options);
  const annotated=renderCandidate({...options,developerProfile:{...developerProfile,allowed_methods:["invented_method"],capabilities:["wifi"]}});
  assert.strictEqual(annotated,baseline);
  assert(!annotated.includes("m.invented_method"));
});
test("bundle README shares bilingual developer section",()=>{
  for(const lang of ["zh-TW","en"])for(const channel of ["stable","candidate","all"]){
    const value=core.renderBundleReadme({developerProfile,lang,channel});
    assert(value.includes(core.renderDeveloper(developerProfile,lang).trimEnd()));
    assert(value.includes(developerProfile.project_url));
    assert(value.indexOf(developerProfile.name) < value.indexOf("Channel: "));
  }
  assert.throws(()=>core.renderBundleReadme({lang:"en",channel:"stable"}),/Developer profile is required/);
});

class Element {
  constructor(tag="div") { this.tag=tag; this.children=[]; this.value=""; this.checked=false; this.disabled=false; this.textContent=""; this.listeners={}; }
  addEventListener(name, fn) { this.listeners[name]=fn; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children=children; if(this.tag==="select")this.value=children[0]?.value || ""; }
  querySelectorAll(selector) { const all=this.children.flatMap(child=>[child,...(child.querySelectorAll?child.querySelectorAll("input"):[])]).filter(child=>child.tag==="input"); return selector==="input:checked"?all.filter(child=>child.checked):all; }
}
async function browserStateGuards() {
  const ids=["channel","target","mode","profile","lang","all","includeGuides","modules","generate","download","copy","print","preview","profileNotice","status"];
  const nodes=Object.fromEntries(ids.map(id=>[id,new Element(["channel","target","mode","profile","lang"].includes(id)?"select":"div")]));
  nodes.channel.value="stable";nodes.mode.value="high_level_micropython";nodes.lang.value="zh-TW";nodes.all.checked=true;nodes.includeGuides.checked=true;
  const document={getElementById:id=>nodes[id],createElement:tag=>new Element(tag),createTextNode:text=>({text}),addEventListener(){},body:new Element()};
  const payloads={"data/profiles.json":{profiles:[stable],recommended:{[stable.target]:{[stable.mode]:stable.id}}},"data/modules.json":{modules},"data/candidate-profiles.json":{profiles:[candidate],modules},"data/candidate-api-contract.json":apiContract,"data/developer-profile.json":developerProfile};
  let delayed=false, pending=[], missingDeveloper=false;
  const context={document,MangoAIContext:core,navigator:{clipboard:{writeText:async()=>{}}},window:{},console,setTimeout,
    fetch:async url=>{
      if(missingDeveloper && url==="data/developer-profile.json")return {ok:false,status:404};
      if(payloads[url])return {ok:true,text:async()=>JSON.stringify(payloads[url])};
      if(delayed)return new Promise(resolve=>pending.push(()=>resolve({ok:true,text:async()=>"```python\nm.led_all('red')\n```\n"})));
      return {ok:true,text:async()=>"```python\nm.led_all('red')\n```\n"};
    }};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname,"../../docs/student-guide/site/ai-context-builder.js"),"utf8"),context);
  await context.init();
  await context.generate();
  assert(nodes.preview.value.includes("Profile: stable-test")); assert.strictEqual(nodes.download.disabled,false);checks++;
  nodes.mode.value="host_python";context.updateProfiles();
  assert.strictEqual(nodes.preview.value,"");assert.strictEqual(nodes.download.disabled,true);assert.strictEqual(nodes.modules.children.length,0);assert.strictEqual(nodes.generate.disabled,true);checks++;
  nodes.mode.value="high_level_micropython";context.updateProfiles();
  delayed=true;const generation=context.generate();
  await Promise.resolve();
  nodes.channel.value="candidate";context.updateChannel();
  for(const finish of pending)finish();await generation;
  assert.strictEqual(nodes.preview.value,"");assert.strictEqual(nodes.download.disabled,true);assert(nodes.profileNotice.textContent.includes("候選版"));checks++;
  delayed=false;await context.generate();
  assert(nodes.preview.value.includes("Profile: candidate-test"));
  nodes.includeGuides.checked=false;nodes.includeGuides.listeners.change();
  assert.strictEqual(nodes.preview.value,"");assert.strictEqual(nodes.copy.disabled,true);checks++;
  await context.generate();assert(nodes.preview.value.includes(developerProfile.name));
  missingDeveloper=true;await context.init();
  assert.strictEqual(nodes.preview.value,"");assert.strictEqual(nodes.download.disabled,true);assert.strictEqual(nodes.generate.disabled,true);
  await context.generate();assert.strictEqual(nodes.preview.value,"");assert.strictEqual(nodes.copy.disabled,true);checks++;
  console.log("AI CONTEXT GUARDS PASS",checks,"checks (profile boundaries, example calls, stale async output and empty mode)");
}
browserStateGuards().catch(error=>{console.error(error);process.exitCode=1;});
