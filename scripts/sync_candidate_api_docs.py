#!/usr/bin/env python3
"""Generate candidate profiles and searchable contracts from a reviewed snapshot.

Stable profiles and September overlays are deliberately not generated here.
Import the engineering builder's snapshot with --source-snapshot, then use
--check in subsequent local documentation checks. No network/hardware access.
"""
from __future__ import annotations

import argparse
import ast
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "docs/student-guide"
DATA = GUIDE / "site/data"
SNAPSHOT = GUIDE / "contracts/source-snapshot.vnext.json"
FAMILIES = ("mangox2", "mangolite", "barepico")
MODULE_MAP = {"rgb": "led", "drive": "motor", "ble_control": "ble-control", "core": "lifecycle"}
LABELS = {
    "lifecycle": ("程式生命週期與事件記錄", "Program lifecycle and event logging"),
    "dht11": ("DHT11 溫度與濕度", "DHT11 temperature and humidity"),
    "dfplayer": ("DFPlayer 音樂與語音", "DFPlayer music and speech"),
    "wifi": ("Wi-Fi：STA 與 AP", "Wi-Fi: STA and AP"),
    "clock": ("時鐘、校時與提醒", "Clock, synchronization and alarms"),
}
SHARED = {"oled", "ble-control", "dfplayer", "wifi", "clock", "lifecycle", "scheduler", "runtime-config"}
SAFE_NESTED = {"config.get", "scheduler.add_task", "scheduler.remove_task"}
FIELDS = ("name", "module", "signature", "parameters", "source_path", "source_line",
          "source_function", "binding_line", "source_url", "targets", "role", "requires",
          "return_semantics", "preconditions_and_behavior", "catalog_summary_zh",
          "catalog_return_reference", "exclusion_reason", "code_generation_allowed",
          "available_in_default_build", "build_requirement", "build_variants")


def dump(value):
    return json.dumps(value, ensure_ascii=False, indent=2) + "\n"


def compact_source(raw):
    """Whitelist public documentation fields; do not export private runtime data."""
    out = {k: raw[k] for k in ("schema_version", "source_repository", "source_commit",
        "source_main_commit", "reviewed_at", "versions", "host_api_version",
        "main_runtime_versions", "audio_build_notes", "planned_but_missing",
        "unimplemented_familiar_names", "limitations", "provenance_policy") if k in raw}
    out["families"] = {}
    for family in FAMILIES:
        src = raw["families"][family]
        methods = [{k: m[k] for k in FIELDS if k in m} for m in src["methods"]]
        for group, rows in raw["nested_objects"][family].items():
            for row in rows:
                name = row["name"].removeprefix("m.")
                if name not in SAFE_NESTED:
                    continue
                method = {k: row[k] for k in FIELDS if k in row}
                method.update(name=name, module="runtime-config" if group == "config" else "scheduler",
                    signature=row["signature"].removeprefix("m."), targets=src["targets"],
                    role="advanced", code_generation_allowed=True)
                if name == "config.get":
                    method.update(return_semantics="Configured value, or the supplied default; no Flash write.",
                        preconditions_and_behavior="Read only the needed configuration keys. Never export complete configuration containing credentials.")
                elif name == "scheduler.add_task":
                    method.update(return_semantics="Integer task identifier for later removal.",
                        preconditions_and_behavior="Cooperative callback; period is milliseconds. BarePico requires integer period >=10; always pass an explicit sensible period. Do not re-enter run_once from callbacks.")
                else:
                    method.update(return_semantics="BarePico: bool removed; carrier: None.",
                        preconditions_and_behavior="Remove only the task you own; never clear all module tasks.")
                methods.append(method)
        out["families"][family] = {"targets": src["targets"], "methods": methods}
    out["source_files"] = raw["source_files"]
    out["host_boundary"] = {
        "version": raw["host_api_version"],
        "candidate_extension_available": False,
        "reason": "The reviewed Host installer does not install candidate DHT, Wi-Fi, BLE, OLED-media or audio/time services. Existing stable Host profiles remain separate.",
    }
    return out


def python_method_calls(path):
    """Read only Python fences; inline aliases/prohibited-name prose are not calls."""
    calls = set()
    for code in re.findall(r"```python[^\n]*\n(.*?)```", path.read_text(), re.S):
        # Legacy references have declaration-only fences such as foo(x: int)
        # -> None. Recognize whole signature blocks, validate them as function
        # declarations and omit them from executable dependency discovery.
        lines = [line.strip() for line in code.splitlines() if line.strip() and not line.lstrip().startswith("#")]
        if lines and any(" -> " in line for line in lines) and all(
                re.fullmatch(r"(?:m\.)?[A-Za-z_]\w*\([^\n]*\)(?:\s*->\s*.+)?", line) for line in lines):
            ast.parse("\n".join("def " + line.removeprefix("m.") + ":\n    pass" for line in lines))
            continue
        for node in ast.walk(ast.parse(code, filename=str(path))):
            if not isinstance(node, ast.Call):
                continue
            value, parts = node.func, []
            while isinstance(value, ast.Attribute):
                parts.append(value.attr)
                value = value.value
            if isinstance(value, ast.Name) and value.id == "m" and parts:
                calls.add(".".join(reversed(parts)))
    return calls


