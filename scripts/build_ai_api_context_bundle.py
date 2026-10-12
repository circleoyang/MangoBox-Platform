#!/usr/bin/env python3
"""Produce profile-pinned MangoBox AI reference bundles from canonical Markdown.

No undocumented methods or ad-hoc API summaries are generated.
"""
from __future__ import annotations
import argparse
import hashlib
import json
from datetime import date
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

DOCS=Path(__file__).resolve().parents[1]/"docs"/"student-guide"
DATA=DOCS/"site"/"data"

def bundle(profile, modules, lang, out):
    ids=[m["id"] for m in modules if m["capability"] in profile["capabilities"]]
    prefix="host-python/" if profile["mode"]=="host_python" else ""
    parts=[
        "# MangoBox Official Student API — LLM Context",
        "",
        f"Generated: {date.today().isoformat()}",
        f"Target: {profile['target']}",
        f"Mode: {profile['mode']}",
        f"Profile: {profile['id']}",
        f"Runtime: {profile.get('runtime','unspecified')}",
        f"Host API package: {profile.get('host_package') or 'N/A'}",
        f"Document language: {lang}",
        "",
        "## AI development rules",
        "",
        "- Only use documented API names, signatures, callback parameters and sensor units in this document.",
        "- Do not mix Host Python APIs with High-Level MicroPython APIs.",
        "- Use `from mangobox import Mango` and `m = Mango()` where supported by the reference.",
        "- Hardware configuration, pin assignments and enabled modules must be verified separately.",
        "- Do not infer that a newer MicroPython Runtime implies the same features in MangoThonny Host Python.",
        "- If an API is not present in this selected release profile, state that it is unavailable or unverified.",
        "- Cite the official API method in the answer when using it, and avoid inventing missing parameters.",
        "",
        "## Included module IDs",
        "",
        ", ".join(ids),
        "",
    ]
    for module in modules:
        if module["id"] not in ids: continue
        name=module["labels"].get(lang,module["id"])
        parts += [f"## {name} ({module['id']})", ""]
        for folder in ("reference","guides"):
            p=DOCS/lang/prefix/folder/(module["id"]+".md")
            if not p.is_file():
                raise FileNotFoundError("Unsupported/missing canonical document: "+str(p))
            source=p.read_text(encoding="utf-8").strip()
            if not source:
                raise ValueError("Empty source: "+str(p))
            parts += [f"### {folder.title()}", "",source,""]
    out.write_text("\n".join(parts).rstrip()+"\n",encoding="utf-8")
    return ids

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",default="dist/ai-api-context")
    ap.add_argument("--lang",default="zh-TW",choices=["zh-TW","en"])
    args=ap.parse_args()
    output=Path(args.output);output.mkdir(parents=True,exist_ok=True)
    data=json.loads((DATA/"profiles.json").read_text(encoding="utf-8"))
    modules=json.loads((DATA/"modules.json").read_text(encoding="utf-8"))["modules"]
    profiles={p["id"]:p for p in data["profiles"]}
    inventory=[]
    for target,modes in data["recommended"].items():
        for mode,pid in modes.items():
            profile=profiles[pid]
            path=output/(target+"__"+("HLMP" if mode=="high_level_micropython" else "HOST")+"__"+profile["id"].split("__")[-1]+".md")
            included=bundle(profile,modules,args.lang,path)
            inventory.append(dict(file=path.name,target=target,mode=mode,profile=pid,
                                  modules=included,sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
            print("BUILT",path.name,len(included),"modules")
    (output/"MANIFEST.json").write_text(json.dumps(inventory,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    (output/"README.md").write_text(
        "# MangoBox AI API Context Bundle\n\n"
        "These are official API reference bundles generated from the canonical student guides and release profiles.\n\n"
        "Select exactly one file for the target board and programming mode. Do not upload all modes together.\n"
        "Host Python profile versions may lag behind the latest MicroPython Runtime; this is intentional.\n"
        "When configuring hardware, consult Device Manager and the current firmware capability matrix.\n"
        "\nOfficial website: https://circleoyang.github.io/MangoBox-Platform/docs/student-guide/site/\n"
        "AI Context Builder: https://circleoyang.github.io/MangoBox-Platform/docs/student-guide/site/ai-context-builder.html\n",
        encoding="utf-8")
    archive=output.parent/("MangoBox_AI_API_Context_"+args.lang+".zip")
    with ZipFile(archive,"w",ZIP_DEFLATED) as z:
        for path in sorted(output.iterdir()):
            if path.is_file():z.write(path,path.name)
    assert len(inventory)==10
    print("ZIP",archive)
if __name__=="__main__":main()
