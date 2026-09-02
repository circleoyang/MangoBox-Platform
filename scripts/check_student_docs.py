#!/usr/bin/env python3
"""Validate MangoBox student-guide profile/module/document coverage."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "docs" / "student-guide" / "site"
PROFILES_PATH = SITE / "data" / "profiles.json"
MODULES_PATH = SITE / "data" / "modules.json"
LANGS = ("zh-TW", "en")


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def doc_path(lang: str, mode: str, kind: str, module_id: str) -> Path:
    base = ROOT / "docs" / "student-guide" / lang
    if mode == "host_python":
        base = base / "host-python"
    folder = "reference" if kind == "reference" else "guides"
    return base / folder / f"{module_id}.md"


def main() -> int:
    profiles_data = load(PROFILES_PATH)
    modules_data = load(MODULES_PATH)
    profiles = profiles_data.get("profiles", [])
    modules = modules_data.get("modules", [])
    errors: list[str] = []

    if profiles_data.get("source_status") != "candidate-not-public-release":
        errors.append("profiles.json must remain candidate-not-public-release until release gates pass")
    if modules_data.get("source_status") != "candidate-not-public-release":
        errors.append("modules.json must remain candidate-not-public-release until release gates pass")

    module_ids = set()
    capabilities = set()
    for module in modules:
        module_id = module.get("id")
        capability = module.get("capability")
        if not module_id or not capability:
            errors.append(f"module missing id/capability: {module!r}")
            continue
        if module_id in module_ids:
            errors.append(f"duplicate module id: {module_id}")
        module_ids.add(module_id)
        capabilities.add(capability)

    profile_ids = set()
    for profile in profiles:
        profile_id = profile.get("id")
        mode = profile.get("mode")
        profile_caps = set(profile.get("capabilities", []))
        if not profile_id or mode not in ("high_level_micropython", "host_python"):
            errors.append(f"invalid profile identity/mode: {profile!r}")
            continue
        if profile_id in profile_ids:
            errors.append(f"duplicate profile id: {profile_id}")
        profile_ids.add(profile_id)

        shown_modules = [m for m in modules if m.get("capability") in profile_caps]
        if not shown_modules:
            errors.append(f"profile exposes no documented modules: {profile_id}")

        for module in shown_modules:
            module_id = module["id"]
            for lang in LANGS:
                for kind in ("guide", "reference"):
                    path = doc_path(lang, mode, kind, module_id)
                    if not path.is_file():
                        errors.append(f"missing {kind}: {profile_id} -> {path.relative_to(ROOT)}")

        # Current transport ownership rule: MangoX2 Host UART must not expose
        # line_tracking while the default line sensor owns GP12/GP13.
        if mode == "host_python" and str(profile.get("target", "")).startswith("mangox2"):
            if "line_tracking" in profile_caps:
                errors.append(f"Host profile must not expose line_tracking: {profile_id}")

    recommended = profiles_data.get("recommended", {})
    for target, modes in recommended.items():
        for mode, profile_id in modes.items():
            if profile_id not in profile_ids:
                errors.append(f"recommended profile missing: {target}/{mode} -> {profile_id}")

    if errors:
        print("Student documentation validation FAILED")
        for error in errors:
            print("-", error)
        return 1

    print(
        "Student documentation validation PASS:",
        f"{len(profiles)} profiles, {len(modules)} modules,",
        "zh-TW/en guide+reference coverage complete for every visible module.",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
