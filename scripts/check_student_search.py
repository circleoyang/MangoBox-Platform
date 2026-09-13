#!/usr/bin/env python3
"""Validate MangoBox Student Guide method-level search contract."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "docs" / "student-guide" / "site"
API_INDEX = SITE / "data" / "api-index.json"
API_OVERLAY = SITE / "data" / "api-contract-overlay-v20260906.json"
BLE_OVERLAY = SITE / "data" / "ble-control-api-overlay-v20260913.json"
MODULES = SITE / "data" / "modules.json"
INDEX_HTML = SITE / "index.html"
METHOD_SEARCH = SITE / "method-search.js"
OVERLAY_JS = SITE / "api-contract-overlay-v20260906.js"
BLE_OVERLAY_JS = SITE / "ble-control-api-overlay-v20260913.js"

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
    "BLE": {"on_control", "on_control_pressed", "control_name"},
    "Dabble": {"on_control_pressed", "on_control_joystick"},
    "手機遙控": {"on_control_pressed", "on_control_released"},
    "BLE joystick": {"on_control_joystick"},
    "配對名稱": {"control_name"},
    "連線狀態": {"control_connected"},
}


def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def merge_entries(base: dict, *overlays: dict) -> list[dict]:
    by_name: dict[str, dict] = {}
    order: list[str] = []
    for payload in (base, *overlays):
        for patch in payload.get("entries", []):
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
    fields = [entry.get("name", ""), entry.get("signature", ""), entry.get("zh", ""), entry.get("en", ""), *(entry.get("aliases") or [])]
    if module:
        labels = module.get("labels") or {}
        summary = module.get("summary") or {}
        fields.extend([labels.get("zh-TW", ""), labels.get("en", ""), summary.get("zh-TW", ""), summary.get("en", "")])
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
    ble_data = load(BLE_OVERLAY)
    modules_data = load(MODULES)
    entries = merge_entries(api_data, overlay_data, ble_data)
    modules = {m.get("id"): m for m in modules_data.get("modules", []) if m.get("id")}

    if api_data.get("schema_version") != 2:
        errors.append("api-index.json schema_version must be 2")
    if overlay_data.get("schema_version") != 1 or ble_data.get("schema_version") != 1:
        errors.append("API overlay schema_version must be 1")
    if not entries:
        errors.append("merged public method contract must not be empty")

    base_count = len(api_data.get("entries", []))
    if base_count != overlay_data.get("base_method_count"):
        errors.append(f"base method count drift: {base_count} != {overlay_data.get('base_method_count')}")
    legacy_entries = merge_entries(api_data, overlay_data)
    if len(legacy_entries) != overlay_data.get("expected_public_methods"):
        errors.append(f"2026-09-06 public method count drift: {len(legacy_entries)} != {overlay_data.get('expected_public_methods')}")
    if len(entries) != ble_data.get("expected_total_public_methods"):
        errors.append(f"BLE public method count drift: {len(entries)} != {ble_data.get('expected_total_public_methods')}")

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
    ble_js = BLE_OVERLAY_JS.read_text(encoding="utf-8") if BLE_OVERLAY_JS.is_file() else ""
    required_scripts = (
        'src="api-contract-overlay-v20260906.js"',
        'src="method-search.js"',
        'src="ble-control-api-overlay-v20260913.js"',
    )
    for token in required_scripts:
        if token not in html:
            errors.append(f"student-guide site missing script: {token}")
    if 'data-q="呼吸燈"' not in html or 'data-q="BLE"' not in html or 'data-q="Dabble"' not in html:
        errors.append("student-guide search hints must include 呼吸燈, BLE, and Dabble")
    for required_token in ("data-api-name", "openMethod", "api-method-anchor", "simplifyIntent"):
        if required_token not in enhancer:
            errors.append(f"method-search.js missing contract token: {required_token}")
    for required_token in ('fetch("data/api-contract-overlay-v20260906.json")', "byName.set(patch.name", "state.api = [...byName.values()]"):
        if required_token not in overlay_js:
            errors.append(f"base API overlay loader missing contract token: {required_token}")
    for required_token in ('fetch("data/ble-control-api-overlay-v20260913.json")', "state.api = [...byName.values()]", "expected_total_public_methods"):
        if required_token not in ble_js:
            errors.append(f"BLE API overlay loader missing contract token: {required_token}")

    for query, expected_names in SMOKE_QUERIES.items():
        matched = {entry.get("name") for entry in entries if matches(entry, modules.get(entry.get("module")), query)}
        if not (matched & expected_names):
            errors.append(f"search smoke failed: {query!r} expected one of {sorted(expected_names)}, got {sorted(x for x in matched if x)}")

    critical_refs = {
        "zh-TW LED": ROOT / "docs" / "student-guide" / "zh-TW" / "reference" / "led.md",
        "en LED": ROOT / "docs" / "student-guide" / "en" / "reference" / "led.md",
        "zh-TW BLE": ROOT / "docs" / "student-guide" / "zh-TW" / "reference" / "ble-control.md",
        "en BLE": ROOT / "docs" / "student-guide" / "en" / "reference" / "ble-control.md",
    }
    for label, path in critical_refs.items():
        text = path.read_text(encoding="utf-8") if path.is_file() else ""
        if "LED" in label and ("breath()" not in text or "led_start_breathing()" not in text):
            errors.append(f"{label} Reference must document breath()/led_start_breathing()")
        if "BLE" in label and ("on_control_pressed" not in text or "on_control_joystick" not in text or "control_name" not in text):
            errors.append(f"{label} Reference must document BLE Control canonical methods")

    if errors:
        print("Student API search validation FAILED")
        for error in errors:
            print("-", error)
        return 1

    print(
        "Student API search validation PASS:",
        f"{len(entries)} executable/searchable methods, {len(SMOKE_QUERIES)} learner-query smoke checks,",
        f"BLE overlay methods={len(ble_data.get('entries', []))},",
        f"deferred not promoted={sorted(deferred)}, method deep-link UI contract present.",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
