#!/usr/bin/env python3
"""Audit method-level coverage of the public MangoBox API Reference pages.

The public search index is the discoverability surface. Every ordinary method
that search exposes must have a concrete heading in each Reference page that
exists for that programming mode, otherwise the method deep link can only fall
back to a coarse module page.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "docs" / "student-guide"
SITE_DATA = GUIDE / "site" / "data"
API_INDEX = SITE_DATA / "api-index.json"
MODULES = SITE_DATA / "modules.json"
LANGS = ("zh-TW", "en")

# Cross-cutting APIs are intentionally searchable but do not belong to one
# hardware-module Reference page. They will get their own core Reference in a
# later information-architecture pass.
GLOBAL_METHODS = {
    "supports", "capabilities", "run_once", "run_forever", "close", "send_command"
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def reference_path(lang: str, module_id: str, mode: str) -> Path:
    base = GUIDE / lang
    if mode == "host_python":
        base = base / "host-python"
    return base / "reference" / f"{module_id}.md"


def heading_has_method(text: str, method: str) -> bool:
    escaped = re.escape(method)
    # Require the method on an actual Markdown heading. This protects the
    # method-search deep-link behavior; a mention in a Related APIs list alone
    # is not enough.
    pattern = re.compile(
        rf"^#{{2,4}}\s+.*(?:`{escaped}\(\)`|{escaped}\(\)).*$",
        re.MULTILINE,
    )
    return bool(pattern.search(text))


def main() -> int:
    api = load(API_INDEX)
    modules_data = load(MODULES)
    entries = api.get("entries", [])
    module_ids = {m.get("id") for m in modules_data.get("modules", []) if m.get("id")}
    errors: list[str] = []
    checked = 0

    by_module: dict[str, list[dict]] = {}
    for entry in entries:
        name = entry.get("name")
        module_id = entry.get("module")
        if not name or not module_id or name in GLOBAL_METHODS:
            continue
        if module_id not in module_ids:
            errors.append(f"unknown module in API index: {name} -> {module_id}")
            continue
        by_module.setdefault(module_id, []).append(entry)

    for lang in LANGS:
        for module_id, methods in sorted(by_module.items()):
            for mode in ("high_level_micropython", "host_python"):
                path = reference_path(lang, module_id, mode)
                # Host mode intentionally has no page for capabilities that are
                # not exposed there (for example MangoX2 line tracking).
                if mode == "host_python" and not path.is_file():
                    continue
                if not path.is_file():
                    errors.append(f"missing Reference file: {path.relative_to(ROOT)}")
                    continue
                text = path.read_text(encoding="utf-8")
                for entry in methods:
                    checked += 1
                    name = entry["name"]
                    if not heading_has_method(text, name):
                        errors.append(
                            f"missing method heading: {lang}/{mode}/{module_id} -> {name}()"
                        )

    if errors:
        print("API Reference completeness FAILED")
        print(f"Checked {checked} method/page pairs; {len(errors)} gaps found.")
        for error in errors:
            print("-", error)
        return 1

    print(
        "API Reference completeness PASS:",
        f"{checked} method/page pairs have deep-linkable method headings."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
