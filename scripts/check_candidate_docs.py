#!/usr/bin/env python3
"""Check candidate learning routes, examples and scope without network or hardware.

All routed pages, including reused stable pages, receive Python syntax, m.* call
scope/signature and relative-link checks. The seven numbered learning sections
apply only to candidate Guides. The shared DHT family-selection landing pages
are the only Guide exceptions and must contain no executable Python examples.
Legacy declaration-only Python fences are parsed as declarations, never executed.
"""
from __future__ import annotations

import ast
import inspect
import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "docs/student-guide"
DATA = GUIDE / "site/data"
LANGUAGES = ("zh-TW", "en")
PYTHON = {"python", "py", "micropython"}
MODULE_MAP = {"rgb": "led", "drive": "motor", "ble_control": "ble-control", "core": "lifecycle"}
LANDINGS = {Path("candidate/shared") / language / kind / "dht11.md"
            for language in LANGUAGES for kind in ("guides", "reference")}
MAINTENANCE_PAGES = {Path("candidate/README.md")}
NAME = r"(?:m\.)?([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)"
DECLARATION = re.compile(NAME + r"\s*(\(.*\))(?:\s*->\s*(.+))?$")
SENTINEL = object()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def fences(text, filename):
    """A stateful scan cannot mistake a closing fence for an unlabelled opener."""
    opened = None
    blocks, prose, lines = [], [], []
    for number, line in enumerate(text.splitlines(), 1):
        if opened:
            if re.fullmatch(r" {0,3}" + re.escape(opened[0]) + "{" + str(opened[1]) + r",}\s*", line):
                blocks.append((opened[2], opened[3], "\n".join(lines)))
                opened, lines = None, []
            else:
                lines.append(line)
            prose.append("")
            continue
        match = re.match(r"^ {0,3}(`{3,}|~{3,})([^\r\n]*)$", line)
        if match:
            marker, info = match.groups()
            opened = (marker[0], len(marker), info.strip().lower(), number + 1)
            prose.append("")
        else:
            prose.append(line)
    require(opened is None, f"{filename}: unclosed Markdown code fence")
    return blocks, "\n".join(prose)


def declaration_block(code, filename):
    """Accept only complete typed/return-annotated signature blocks, not bad code."""
    lines = [line.strip() for line in code.splitlines()
             if line.strip() and not line.lstrip().startswith("#")]
    matches = [DECLARATION.fullmatch(line) for line in lines]
    if not lines or not all(matches):
        return False
    definitions = []
    for match in matches:
        tail = match.group(2) + (" -> " + match.group(3) if match.group(3) else "")
        try:
            node = ast.parse("def _signature" + tail + ":\n    pass", filename=filename).body[0]
        except SyntaxError:
            return False
        definitions.append(node)
    # foo(x) is a real call; only explicit declaration syntax changes its meaning.
    return any(node.returns or any(arg.annotation for arg in
               node.args.posonlyargs + node.args.args + node.args.kwonlyargs)
               for node in definitions)


def signature(entry):
    match = DECLARATION.fullmatch(entry["signature"])
    require(match is not None and match.group(1) == entry["name"],
            "Invalid method signature: " + entry["signature"])
    function = ast.parse("def _signature" + match.group(2) + ":\n    pass").body[0]
    args = function.args
    positional = args.posonlyargs + args.args
    optional_from = len(positional) - len(args.defaults)
    parameters = []
    for index, arg in enumerate(positional):
        kind = inspect.Parameter.POSITIONAL_ONLY if index < len(args.posonlyargs) else inspect.Parameter.POSITIONAL_OR_KEYWORD
        parameters.append(inspect.Parameter(arg.arg, kind, default=SENTINEL if index >= optional_from else inspect.Parameter.empty))
    if args.vararg:
        parameters.append(inspect.Parameter(args.vararg.arg, inspect.Parameter.VAR_POSITIONAL))
    for arg, default in zip(args.kwonlyargs, args.kw_defaults):
        parameters.append(inspect.Parameter(arg.arg, inspect.Parameter.KEYWORD_ONLY,
                          default=SENTINEL if default is not None else inspect.Parameter.empty))
    if args.kwarg:
        parameters.append(inspect.Parameter(args.kwarg.arg, inspect.Parameter.VAR_KEYWORD))
    result = inspect.Signature(parameters)
    # The rendered parameter table and the actual signature must agree.
    declared = [(p["name"], p["kind"], bool(p["required"])) for p in entry["parameters"]]
    parsed = [(p.name, p.kind.name.lower(), p.default is p.empty and p.kind not in
               (p.VAR_POSITIONAL, p.VAR_KEYWORD)) for p in parameters]
    require(declared == parsed, "Parameter metadata/signature mismatch: " + entry["signature"])
    return result


