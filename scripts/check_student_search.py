#!/usr/bin/env python3
"""Validate MangoBox Student Guide method-level search contract.

This is intentionally dependency-free. It does not try to reproduce browser
rendering; it protects the public data/HTML contract and a small set of learner
queries that must continue to resolve to concrete Student API methods.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "docs" / "student-guide" / "site"
API_INDEX = SITE / "data" / "api-index.json"
MODULES = SITE / "data" / "modules.json"
INDEX_HTML = SITE / "index.html"
METHOD_SEARCH = SITE / "method-search.js"

GENERIC_INTENT_WORDS = (
    "搜尋", "查詢", "查找", "查", "找", "我要", "我想", "想要",
    "怎麼", "如何", "的", "指令", "命令", "方法", "函式", "功能",
    "程式", "程式碼", "api", "function", "method", "command", "code",
)

SMOKE_QUERIES = {
    "呼吸燈": {"breath", "led_start_breathing"},
    "呼吸燈的指令": {"breath", "led_start_breathing"},
    "漸亮漸暗": {"breath", "led_start_breathing"},
    "breathing": {"breath", "led_start_breathing"},
    "彩虹燈": {"rainbow", "led_start_rainbow"},
    "測距": {"distance"},
    "超音波": {"distance"},
    "前進": {"forward"},
    "蜂鳴器": {"bee", "tone"},
    "音量": {"sound_level"},
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def normalize(value: object) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[()_.\-\/:,]+", " ", str(value or "").lower())).strip()


def compact(value: object) -> str:
    return normalize(value).replace(" ", "")


def simplify_intent(value: str) -> str:
    text = value.lower()
    for word in GENERIC_INTENT_WORDS:
        text = text.replace(word, " ")
    return re.sub(r"\s+", " ", text).strip()


def entry_fields(entry: dict, module: dict | None) -> list[str]:
    fields = [
        entry.get("name", ""), entry.get("signature", ""),
        entry.get("zh", ""), entry.get("en", ""),
        *(entry.get("aliases") or []),
    ]
    if module:
        labels = module.get("labels") or {}
        summary = module.get("summary") or {}
        fields.extend([
            labels.get("zh-TW", ""), labels.get("en", ""),
            summary.get("zh-TW", ""), summary.get("en", ""),
        ])
    return [str(x) for x in fields if x]


def matches(entry: dict, module: dict | None, query: str) -> bool:
    fields = entry_fields(entry, module)
    hay = normalize(" ".join(fields))
    hay_compact = compact(" ".join(fields))
    variants = {normalize(query), normalize(simplify_intent(query))} - {""}

    for variant in variants:
        q_compact = compact(variant)
        if variant in hay or q_compact in hay_compact:
            return True
        words = [word for word in variant.split(" ") if word]
        if words and all(word in hay or compact(word) in hay_compact for word in words):
            return True

        # Support compact Chinese intent such as "馬達前進" when aliases are
        # separate atoms ("馬達", "前進") rather than one stored phrase.
        atoms = {compact(field) for field in fields if len(compact(field)) >= 2}
        covered = {atom for atom in atoms if atom and atom in q_compact}
        if covered and sum(len(atom) for atom in covered) >= max(2, int(len(q_compact) * 0.6)):
            return True
    return False


def main() -> int:
    errors: list[str] = []
    api_data = load(API_INDEX)
    modules_data = load(MODULES)
    entries = api_data.get("entries", [])
    modules = {m.get("id"): m for m in modules_data.get("modules", []) if m.get("id")}

    if api_data.get("schema_version") != 2:
        errors.append("api-index.json schema_version must be 2")
    if not entries:
        errors.append("api-index.json must contain method entries")

    names: set[str] = set()
    for index, entry in enumerate(entries):
        name = entry.get("name")
        module_id = entry.get("module")
        for key in ("module", "name", "signature", "zh", "en"):
            if not entry.get(key):
                errors.append(f"entry[{index}] missing {key}")
        if name in names:
            errors.append(f"duplicate API method entry: {name}")
        if name:
            names.add(name)
        if module_id not in modules:
            errors.append(f"API method references unknown module: {name} -> {module_id}")

    html = INDEX_HTML.read_text(encoding="utf-8")
    enhancer = METHOD_SEARCH.read_text(encoding="utf-8") if METHOD_SEARCH.is_file() else ""
    if 'src="method-search.js"' not in html:
        errors.append("student-guide site must load method-search.js")
    if 'data-q="呼吸燈"' not in html:
        errors.append("student-guide search hints must include 呼吸燈 smoke entry")
    for required_token in ("data-api-name", "openMethod", "api-method-anchor", "simplifyIntent"):
        if required_token not in enhancer:
            errors.append(f"method-search.js missing contract token: {required_token}")

    for query, expected_names in SMOKE_QUERIES.items():
        matched = {
            entry.get("name")
            for entry in entries
            if matches(entry, modules.get(entry.get("module")), query)
        }
        if not (matched & expected_names):
            errors.append(
                f"search smoke failed: {query!r} expected one of {sorted(expected_names)}, "
                f"got {sorted(x for x in matched if x)}"
            )

    # The motivating regression must land on an actual Reference heading in
    # both public languages, not just exist in the JSON index.
    critical_refs = {
        "zh-TW": ROOT / "docs" / "student-guide" / "zh-TW" / "reference" / "led.md",
        "en": ROOT / "docs" / "student-guide" / "en" / "reference" / "led.md",
    }
    for lang, path in critical_refs.items():
        text = path.read_text(encoding="utf-8") if path.is_file() else ""
        if "breath()" not in text or "led_start_breathing()" not in text:
            errors.append(f"{lang} LED Reference must document breath()/led_start_breathing()")

    if errors:
        print("Student API search validation FAILED")
        for error in errors:
            print("-", error)
        return 1

    print(
        "Student API search validation PASS:",
        f"{len(entries)} method entries, {len(SMOKE_QUERIES)} learner-query smoke checks,",
        "method deep-link UI contract present.",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
