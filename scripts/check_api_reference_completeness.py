#!/usr/bin/env python3
"""Validate the public MangoBox method-level API Reference contract.

Reference coverage has two layers:

1. module/mode Markdown for hardware- and execution-specific notes;
2. a structured Method Quick Reference generated from api-index.json.

A public method is therefore considered deep-linkable when the structured
renderer contract is intact, even if an older Markdown page does not contain a
hand-written heading for that method. Hand-written headings are still counted
and reported because they remain useful for richer module notes.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "docs" / "student-guide"
SITE = GUIDE / "site"
DATA = SITE / "data"
API_INDEX = DATA / "api-index.json"
MODULES = DATA / "modules.json"
PARAM_HELP = DATA / "api-parameter-help.json"
DETAILS_JS = SITE / "api-reference-details.js"
SITE_INDEX = SITE / "index.html"
LANGS = ("zh-TW", "en")
ALLOWED_SOURCE_STATUS = {"public-current", "public-stable"}

# Cross-cutting methods are searchable but currently live under a convenient
# module bucket in api-index.json. They are rendered by the structured layer,
# so they do not require duplicate hand-written headings in every page.
GLOBAL_METHODS = {
    "supports", "capabilities", "run_once", "run_forever", "close", "send_command"
}

# Small set of high-risk signatures/semantics that previously drifted in the
# public index. These are deliberately explicit until the private canonical
# method catalog can be published/synchronized automatically.
CANONICAL_SMOKE = {
    "joystick": "m.joystick()",
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
    "sound_level": "m.sound_level()",
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


def reference_path(lang: str, module_id: str, mode: str) -> Path:
    base = GUIDE / lang
    if mode == "host_python":
        base = base / "host-python"
    return base / "reference" / f"{module_id}.md"


def heading_has_method(text: str, method: str) -> bool:
    escaped = re.escape(method)
    pattern = re.compile(
        rf"^#{{2,4}}\s+.*(?:`{escaped}\(\)`|{escaped}\(\)).*$",
        re.MULTILINE,
    )
    return bool(pattern.search(text))


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
    modules_data = load(MODULES)
    param_data = load(PARAM_HELP)
    entries = api.get("entries", [])
    modules = modules_data.get("modules", [])
    module_ids = {m.get("id") for m in modules if m.get("id")}
    errors: list[str] = []

    for label, payload in (
        ("api-index.json", api),
        ("modules.json", modules_data),
        ("api-parameter-help.json", param_data),
    ):
        if payload.get("source_status") not in ALLOWED_SOURCE_STATUS:
            errors.append(
                f"{label} source_status must be one of {sorted(ALLOWED_SOURCE_STATUS)}"
            )

    site_html = SITE_INDEX.read_text(encoding="utf-8")
    details_js = DETAILS_JS.read_text(encoding="utf-8")
    if 'src="api-reference-details.js"' not in site_html:
        errors.append("site/index.html does not load api-reference-details.js")
    for token in REQUIRED_STRUCTURED_JS_TOKENS:
        if token not in details_js:
            errors.append(f"structured Reference renderer missing contract token: {token}")

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
            errors.append(f"invalid API index entry: {entry!r}")
            continue
        if name in names:
            errors.append(f"duplicate API method: {name}")
        names.add(name)
        if module_id not in module_ids:
            errors.append(f"unknown module in API index: {name} -> {module_id}")
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
            errors.append(f"canonical smoke method missing from public index: {name}")
        elif entry.get("signature") != expected:
            errors.append(
                f"stale public signature: {name}: {entry.get('signature')!r} != {expected!r}"
            )

    joystick = next((item for item in entries if item.get("name") == "joystick"), None)
    if joystick:
        combined = f"{joystick.get('zh', '')} {joystick.get('en', '')}".lower()
        if "按鍵狀態" in combined or "switch state" in combined:
            errors.append(
                "joystick() summary is stale: it returns normalized (x, y); "
                "button state belongs to is_joystick_pressed()"
            )

    checked = 0
    manual = 0
    generated = 0
    missing_pages = 0
    for lang in LANGS:
        for module_id, methods in sorted(by_module.items()):
            ordinary = [m for m in methods if m["name"] not in GLOBAL_METHODS]
            if not ordinary:
                continue
            for mode in ("high_level_micropython", "host_python"):
                path = reference_path(lang, module_id, mode)
                # Some capabilities intentionally have no Host page because the
                # current Host profile does not expose them (e.g. line tracking).
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
                        # The Method Quick Reference renders every state.api
                        # entry for the active module with id=api-<method>.
                        generated += 1

    if not entries:
        errors.append("api-index.json exposes no methods")

    if errors:
        print("API Reference completeness FAILED")
        print(
            f"Checked {checked} method/page pairs; "
            f"manual={manual}, structured={generated}, missing_pages={missing_pages}."
        )
        for error in errors:
            print("-", error)
        return 1

    print(
        "API Reference completeness PASS:",
        f"{len(entries)} public methods; {checked} method/page pairs;",
        f"manual headings={manual}, structured quick-reference={generated};",
        "all signature parameters have bilingual help and deep-link rendering."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
