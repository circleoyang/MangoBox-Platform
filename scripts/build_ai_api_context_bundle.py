#!/usr/bin/env python3
"""Local compatibility entrypoint: the shared Node renderer plus exact-manifest ZIP."""
from __future__ import annotations
import argparse
import hashlib
import json
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default="dist/ai-api-context")
    ap.add_argument("--lang", choices=["zh-TW", "en"], default="zh-TW")
    ap.add_argument("--channel", choices=["stable", "candidate", "all"], default="stable")
    ap.add_argument("--profile")
    ap.add_argument("--modules")
    ap.add_argument("--no-guides", action="store_true")
    args = ap.parse_args()
    out = Path(args.output).resolve()
    command = ["node", str(ROOT / "scripts/build_ai_api_context_bundle.js"),
               "--output", str(out), "--lang", args.lang, "--channel", args.channel]
    for name in ("profile", "modules"):
        if getattr(args, name):
            command += ["--" + name, getattr(args, name)]
    if args.no_guides:
        command.append("--no-guides")
    subprocess.run(command, cwd=ROOT, check=True)
    inventory = json.loads((out / "MANIFEST.json").read_text(encoding="utf-8"))
    if not inventory:
        raise ValueError("Empty export manifest")
    members = ["MANIFEST.json", "README.md"]
    for entry in inventory:
        name = entry["file"]
        if Path(name).name != name or name in members:
            raise ValueError("Unsafe or duplicate manifest filename")
        if hashlib.sha256((out / name).read_bytes()).hexdigest() != entry["sha256"]:
            raise ValueError("Export hash mismatch: " + name)
        members.append(name)
    # Keep the established stable artifact filename for existing workflows/users.
    suffix = ("" if args.channel == "stable" else args.channel + "_") + args.lang
    archive = out.parent / ("MangoBox_AI_API_Context_" + suffix + ".zip")
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as bundle:
        for name in sorted(members):
            bundle.write(out / name, name)
    print("ZIP", archive)

if __name__ == "__main__":
    main()
