#!/usr/bin/env python3
"""Validate the public MangoBox method-level API Reference contract."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "docs" / "student-guide"
SITE = GUIDE / "site"
DATA = SITE / "data"
API_INDEX = DATA / "api-index.json"
API_OVERLAY = DATA / "api-contract-overlay-v20260906.json"
BLE_OVERLAY = DATA / "ble-control-api-overlay-v20260913.json"
MODULES = DATA / "modules.json"
PARAM_HELP = DATA / "api-parameter-help.json"
OVERLAY_JS = SITE / "api-contract-overlay-v20260906.js"
BLE_OVERLAY_JS = SITE / "ble-control-api-overlay-v20260913.js"
DETAILS_JS = SITE / "api-reference-details.js"
SITE_INDEX = SITE / "index.html"
LANGS = ("zh-TW", "en")
ALLOWED_SOURCE_STATUS = {"public-current", "public-stable"}

GLOBAL_METHODS = {"supports", "capabilities", "run_once", "run_forever", "close", "send_command"}

CANONICAL_SMOKE = {
    "joystick": "m.joystick()",
    "is_joystick_pressed": "m.is_joystick_pressed()",
    "on_joystick_pressed": "m.on_joystick_pressed(callback, period=50)",
    "on_joystick_released": "m.on_joystick_released(callback, period=50)",
    "calibrate_joystick": "m.calibrate_joystick(samples=16)",
    "servo": "m.servo(angle, name=None)",
    "servo_move_to": "m.servo_move_to(angle, step=5, period=60, name=None)",
    "servo_sweep": "m.servo_sweep(min_angle=0, max_angle=180, step=5, period=50, name=None)",
    "servo_stop": "m.servo_stop(name=None)",
    "servo_get_angle": "m.servo_get_angle(name=None)",
    "servo_release": "m.servo_release(name=None)",
    "is_motion_detected": "m.is_motion_detected()",
    "on_motion_detected": "m.on_motion_detected(callback)",
    "on_motion_cleared": "m.on_motion_cleared(callback)",
    "light": "m.light()",
    "on_light_above": "m.on_light_above(threshold, callback, hysteresis=5, period=100)",
    "on_light_below": "m.on_light_below(threshold, callback, hysteresis=5, period=100)",
    "sound_level": "m.sound_level()",
    "on_sound_above": "m.on_sound_above(threshold, callback, hysteresis=5, period=100)",
    "on_sound_below": "m.on_sound_below(threshold, callback, hysteresis=5, period=100)",
    "on_control": "m.on_control(control, action, callback, controller=\"primary\")",
    "on_control_pressed": "m.on_control_pressed(control, callback, controller=\"primary\")",
    "on_control_released": "m.on_control_released(control, callback, controller=\"primary\")",
    "on_control_joystick": "m.on_control_joystick(callback, controller=\"primary\")",
    "control_name": "m.control_name()",
    "control_connected": "m.control_connected()",
}

REQUIRED_STRUCTURED_JS_TOKENS = (
    'fetch("data/api-parameter-help.json")',
    "entry.module === state.module",
    "renderMethodCard",
    "parseSignature",
    "renderParameterTable",
    "returnDescription",
    "generatedExample",
    'id="${methodId(entry.name)}"',
    "MutationObserver",
)


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


def reference_path(lang: str, module_id: str, mode: str) -> Path:
    base = GUIDE / lang
    if mode == "host_python":
        base = base / "host-python"
    return base / "reference" / f"{module_id}.md"


def heading_has_method(text: str, method: str) -> bool:
    escaped = re.escape(method)
    return bool(re.search(rf"^#{{2,4}}\s+.*(?:`{escaped}\(\)`|{escaped}\(\)).*$", text, re.MULTILINE))


def split_parameters(raw: str) -> list[str]:
    parts: list[str] = []
    token: list[str] = []
    depth = 0
    quote: str | None = None
    previous = ""
    for ch in raw:
        if quote:
            token.append(ch)
            if ch == quote and previous != "\\":
                quote = None
        elif ch in {"'", '"'}:
            quote = ch
            token.append(ch)
        elif ch in "([{<":
            depth += 1
            token.append(ch)
        elif ch in ")]}>":
            depth = max(0, depth - 1)
            token.append(ch)
        elif ch == "," and depth == 0:
            value = "".join(token).strip()
            if value:
                parts.append(value)
            token = []
        else:
            token.append(ch)
        previous = ch
    value = "".join(token).strip()
    if value:
        parts.append(value)
    return parts


def signature_parameters(signature: str) -> list[str]:
    open_at = signature.find("(")
    close_at = signature.rfind(")")
    if open_at < 0 or close_at < open_at:
        return []
    raw = signature[open_at + 1 : close_at].strip()
    if not raw:
        return []
    names: list[str] = []
    for part in split_parameters(raw):
        left = part.split("=", 1)[0].strip().lstrip("*")
        name = left.split(":", 1)[0].strip()
        if name:
            names.append(name)
    return names


def main() -> int:
    api = load(API_INDEX)
    overlay = load(API_OVERLAY)
    ble_overlay = load(BLE_OVERLAY)
    modules_data = load(MODULES)
    param_data = load(PARAM_HELP)
    legacy_entries = merge_entries(api, overlay)
    entries = merge_entries(api, overlay, ble_overlay)
    modules = modules_data.get("modules", [])
    module_ids = {m.get("id") for m in modules if m.get("id")}
    errors: list[str] = []

    for label, payload in (
        ("api-index.json", api),
        ("api-contract-overlay-v20260906.json", overlay),
        ("ble-control-api-overlay-v20260913.json", ble_overlay),
        ("modules.json", modules_data),
        ("api-parameter-help.json", param_data),
    ):
        if payload.get("source_status") not in ALLOWED_SOURCE_STATUS:
            errors.append(f"{label} source_status must be one of {sorted(ALLOWED_SOURCE_STATUS)}")

    if overlay.get("base_method_count") != len(api.get("entries", [])):
        errors.append("base API count drift")
    if overlay.get("expected_public_methods") != len(legacy_entries):
        errors.append(f"2026-09-06 public API count drift: {len(legacy_entries)} != {overlay.get('expected_public_methods')}")
    if ble_overlay.get("expected_total_public_methods") != len(entries):
        errors.append(f"BLE public API count drift: {len(entries)} != {ble_overlay.get('expected_total_public_methods')}")
    deferred = set(overlay.get("deferred_not_promoted", []))
    if deferred & {entry.get("name") for entry in entries}:
        errors.append(f"deferred APIs must not be promoted: {sorted(deferred)}")

    site_html = SITE_INDEX.read_text(encoding="utf-8")
    overlay_js = OVERLAY_JS.read_text(encoding="utf-8")
    ble_js = BLE_OVERLAY_JS.read_text(encoding="utf-8")
    details_js = DETAILS_JS.read_text(encoding="utf-8")
    scripts = [
        'src="app.js"',
        'src="api-contract-overlay-v20260906.js"',
        'src="api-reference-details.js"',
        'src="method-search.js"',
        'src="ble-control-api-overlay-v20260913.js"',
    ]
    positions = [site_html.find(token) for token in scripts]
    if any(position < 0 for position in positions):
        errors.append("site/index.html is missing one or more API scripts")
    elif positions != sorted(positions):
        errors.append("API scripts must load app -> base overlay -> reference details -> search -> BLE overlay")

    for token in ('fetch("data/api-contract-overlay-v20260906.json")', "new Map(state.api.map", "byName.set(patch.name", "state.api = [...byName.values()]", "expected_public_methods"):
        if token not in overlay_js:
            errors.append(f"base API overlay loader missing token: {token}")
    for token in ('fetch("data/ble-control-api-overlay-v20260913.json")', "new Map(state.api.map", "state.api = [...byName.values()]", "expected_total_public_methods"):
        if token not in ble_js:
            errors.append(f"BLE API overlay loader missing token: {token}")
    for token in REQUIRED_STRUCTURED_JS_TOKENS:
        if token not in details_js:
            errors.append(f"structured Reference renderer missing token: {token}")

    param_help = param_data.get("parameters", {})
    if not isinstance(param_help, dict):
        errors.append("api-parameter-help.json parameters must be an object")
        param_help = {}

    names: set[str] = set()
    by_module: dict[str, list[dict]] = {}
    for entry in entries:
        name = entry.get("name")
        module_id = entry.get("module")
        signature = entry.get("signature")
        if not name or not module_id or not signature:
            errors.append(f"invalid merged API entry: {entry!r}")
            continue
        if name in names:
            errors.append(f"duplicate merged API method: {name}")
        names.add(name)
        if module_id not in module_ids:
            errors.append(f"unknown module in API contract: {name} -> {module_id}")
            continue
        if not entry.get("zh") or not entry.get("en"):
            errors.append(f"method must have zh/en summary: {name}")
        by_module.setdefault(module_id, []).append(entry)

        for param in signature_parameters(signature):
            record = param_help.get(param)
            if not isinstance(record, dict):
                errors.append(f"missing shared parameter help: {name}({param})")
                continue
            if not str(record.get("zh-TW", "")).strip() or not str(record.get("en", "")).strip():
                errors.append(f"parameter help must be bilingual: {param}")

    for name, expected in CANONICAL_SMOKE.items():
        entry = next((item for item in entries if item.get("name") == name), None)
        if entry is None:
            errors.append(f"canonical smoke method missing: {name}")
        elif entry.get("signature") != expected:
            errors.append(f"stale public signature: {name}: {entry.get('signature')!r} != {expected!r}")

    checked = manual = generated = missing_pages = 0
    for lang in LANGS:
        for module_id, methods in sorted(by_module.items()):
            ordinary = [m for m in methods if m["name"] not in GLOBAL_METHODS]
            if not ordinary:
                continue
            for mode in ("high_level_micropython", "host_python"):
                path = reference_path(lang, module_id, mode)
                if mode == "host_python" and not path.is_file():
                    continue
                if not path.is_file():
                    errors.append(f"missing Reference file: {path.relative_to(ROOT)}")
                    missing_pages += 1
                    continue
                text = path.read_text(encoding="utf-8")
                for entry in ordinary:
                    checked += 1
                    if heading_has_method(text, entry["name"]):
                        manual += 1
                    else:
                        generated += 1

    if errors:
        print("API Reference completeness FAILED")
        print(f"Merged public methods={len(entries)}; checked {checked} method/page pairs; manual={manual}, structured={generated}, missing_pages={missing_pages}.")
        for error in errors:
            print("-", error)
        return 1

    print(
        "API Reference completeness PASS:",
        f"{len(entries)} executable/searchable public methods; {checked} method/page pairs;",
        f"manual headings={manual}, structured quick-reference={generated};",
        f"deferred not promoted={sorted(deferred)}; BLE Control reference included.",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
