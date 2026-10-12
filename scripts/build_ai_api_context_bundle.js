"use strict";
/* Node CLI uses exactly the same renderer loaded by AI Context Builder. */
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const {render,paths}=require("../docs/student-guide/site/ai-context-core.js");
const root=path.resolve(__dirname,"..");
const site=path.join(root,"docs/student-guide/site");
const docs=path.join(root,"docs/student-guide");
const profilesData=JSON.parse(fs.readFileSync(path.join(site,"data/profiles.json"),"utf8"));
const modules=JSON.parse(fs.readFileSync(path.join(site,"data/modules.json"),"utf8")).modules;
const profileById=Object.fromEntries(profilesData.profiles.map(x=>[x.id,x]));
const args=process.argv.slice(2);
const getArg=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1]};
const lang=getArg("--lang","zh-TW");
const out=path.resolve(getArg("--output","dist/ai-api-context"));
if(!["zh-TW","en"].includes(lang))throw Error("Bad language");
fs.mkdirSync(out,{recursive:true});
const inventory=[];
for(const [target,modes] of Object.entries(profilesData.recommended)){
 for(const [mode,profileId] of Object.entries(modes)){
  const profile=profileById[profileId];
  if(!profile ||profile.target!==target ||profile.mode!==mode) throw Error("Bad recommended profile "+profileId);
  const sourceDocs={};
  for(const e of paths(profile,modules,null,lang,true)){
   const filepath=path.join(docs,e.path);
   sourceDocs[e.path]=fs.readFileSync(filepath,"utf8");
  }
  const value=render({profile,modules,lang,sourceDocs});
  const filename=target+"__"+(mode==="host_python"?"HOST":"HLMP")+"__"+profileId.split("__").at(-1)+".md";
  fs.writeFileSync(path.join(out,filename),value,"utf8");
  inventory.push({file:filename,target,mode,profile:profileId,
    modules:modules.filter(m=>profile.capabilities.includes(m.capability)).map(m=>m.id),
    sha256:crypto.createHash("sha256").update(value).digest("hex")});
  console.log("BUILT",filename,value.length);
 }
}
if(inventory.length!==10) throw Error("Expected ten board/mode combinations");
fs.writeFileSync(path.join(out,"MANIFEST.json"),JSON.stringify(inventory,null,2)+"\n");
fs.writeFileSync(path.join(out,"README.md"),"# MangoBox AI API Context Bundle\n\nSelect exactly one board/mode profile. The complete Markdown is generated from the same renderer as the online AI Context Builder.\n\nWebsite: https://circleoyang.github.io/MangoBox-Platform/docs/student-guide/site/ai-context-builder.html\n");
