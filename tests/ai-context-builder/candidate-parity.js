"use strict";
const assert=require("assert"),fs=require("fs"),path=require("path"),vm=require("vm");
const base=path.resolve(__dirname,"../..");
const corePath=path.join(base,"docs/student-guide/site/ai-context-core.js");
const core=require(corePath), browser={};
vm.runInNewContext(fs.readFileSync(corePath,"utf8"),browser);
const data=JSON.parse(fs.readFileSync(path.join(base,"docs/student-guide/site/data/candidate-profiles.json"),"utf8"));
const apiContract=JSON.parse(fs.readFileSync(path.join(base,"docs/student-guide/site/data/candidate-api-contract.json"),"utf8"));
const expected=["mangox2-pico","mangox2-picow","mangox2-pico2w","mangolite-picow","mangolite-pico2w","barepico-pico","barepico-picow","barepico-pico2w"];
assert.deepStrictEqual([...new Set(data.profiles.map(profile=>profile.target))].sort(),expected.sort(),"All eight candidate targets require complete learning paths");
let cases=0;
for(const profile of data.profiles){
  assert.strictEqual(profile.release_status,"candidate");
  assert.strictEqual(profile.mode,"high_level_micropython","Do not invent a packaged Host candidate");
  core.validateProfile(profile);
  const available=core.selectedModules(profile,data.modules,null);
  if(profile.target.endsWith("-pico")) {
    assert(!available.some(mod=>["wifi","ble-control"].includes(mod.id)),"Plain Pico has no onboard Wi-Fi/BLE");
  }
  for(const lang of ["zh-TW","en"]){
    for(const ids of [null,available.slice(0,3).map(mod=>mod.id)]){
      for(const includeGuides of [true,false]){
        const sourceDocs={};
        for(const entry of core.paths(profile,data.modules,ids,lang,includeGuides)) sourceDocs[entry.path]=fs.readFileSync(path.join(base,"docs/student-guide",entry.path),"utf8");
        const opts={profile,modules:data.modules,ids,lang,includeGuides,sourceDocs,apiContract};
        const nodeValue=core.render(opts);
        assert.strictEqual(nodeValue,browser.MangoAIContext.render(opts),"Browser/CLI output mismatch: "+profile.id);
        assert(nodeValue.includes("Release status: candidate"));
        assert(nodeValue.includes("Source commit: "+profile.source_commit));
        assert(nodeValue.includes("## Method allowlist for this profile"));
        assert(nodeValue.includes("- hardware:"));
        assert(!nodeValue.includes("undefined"),"Undefined metadata in "+profile.id);
        cases++;
      }
    }
  }
}
console.log("CANDIDATE AI CONTEXT PARITY PASS",cases,"cases; eight target, bilingual Guide/Reference paths, exact-profile example validation");
