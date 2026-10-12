"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm"),assert=require("assert");
const corePath=path.resolve(__dirname,"../../docs/student-guide/site/ai-context-core.js");
const nodeCore=require(corePath);
const context={};vm.runInNewContext(fs.readFileSync(corePath,"utf8"),context);
const browserCore=context.MangoAIContext;
assert(browserCore && typeof browserCore.render==="function");
const base=path.resolve(__dirname,"../..");
const data=path.join(base,"docs/student-guide/site/data");
const profiles=JSON.parse(fs.readFileSync(path.join(data,"profiles.json"),"utf8"));
const modules=JSON.parse(fs.readFileSync(path.join(data,"modules.json"),"utf8")).modules;
const docs=path.join(base,"docs/student-guide");
let runs=0;
for(const profile of profiles.profiles){
  for(const lang of ["zh-TW","en"]){
    const available=nodeCore.selectedModules(profile,modules,null);
    const schedulerAvailable=available.some(x=>x.id==="scheduler");
    assert.strictEqual(schedulerAvailable,profile.mode==="high_level_micropython",profile.id);
    const configAvailable=available.some(x=>x.id==="runtime-config");
    assert.strictEqual(configAvailable,profile.mode==="high_level_micropython",profile.id);
    for(const ids of [null,available.slice(0,3).map(x=>x.id)]){
      for(const includeGuides of [true,false]){
        const sources={};
        for(const entry of nodeCore.paths(profile,modules,ids,lang,includeGuides))
          sources[entry.path]=fs.readFileSync(path.join(docs,entry.path),"utf8");
        const opts={profile,modules,ids,lang,includeGuides,sourceDocs:sources};
        const fromBrowser=browserCore.render(opts);
        const fromBatch=nodeCore.render(opts);
        assert.strictEqual(fromBrowser,fromBatch,profile.id);
        if(!fromBatch.includes("## Environment"))throw Error("Missing metadata");
        if(ids===null && profile.mode==="high_level_micropython"){
          assert(fromBatch.includes("## Module: scheduler"),"Full HLMP file must teach Scheduler");
          assert(fromBatch.includes("m.scheduler.add_task"),"Scheduler example missing");
          assert(fromBatch.includes("m.scheduler.remove_task"),"Scheduler cancellation missing");
        }
        if(profile.mode==="host_python") assert(!fromBatch.includes("## Module: scheduler"),"Do not expose runtime Scheduler in Host Python");
        if(ids===null && profile.mode==="high_level_micropython") {
          assert(fromBatch.includes("## Module: runtime-config"));
          assert(fromBatch.includes("m.config.get"));
          assert(fromBatch.includes("led_strips"));
        }
        if(profile.mode==="host_python") assert(!fromBatch.includes("## Module: runtime-config"),"No Runtime Config in Host Python");
        runs++;
      }
    }
  }
}
console.log("SHARED AI CONTEXT PARITY PASS",runs,"cases");