def method_calls(tree):
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        value, parts = node.func, []
        while isinstance(value, ast.Attribute):
            parts.append(value.attr)
            value = value.value
        if isinstance(value, ast.Name) and value.id == "m" and parts:
            yield ".".join(reversed(parts)), node


def bind_call(method_signature, call, where):
    require(not any(isinstance(arg, ast.Starred) for arg in call.args) and
            all(keyword.arg is not None for keyword in call.keywords),
            where + ": dynamic *args/**kwargs cannot be checked; use explicit documented arguments")
    try:
        method_signature.bind(*[SENTINEL for _ in call.args],
                              **{keyword.arg: SENTINEL for keyword in call.keywords})
    except TypeError as error:
        raise ValueError(where + ": " + str(error)) from error


def route(profile, module, language, kind):
    override = profile.get("documents", {}).get(module, {}).get(kind)
    prefix = profile["documentation_root"] + "/" + language + "/"
    value = (override.replace("{lang}", language) if override else
             prefix + ("guides" if kind == "guide" else "reference") + "/" + module + ".md")
    require(not value.startswith("/") and not re.search(r"[\\?#:]", value) and
            all(part not in ("", ".", "..") for part in value.split("/")),
            "Unsafe candidate document route: " + value)
    relative = Path(value)
    require(language in relative.parts, "Route language mismatch: " + value)
    return relative


def heading_ids(prose):
    found, counts = set(), Counter()
    for heading in re.findall(r"^ {0,3}#{1,6}\s+(.+?)(?:\s+#+)?$", prose, re.M):
        # GitHub-style identifiers for the headings used in this documentation.
        heading = re.sub(r"[`*]|<[^>]+>", "", heading).strip().lower()
        base = "".join(c for c in heading if c in "-_ " or
                       not unicodedata.category(c).startswith(("P", "S"))).replace(" ", "-")
        slug = base + ("-" + str(counts[base]) if counts[base] else "")
        counts[base] += 1
        found.add(slug)
    return found


def relative_links(path, prose, cache):
    links = [a or b for a, b in re.findall(r"!?\[[^\]\n]*\]\(\s*(?:<([^>\n]+)>|([^\s)]+))(?:\s+[\"'][^\n]*?[\"'])?\s*\)", prose)]
    links += re.findall(r"^\s*\[[^\]]+\]:\s*<?([^\s>]+)>?", prose, re.M)
    checked = 0
    for raw in links:
        url = urlsplit(raw)
        if url.scheme or url.netloc:
            require(url.scheme in ("http", "https", "mailto"), f"{path}: unsafe link {raw}")
            continue
        require(not url.path.startswith("/"), f"{path}: use a repository-relative link: {raw}")
        target = (path.parent / unquote(url.path)).resolve() if url.path else path.resolve()
        require(target.is_relative_to(ROOT) and target.is_file(), f"{path}: broken relative link {raw}")
        if url.fragment and target.suffix == ".md":
            if target not in cache:
                cache[target] = fences(target.read_text(encoding="utf-8"), target)[1]
            require(unquote(url.fragment) in heading_ids(cache[target]), f"{path}: missing heading anchor {raw}")
        checked += 1
    return checked


