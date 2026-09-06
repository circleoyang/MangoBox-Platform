#!/usr/bin/env python3
"""Validate MangoBox Student Guide method-level search contract.

This is dependency-free. It protects the merged public method contract, the
browser wiring that applies the temporary 2026-09-06 engineering overlay, and
a set of learner queries that must continue to resolve to concrete APIs.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "docs" / "student-guide" / "site"
API_INDEX = SITE / "data" / "api-index.json"
API_OVERLAY = SITE / "data" / "api-contract-overlay-v20260906.json"
MODULES = SITE / "data" / "modules.json"
INDEX_HTML = SITE / "index.html"
METHOD_SEARCH = SITE / "method-search.js"
OVERLAY_JS = SITE / "api-contract-overlay-v20260906.js"

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
    "馬達前進": {"forward"},
    "蜂鳴器": {"bee", "tone", "beep"},
    "音量": {"sound_level"},
    "太亮": {"on_light_above"},
    "太暗": {"on_light_below"},
    "太大聲": {"on_sound_above"},
    "搖桿按鈕": {"is_joystick_pressed"},
    "搖桿校正": {"calibrate_joystick"},
    "左循跡": {"line_left", "on_line_left"},
    "停止音樂": {"stop_music", "stop_song"},
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def merged_entries(base: dict, overlay: dict) -> list[dict]:
    by_name: dict[str, dict] = {}
    order: list[str] = []
    for entry in base.get("entries", []):
        name = entry.get("name")
        if not name:
            continue
        if name not in by_name:
            order.append(name)
        by_name[name] = dict(entry)
    for patch in overlay.get("entries", []):
        name = patch.get("name")
        if not name:
            continue
        if name not in by_name:
            order.append(name)
            by_name[name] = dict(patch)
        else:
            by_name[name] = {**by_name[name], **patch}
    return [by_name[name] for name in order]


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

        atoms = {compact(field) for field in fields if len(compact(field)) >= 2}
        covered = {atom for atom in atoms if atom and atom in q_compact}
        if covered and sum(len(atom) for atom in covered) >= max(2, int(len(q_compact) * 0.6)):
            return True
    return False


def main() -> int:
    errors: list[str] = []
    api_data = load(API_INDEX)
    overlay_data = load(API_OVERLAY)
    modules_data = load(MODULES)
    entries = merged_entries(api_data, overlay_data)
    modules = {m.get("id"): m for m in modules_data.get("modules", []) if m.get("id")}

    if api_data.get("schema_version") != 2:
        errors.append("api-index.json schema_version must be 2")
    if overlay_data.get("schema_version") != 1:
        errors.append("api-contract-overlay-v20260906.json schema_version must be 1")
    if not entries:
        errors.append("merged public method contract must not be empty")

    base_count = len(api_data.get("entries", []))
    if base_count != overlay_data.get("base_method_count"):
        errors.append(
            f"base method count drift: {base_count} != {overlay_data.get('base_method_count')}"
        )
    if len(entries) != overlay_data.get("expected_public_methods"):
        errors.append(
            f"merged public method count drift: {len(entries)} != {overlay_data.get('expected_public_methods')}"
        )

    deferred = set(overlay_data.get("deferred_not_promoted", []))
    exposed = {entry.get("name") for entry in entries}
    if deferred & exposed:
        errors.append(f"deferred APIs leaked into searchable surface: {sorted(deferred & exposed)}")

    names: set[str] = set()
    for index, entry in enumerate(entries):
        name = entry.get("name")
        module_id = entry.get("module")
        for key in ("module", "name", "signature", "zh", "en"):
            if not entry.get(key):
                errors.append(f"merged entry[{index}] missing {key}")
        if name in names:
            errors.append(f"duplicate merged API method entry: {name}")
        if name:
            names.add(name)
        if module_id not in modules:
            errors.append(f"API method references unknown module: {name} -> {module_id}")

    html = INDEX_HTML.read_text(encoding="utf-8")
    enhancer = METHOD_SEARCH.read_text(encoding="utf-8") if METHOD_SEARCH.is_file() else ""
    overlay_js = OVERLAY_JS.read_text(encoding="utf-8") if OVERLAY_JS.is_file() else ""
    if 'src="api-contract-overlay-v20260906.js"' not in html:
        errors.append("student-guide site must load api-contract-overlay-v20260906.js")
    if 'src="method-search.js"' not in html:
        errors.append("student-guide site must load method-search.js")
    if html.find('src="api-contract-overlay-v20260906.js"') > html.find('src="method-search.js"'):
        errors.append("API contract overlay must load before method-search.js")
    if 'data-q="呼吸燈"' not in html:
        errors.append("student-guide search hints must include 呼吸燈 smoke entry")
    for required_token in ("data-api-name", "openMethod", "api-method-anchor", "simplifyIntent"):
        if required_token not in enhancer:
            errors.append(f"method-search.js missing contract token: {required_token}")
    for required_token in (
        'fetch("data/api-contract-overlay-v20260906.json")',
        "byName.set(patch.name",
        "state.api = [...byName.values()]",
    ):
        if required_token not in overlay_js:
            errors.append(f"API overlay loader missing contract token: {required_token}")

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
        f"{len(entries)} executable/searchable methods, {len(SMOKE_QUERIES)} learner-query smoke checks,",
        f"deferred not promoted={sorted(deferred)},",
        "method deep-link UI contract present.",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