def document_dependencies(profile, methods):
    """Keep interaction examples reproducible with target-specific module closure."""
    by_name = {m["name"]: m["module"] for m in methods}
    dependencies = {}
    for module, documents in profile["documents"].items():
        used = set()
        for language in ("zh-TW", "en"):
            for template in documents.values():
                path = GUIDE / template.replace("{lang}", language)
                if not path.is_file():
                    raise ValueError("Missing candidate teaching page: " + str(path.relative_to(ROOT)))
                for name in python_method_calls(path):
                    if name not in by_name:
                        raise ValueError(profile["target"] + " does not allow " + name + " in " + str(path.relative_to(ROOT)))
                    if by_name[name] != module:
                        used.add(by_name[name])
        dependencies[module] = sorted(used)
    return dependencies


def render(snapshot):
    base_modules = json.loads((DATA / "modules.json").read_text())["modules"]
    names = {}
    for path in ("api-index.json", "api-contract-overlay-v20260906.json", "ble-control-api-overlay-v20260913.json"):
        for item in json.loads((DATA / path).read_text())["entries"]:
            names[item["name"]] = item
    by_id = {m["id"]: {k: m[k] for k in ("id", "labels", "summary") if k in m} for m in base_modules}
    for module, labels in LABELS.items():
        by_id[module] = {"id": module, "labels": dict(zip(("zh-TW", "en"), labels))}
    by_id["ble-control"]["summary"] = {
        "zh-TW": "以 Dabble 控制 MangoLite 與 BarePico 的 Pico W / Pico 2 W，共四個候選目標。",
        "en": "Dabble control for four candidate targets: MangoLite and BarePico on Pico W / Pico 2 W.",
    }
    entries, profiles = [], []
    for family in FAMILIES:
        data = snapshot["families"][family]
        for method in data["methods"]:
            if not method.get("code_generation_allowed") or method.get("available_in_default_build") is False:
                continue
            module = MODULE_MAP.get(method["module"], method["module"])
            if module not in by_id:
                raise ValueError("No complete learner module for " + module)
            # Hardware-less Pico never gets wireless controls through mere class presence.
            targets = [t for t in method["targets"] if not (
                t.endswith("-pico") and (module in ("wifi", "ble-control") or method["name"] == "clock_sync_ntp"))]
            if not targets:
                continue
            prior = names.get(method["name"], {})
            zh = method.get("catalog_summary_zh") or prior.get("zh") or by_id[module]["labels"]["zh-TW"] + "：" + method["name"]
            en = prior.get("en") or method.get("preconditions_and_behavior") or method["name"]
            if family == "barepico" and method["name"] == "capabilities":
                zh = "回傳 target、MCU、wireless 與 carrier 硬體旗標的識別 dict；不是 API 方法清單或實機測試。"
                en = "Return a target/MCU/wireless/carrier identity dict; not an API method inventory or a hardware test."
            if family == "barepico" and method["name"] == "led_clear":
                en = "Stop all effects on the selected RGB strip and clear it to black; like led_off, this turns the strip off."
            if family == "mangolite" and module == "servo":
                zh = "操作 MangoLite 的單一已配置伺服機；此簽章不接受 name 參數。"
                en = "Operate the single configured MangoLite servo; this signature does not accept a name argument."
            entries.append({
                "name": method["name"], "module": module, "signature": "m." + method["signature"],
                "family": family, "targets": targets, "role": method["role"],
                "zh": zh, "en": en,
                "parameters": method.get("parameters", []),
                "returns": method.get("return_semantics") or "See the target-specific reference; no stronger result is inferred.",
                "requires": method.get("requires", []), "notes": method.get("preconditions_and_behavior", ""),
                "available_in_default_build": True,
                "build_variants": method.get("build_variants", []),
                "source_path": method["source_path"], "source_line": method["source_line"],
                "source_url": "https://github.com/" + snapshot["source_repository"] + "/blob/" + snapshot["source_commit"] + "/" + method["source_path"],
            })
        for target in data["targets"]:
            methods = [m for m in entries if m["family"] == family and target in m["targets"]]
            ids = sorted({m["module"] for m in methods})
            documents = {}
            for module in ids:
                if module == "dht11":
                    root = "candidate/barepico" if family == "barepico" else "candidate/carrier"
                elif module == "clock" and target.endswith("-pico"):
                    root = "candidate/wired"
                elif module in SHARED:
                    root = "candidate/shared"
                elif family == "barepico":
                    root = "candidate/barepico"
                else:
                    root = ""  # audited, unchanged carrier teaching remains canonical
                prefix = (root + "/") if root else ""
                documents[module] = {"guide": prefix + "{lang}/guides/" + module + ".md",
                                     "reference": prefix + "{lang}/reference/" + module + ".md"}
                if family == "mangolite" and module in {"light", "sound", "servo"}:
                    documents[module]["reference"] = "candidate/lite/{lang}/reference/" + module + ".md"
                    if module == "servo":
                        documents[module]["guide"] = "candidate/lite/{lang}/guides/servo.md"
            runtime = snapshot["versions"][family]
            profile = {
                "id": target + "__hlmp__candidate-" + runtime,
                "target": target, "mode": "high_level_micropython", "runtime": runtime,
                "release_status": "candidate", "documentation_root": "candidate/shared",
                "label": {"zh-TW": "來源候選 · Runtime " + runtime, "en": "Source candidate · Runtime " + runtime},
                "source_repository": snapshot["source_repository"], "source_commit": snapshot["source_commit"],
                "source_date": snapshot["reviewed_at"], "capabilities": ids, "documents": documents,
                "allowed_methods": sorted(m["name"] for m in methods),
                "validation": {"source": "reviewed signatures and installation paths at recorded commit",
                    "host": "documentation generation checks only; not a Host Python implementation",
                    "windows": "not revalidated by this documentation update", "hardware": "not revalidated by this documentation update"},
                "notes": ["版本以選定來源的 __version__ 為準，不能替代目前已燒入裝置的版本核對。",
                    "High-Level MicroPython only. Read the exact module reference and configured device names before generating code.",
                    "Audio v1.1 / 365-voice behavior additionally depends on the verified build overlay and matching TF catalog. Overlay-only method names are excluded from this default-build profile."]
            }
            profile["module_dependencies"] = document_dependencies(profile, methods)
            profiles.append(profile)
    expected_targets = {"mangox2-pico", "mangox2-picow", "mangox2-pico2w", "mangolite-picow", "mangolite-pico2w", "barepico-pico", "barepico-picow", "barepico-pico2w"}
    if {p["target"] for p in profiles} != expected_targets or len(profiles) != 8:
        raise ValueError("Candidate routing must cover exactly the reviewed eight targets")
    active_ids = {m["module"] for m in entries}
    modules = []
    for module in sorted(active_ids):
        row = by_id[module]
        row.update(capability=module, methods=sorted({m["name"] for m in entries if m["module"] == module}))
        modules.append(row)
    provenance = {"schema_version": 1, "source_repository": snapshot["source_repository"],
        "source_commit": snapshot["source_commit"], "source_date": snapshot["reviewed_at"],
        "source_status": "candidate-source-reviewed", "generated_from": "docs/student-guide/contracts/source-snapshot.vnext.json"}
    return {
        DATA / "candidate-profiles.json": dump({**provenance, "profiles": profiles, "modules": modules}),
        DATA / "candidate-api-contract.json": dump({**provenance, "entries": entries,
            "excluded_names": snapshot["unimplemented_familiar_names"], "host_boundary": snapshot["host_boundary"]}),
    }


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--source-snapshot", type=Path)
    p.add_argument("--check", action="store_true")
    p.add_argument("--source-root", type=Path, help="Optionally verify the recorded engineering-source hashes")
    args = p.parse_args()
    if args.source_snapshot:
        snapshot = compact_source(json.loads(args.source_snapshot.read_text()))
        if args.check:
            if not SNAPSHOT.exists() or SNAPSHOT.read_text() != dump(snapshot):
                raise ValueError("Public reviewed snapshot differs from engineering source snapshot")
        else:
            SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)
            SNAPSHOT.write_text(dump(snapshot), encoding="utf-8")
    else:
        snapshot = json.loads(SNAPSHOT.read_text())
    if args.source_root:
        for item in snapshot["source_files"]:
            path = args.source_root / item["path"]
            if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != item["sha256"]:
                raise ValueError("Source snapshot drift: " + item["path"])
    for path, content in render(snapshot).items():
        if args.check:
            if not path.exists() or path.read_text() != content:
                raise ValueError("Generated candidate data is stale: " + str(path.relative_to(ROOT)))
        else:
            path.write_text(content, encoding="utf-8")
    print("PASS: candidate profiles and method contracts match the reviewed source snapshot" if args.check else "WROTE: 8 candidate profiles and source-scoped API contracts; stable data unchanged")


if __name__ == "__main__":
    main()