def main():
    catalog = read_json(DATA / "candidate-profiles.json")
    contract = read_json(DATA / "candidate-api-contract.json")
    snapshot = read_json(GUIDE / "contracts/source-snapshot.vnext.json")
    for key in ("source_commit", "source_repository"):
        require(catalog[key] == contract[key] == snapshot[key], "Candidate source mismatch: " + key)
    require(re.fullmatch(r"[0-9a-f]{40}", snapshot["source_commit"]), "Invalid source SHA")
    modules = {row["id"]: row for row in catalog["modules"]}
    require(len(modules) == len(catalog["modules"]), "Duplicate module identifiers")
    profiles = catalog["profiles"]
    require(len({p["id"] for p in profiles}) == len(profiles), "Duplicate profile identifiers")
    target_families = {target: family for family, data in snapshot["families"].items()
                       for target in data["targets"]}
    require({p["target"] for p in profiles} == set(target_families), "Missing or unexpected candidate target")
    excluded = {row["name"] for row in contract["excluded_names"]}
    entries, signatures = {}, {}
    for entry in contract["entries"]:
        require(entry["name"] not in excluded and entry.get("available_in_default_build") is True,
                "Excluded/overlay-only method leaked into default contract: " + entry["name"])
        require(entry["module"] in modules, "Contract has no learner module: " + entry["name"])
        sig = signature(entry)
        for target in entry["targets"]:
            require(target_families.get(target) == entry["family"], "Cross-family contract: " + entry["name"])
            key = (target, entry["name"])
            require(key not in entries, "Duplicate target/method contract: " + str(key))
            entries[key], signatures[key] = entry, sig
    stats, routes, page_profiles, trees, declarations, prose_cache = Counter(), set(), {}, {}, {}, {}
    for profile in profiles:
        target, family = profile["target"], target_families[profile["target"]]
        require(profile["release_status"] == "candidate" and profile["mode"] == "high_level_micropython",
                "Candidate/stable/Host boundary violated: " + profile["id"])
        require(profile["runtime"] == snapshot["versions"][family], "Runtime/source mismatch: " + target)
        for key in ("source_commit", "source_repository"):
            require(profile[key] == snapshot[key], "Profile source mismatch: " + target)
        allowed = set(profile["allowed_methods"])
        expected = set()
        for method in snapshot["families"][family]["methods"]:
            module = MODULE_MAP.get(method["module"], method["module"])
            if (method.get("code_generation_allowed") and method.get("available_in_default_build") is not False and
                    target in method["targets"] and not (target.endswith("-pico") and
                    (module in ("wifi", "ble-control") or method["name"] == "clock_sync_ntp"))):
                expected.add(method["name"])
        require(allowed == expected == {name for t, name in entries if t == target},
                "Profile/contract/source method scope differs: " + target)
        require(len(allowed) == len(profile["allowed_methods"]), "Duplicate allowed method: " + target)
        supported = {entries[(target, name)]["module"] for name in allowed}
        require(supported == set(profile["capabilities"]) == set(profile["documents"]),
                "Incomplete learner module routing: " + target)
        if target.endswith("-pico"):
            require(not ({"wifi", "ble-control"} & supported) and "clock_sync_ntp" not in allowed,
                    "Wireless API leaked onto plain Pico: " + target)
        if family == "barepico":
            require("supports" not in allowed, "BarePico has no supports() method")
        for module in sorted(supported):
            require(module in modules, "Unknown learner module: " + module)
            declared = set(modules[module]["methods"]) & allowed
            actual = {name for name in allowed if entries[(target, name)]["module"] == module}
            require(declared == actual, "Module method scope mismatch: " + target + " / " + module)
            dependencies = profile["module_dependencies"].get(module)
            require(isinstance(dependencies, list) and set(dependencies) <= supported,
                    "Invalid module dependencies: " + target + " / " + module)
            for language in LANGUAGES:
                for kind in ("guide", "reference"):
                    relative = route(profile, module, language, kind)
                    path = GUIDE / relative
                    require(path.is_file() and path.stat().st_size, "Missing/empty learner page: " + str(relative))
                    routes.add((profile["id"], language, module, kind))
                    page_profiles.setdefault(relative, []).append((profile, module))
    all_pages = set(page_profiles) | {path.relative_to(GUIDE) for path in (GUIDE / "candidate").rglob("*.md")}
    for relative in sorted(all_pages):
        path = GUIDE / relative
        blocks, prose = fences(path.read_text(encoding="utf-8"), relative)
        prose_cache[path.resolve()] = prose
        if relative.parts[0] == "candidate":
            require(relative in page_profiles or relative in LANDINGS or relative in MAINTENANCE_PAGES,
                    "Unrouted candidate page: " + str(relative))
            if relative not in MAINTENANCE_PAGES:
                other = Path(*(part if part not in LANGUAGES else LANGUAGES[1 - LANGUAGES.index(part)] for part in relative.parts))
                require((GUIDE / other).is_file(), "Missing bilingual counterpart: " + str(other))
            if "guides" in relative.parts and relative not in LANDINGS:
                numbered = [int(n) for n in re.findall(r"^##\s+(\d+)[.)]\s", prose, re.M)]
                require(numbered == list(range(1, 8)), "Guide needs numbered sections 1–7: " + str(relative))
                stats["seven_section_guides"] += 1
        trees[relative], declarations[relative] = [], []
        for language, start, code in blocks:
            if language not in PYTHON:
                continue
            require(relative not in LANDINGS, "DHT family landing must not mix executable examples: " + str(relative))
            if declaration_block(code, str(relative)):
                for line in code.splitlines():
                    match = DECLARATION.fullmatch(line.strip())
                    if match:
                        declarations[relative].append(match.group(1))
                stats["declaration_fences"] += 1
                continue
            try:
                tree = ast.parse(code, filename=str(relative))
            except SyntaxError as error:
                raise ValueError(f"{relative}:{start + (error.lineno or 1) - 1}: {error.msg}") from error
            trees[relative].append((tree, start))
            stats["python_examples"] += 1
        stats["relative_links"] += relative_links(path, prose, prose_cache)
    for relative, associations in page_profiles.items():
        for profile, module in associations:
            target, allowed = profile["target"], set(profile["allowed_methods"])
            for name in declarations[relative]:
                require(name in allowed, f"{relative} [{target}]: declaration outside target contract: " + name)
            used = set()
            for tree, start in trees[relative]:
                for name, call in method_calls(tree):
                    where = f"{relative}:{start + call.lineno - 1} [{target}] m.{name}"
                    require(name in allowed, where + ": method outside the target contract")
                    bind_call(signatures[(target, name)], call, where)
                    used.add(entries[(target, name)]["module"])
                    stats["profile_call_checks"] += 1
            require(used - {module} <= set(profile["module_dependencies"][module]),
                    f"{relative} [{target}]: example dependency is absent from profile metadata")
    print("CANDIDATE DOCS PASS: " + ", ".join((
        f"{len(profiles)} profiles × {len(LANGUAGES)} languages", f"{len(routes)} Guide/Reference routes",
        f"{len(all_pages)} unique pages", f"{stats['seven_section_guides']} seven-section candidate Guides",
        f"{stats['python_examples']} Python examples", f"{stats['profile_call_checks']} profile-specific call bindings",
        f"{stats['declaration_fences']} legacy declaration fences", f"{stats['relative_links']} relative links")))
    print("Scope: candidate and reused stable examples; source/target/mode/wireless/default-build boundaries. No hardware or external-link validation.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, TypeError, OSError, SyntaxError) as error:
        print("CANDIDATE DOCS FAIL: " + str(error), file=sys.stderr)
        raise SystemExit(1)
