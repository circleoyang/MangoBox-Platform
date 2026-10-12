#!/usr/bin/env python3
"""Compatibility entrypoint: Node shared renderer + ZIP packaging. No separate API formatting."""
from __future__ import annotations
import argparse
import subprocess
import json
import zipfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",default="dist/ai-api-context")
    ap.add_argument("--lang",choices=["zh-TW","en"],default="zh-TW")
    args=ap.parse_args()
    out=Path(args.output).resolve()
    subprocess.run(["node",str(ROOT/"scripts/build_ai_api_context_bundle.js"),
                    "--output",str(out),"--lang",args.lang],cwd=ROOT,check=True)
    inventory=json.loads((out/"MANIFEST.json").read_text(encoding="utf-8"))
    assert len(inventory)==10
    archive=out.parent/("MangoBox_AI_API_Context_"+args.lang+".zip")
    with zipfile.ZipFile(archive,"w",zipfile.ZIP_DEFLATED) as z:
        for path in sorted(out.iterdir()):
            if path.is_file():z.write(path,path.name)
    print("ZIP",archive)
if __name__=="__main__":main()
