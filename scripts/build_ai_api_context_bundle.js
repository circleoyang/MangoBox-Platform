"use strict";
/* Local CLI: browser and batch exports share the exact profile renderer. */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const core = require("../docs/student-guide/site/ai-context-core.js");
const root = path.resolve(__dirname, ".."), docs = path.join(root, "docs/student-guide");
const data = path.join(docs, "site/data");
const readJSON = name => JSON.parse(fs.readFileSync(path.join(data,name), "utf8"));
const args = process.argv.slice(2);
const names = new Set(["--lang", "--output", "--channel", "--profile", "--modules", "--no-guides", "--help"]);
for (let i = 0; i < args.length; i++) {
  if (!names.has(args[i])) throw Error("Unknown option: " + args[i]);
  if (!["--no-guides", "--help"].includes(args[i])) {
    if (!args[i+1] || args[i+1].startsWith("--")) throw Error("Missing value for " + args[i]);
    i++;
  }
}
if (args.includes("--help")) {
  console.log("node scripts/build_ai_api_context_bundle.js [--channel stable|candidate|all] [--profile ID] [--modules led,oled] [--lang zh-TW|en] [--no-guides] [--output DIR]");
  process.exit(0);
}
const getArg = (name, fallback) => { const index = args.indexOf(name); return index < 0 ? fallback : args[index+1]; };
const lang = getArg("--lang", "zh-TW"), channel = getArg("--channel", "stable");
if (!["zh-TW", "en"].includes(lang)) throw Error("Bad language");
if (!["stable", "candidate", "all"].includes(channel)) throw Error("Bad channel");
const out = path.resolve(getArg("--output", "dist/ai-api-context"));
const ids = getArg("--modules", null)?.split(",").filter(Boolean) || null;
const includeGuides = !args.includes("--no-guides");
const wanted = getArg("--profile", null);
const developerProfile = readJSON("developer-profile.json");
core.validateDeveloperProfile(developerProfile);
const catalogs = [];
if (channel !== "candidate") catalogs.push({channel:"stable", ...readJSON("profiles.json"), modules:readJSON("modules.json").modules});
if (channel !== "stable") catalogs.push({channel:"candidate", ...readJSON("candidate-profiles.json"),apiContract:readJSON("candidate-api-contract.json")});
const selections = [];
for (const catalog of catalogs) {
  const byId = Object.fromEntries(catalog.profiles.map(profile=>[profile.id, profile]));
  const profiles = wanted ? catalog.profiles.filter(profile=>profile.id === wanted) :
    catalog.recommended ? Object.entries(catalog.recommended).flatMap(([target,modes]) => Object.entries(modes).map(([mode,id]) => {
      const profile = byId[id];
      if (!profile || profile.target !== target || profile.mode !== mode) throw Error("Bad recommended profile " + id);
      return profile;
    })) : catalog.profiles;
  for (const profile of profiles) {
    if ((catalog.channel === "candidate") !== core.isCandidate(profile)) throw Error("Channel/profile mismatch: " + profile.id);
    selections.push({profile, modules:catalog.modules, apiContract:catalog.apiContract});
  }
}
if (!selections.length) throw Error(wanted ? "Profile is not available in this channel: " + wanted : "No exportable profiles");
if (new Set(selections.map(item=>item.profile.id)).size !== selections.length) throw Error("Duplicate export profiles");
// Resolve and render everything before writing a new manifest; missing docs fail closed.
const outputs = selections.map(({profile,modules,apiContract}) => {
  const sourceDocs = {};
  for (const entry of core.paths(profile,modules,ids,lang,includeGuides)) sourceDocs[entry.path] = fs.readFileSync(path.join(docs,entry.path),"utf8");
  const value = core.render({profile,modules,ids,lang,includeGuides,sourceDocs,apiContract,developerProfile});
  const filename = profile.target + "__" + (profile.mode === "host_python" ? "HOST" : "HLMP") + "__" + profile.id.split("__").at(-1) + ".md";
  return {value, entry:{file:filename,target:profile.target,mode:profile.mode,profile:profile.id,
    release_status:profile.release_status, runtime:profile.runtime, host_package:profile.host_package || null,
    source_repository:profile.source_repository || null, source_commit:profile.source_commit || null,
    validation:profile.validation || null, language:lang, include_guides:includeGuides,
    developer_id:developerProfile.id, developer_profile_version:developerProfile.profile_version,
    modules:core.selectedModules(profile,modules,ids).map(mod=>mod.id),
    sha256:crypto.createHash("sha256").update(value).digest("hex")}};
});
if (new Set(outputs.map(item=>item.entry.file)).size !== outputs.length) throw Error("Export filenames collide");
const readme = core.renderBundleReadme({developerProfile, lang, channel});
fs.mkdirSync(out,{recursive:true});
for (const {value,entry} of outputs) { fs.writeFileSync(path.join(out,entry.file),value,"utf8"); console.log("BUILT",entry.file,value.length); }
fs.writeFileSync(path.join(out,"MANIFEST.json"),JSON.stringify(outputs.map(item=>item.entry),null,2)+"\n");
fs.writeFileSync(path.join(out,"README.md"),readme,"utf8");
console.log("EXPORT PASS",outputs.length,"profiles",channel,lang);
