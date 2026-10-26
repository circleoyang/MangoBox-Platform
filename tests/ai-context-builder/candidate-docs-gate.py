"""Regression checks for candidate-doc rejection boundaries; no browser/hardware."""
import ast
import contextlib
import copy
import importlib.util
import io
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("candidate_docs_gate", ROOT / "scripts/check_candidate_docs.py")
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)
CATALOG = gate.read_json(gate.DATA / "candidate-profiles.json")
CONTRACT = gate.read_json(gate.DATA / "candidate-api-contract.json")
SNAPSHOT = gate.read_json(gate.GUIDE / "contracts/source-snapshot.vnext.json")


class CandidateDocsGateTests(unittest.TestCase):
    def test_legacy_signature_block_is_validated_as_complete_declarations(self):
        self.assertTrue(gate.declaration_block(
            "servo(angle) -> None\nservo_get_angle()\nservo_release() -> None", "legacy.md"))
        for invalid in ("m.light(,)", "m.servo(angle) -> None\nif broken",
                        "m.light() -> int\nm.servo(90)", "m.light()\nprint('ok')"):
            self.assertFalse(gate.declaration_block(invalid, "invalid.md"), invalid)
        with self.assertRaises(SyntaxError):
            ast.parse("m.light(,)")

    def test_fence_boundaries_do_not_parse_prose_as_python(self):
        blocks, prose = gate.fences(
            "```python\nm.light()\n```\nNormal prose.\n```text\nnot python\n```", "example.md")
        self.assertEqual([language for language, _, _ in blocks], ["python", "text"])
        self.assertEqual([name for name, _ in gate.method_calls(ast.parse(blocks[0][2]))], ["light"])
        self.assertIn("Normal prose.", prose)
        with self.assertRaisesRegex(ValueError, "unclosed"):
            gate.fences("```python\nm.light()", "truncated.md")

    def test_lite_does_not_inherit_x2_keywords(self):
        by_name = {entry["name"]: entry for entry in CONTRACT["entries"] if entry["family"] == "mangolite"}
        for code in ("m.on_light_above(60, callback, period=100)",
                     "m.on_sound_below(30, callback, period=100)", "m.servo(90, name='arm')"):
            name, call = next(gate.method_calls(ast.parse(code)))
            with self.assertRaisesRegex(ValueError, "unexpected keyword"):
                gate.bind_call(gate.signature(by_name[name]), call, code)

    def test_missing_required_argument_and_metadata_drift_are_rejected(self):
        entry = next(e for e in CONTRACT["entries"] if e["family"] == "mangolite" and e["name"] == "servo")
        _, call = next(gate.method_calls(ast.parse("m.servo()")))
        with self.assertRaisesRegex(ValueError, "missing a required argument"):
            gate.bind_call(gate.signature(entry), call, "missing-angle")
        changed = copy.deepcopy(entry)
        changed["parameters"][0]["required"] = False
        with self.assertRaisesRegex(ValueError, "metadata/signature mismatch"):
            gate.signature(changed)

    def test_broken_relative_link_and_unsafe_route_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "broken relative link"):
            gate.relative_links(gate.GUIDE / "candidate/README.md", "[broken](missing-test-page.md)", {})
        profile = copy.deepcopy(CATALOG["profiles"][0])
        profile["documents"]["led"]["guide"] = "../outside/{lang}/guide.md"
        with self.assertRaisesRegex(ValueError, "Unsafe"):
            gate.route(profile, "led", "zh-TW", "guide")

    def test_invalid_candidate_scope_is_rejected_before_publication(self):
        cases = [
            ("source", "source mismatch"), ("host", "Host boundary"),
            ("wireless", "method scope differs"), ("overlay", "overlay-only"),
            ("duplicate", "Duplicate target/method"), ("missing-page", "Missing/empty learner page"),
            ("missing-dependency", "dependency is absent"),
        ]
        for name, message in cases:
            with self.subTest(name=name):
                catalog, contract, snapshot = copy.deepcopy((CATALOG, CONTRACT, SNAPSHOT))
                profile = next(p for p in catalog["profiles"] if p["target"] == "barepico-pico")
                if name == "source":
                    contract["source_commit"] = "0" * 40
                elif name == "host":
                    profile["mode"] = "host_python"
                elif name == "wireless":
                    profile["allowed_methods"].append("clock_sync_ntp")
                elif name == "overlay":
                    contract["entries"][0]["available_in_default_build"] = False
                elif name == "duplicate":
                    contract["entries"].append(copy.deepcopy(contract["entries"][0]))
                elif name == "missing-page":
                    profile["documents"]["led"]["guide"] = "candidate/missing/{lang}/guides/led.md"
                else:
                    profile["module_dependencies"]["oled"] = []
                documents = {gate.DATA / "candidate-profiles.json": catalog,
                             gate.DATA / "candidate-api-contract.json": contract,
                             gate.GUIDE / "contracts/source-snapshot.vnext.json": snapshot}
                with patch.object(gate, "read_json", side_effect=lambda path: documents[path]):
                    with contextlib.redirect_stdout(io.StringIO()):
                        with self.assertRaisesRegex(ValueError, message):
                            gate.main()


if __name__ == "__main__":
    unittest.main()
