#!/usr/bin/env python3
"""Build version-aware Traditional Chinese MangoBox Student API PDF manuals.

This reads canonical website Markdown and profile metadata. No parallel API text is maintained.
Requires reportlab; embeds a freely distributable Traditional Chinese TTF installed on the builder.
"""
from __future__ import annotations

import argparse
import json
import re
from datetime import date
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether, PageBreak, XPreformatted

BASE = Path(__file__).resolve().parents[1] / "docs" / "student-guide"
DATA = BASE / "site" / "data"
FONT = "MangoCJK"


def font_setup():
    # Embed a real Traditional Chinese TTF: CID font references can render as blank on some PDF readers.
    import os
    path = os.environ.get("MANGOBOX_PDF_FONT", "/usr/share/fonts/truetype/arphic-bkai00mp/bkai00mp.ttf")
    if not Path(path).is_file():
        raise RuntimeError("Missing Traditional Chinese font: " + path)
    pdfmetrics.registerFont(TTFont(FONT, path))


def clean_inline(text):
    text = escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r'<font color="#0d5f4b">\1</font>', text)
    text = re.sub(r"`([^`]+)`", r'<font color="#146c5b">\1</font>', text)
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    return text


def extract(md, styles):
    story, code, para = [], [], []

    def flush_para():
        if para:
            story.append(Paragraph(clean_inline(" ".join(para)), styles["body"]))
            story.append(Spacer(1, 5))
            para.clear()

    def flush_code():
        if code:
            # Wrap very long API signatures without clipping A4 print bounds.
            for line in code:
                if len(line) > 80:
                    line = "\n".join(line[i:i + 78] for i in range(0, len(line), 78))
                story.append(Paragraph('<font color="#234047">' + escape(line or " ") + '</font>', styles["code"]))
            story.append(Spacer(1, 7))
            code.clear()

    inside = False
    for raw in md.splitlines():
        line = raw.strip()
        if line.startswith("```"):
            if not inside:
                flush_para()
                inside = True
            else:
                flush_code()
                inside = False
            continue
        if inside:
            code.append(raw.rstrip())
            continue
        if not line:
            flush_para()
            continue
        if line.startswith("#"):
            flush_para()
            level = len(line) - len(line.lstrip("#"))
            story.append(Paragraph(clean_inline(line[level:].strip()), styles["h1" if level < 3 else "h2"]))
        elif line.startswith("|") and re.match(r"^\|[\s:-]+\|", line):
            continue
        elif line.startswith("|"):
            flush_para()
            story.append(Paragraph(clean_inline(" · ".join(c.strip() for c in line.strip("|").split("|"))), styles["body"]))
        elif line.startswith("- ") or re.match(r"^\d+\. ", line):
            flush_para()
            story.append(Paragraph("• " + clean_inline(re.sub(r"^(?:- |\d+\. )", "", line)), styles["body"]))
        elif line.startswith(">"):
            flush_para()
            story.append(Paragraph(clean_inline(line.lstrip("> ")), styles["note"]))
        else:
            para.append(line)
    flush_para()
    flush_code()
    return story


def footer(c: canvas.Canvas, doc, title):
    c.saveState()
    width, _ = A4
    c.setStrokeColor(colors.HexColor("#cbd5d1"))
    c.line(40, 36, width - 40, 36)
    c.setFont(FONT, 8)
    c.setFillColor(colors.HexColor("#51655f"))
    c.drawString(40, 25, title[:38])
    c.drawRightString(width - 40, 25, f"{doc.page}")
    c.restoreState()


def build(out_dir: Path, profile_id: str, language: str, kind: str):
    data = json.loads((DATA / "profiles.json").read_text(encoding="utf-8"))
    modules = json.loads((DATA / "modules.json").read_text(encoding="utf-8"))["modules"]
    profile = next((p for p in data["profiles"] if p["id"] == profile_id), None)
    if profile is None:
        raise SystemExit(f"Unknown profile {profile_id}")
    available = [m for m in modules if m["capability"] in profile["capabilities"]]
    # Only use canonical documents from selected mode; fail closed on missing material.
    mode_prefix = "host-python/" if profile["mode"] == "host_python" else ""
    folder = "reference" if kind == "reference" else "guides"
    source_dir = BASE / language / mode_prefix / folder
    missing = [m["id"] for m in available if not (source_dir / (m["id"] + ".md")).is_file()]
    if missing:
        raise SystemExit("Incomplete profile documents: " + ", ".join(missing))
    font_setup()
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / f"MangoBox_{kind}_{language}_{profile_id}.pdf"
    styles = {
        "title": ParagraphStyle("title", fontName=FONT, fontSize=23, leading=33, spaceAfter=24, textColor=colors.HexColor("#0d5f4b")),
        "h1": ParagraphStyle("h1", fontName=FONT, fontSize=15, leading=23, spaceBefore=16, spaceAfter=9, textColor=colors.HexColor("#0d5f4b")),
        "h2": ParagraphStyle("h2", fontName=FONT, fontSize=11.5, leading=18, spaceBefore=10, spaceAfter=6),
        "body": ParagraphStyle("body", fontName=FONT, fontSize=9.5, leading=16, spaceAfter=3),
        "code": ParagraphStyle("code", fontName=FONT, fontSize=8, leading=12, leftIndent=12),
        "note": ParagraphStyle("note", fontName=FONT, fontSize=9, leading=15, leftIndent=10, textColor=colors.HexColor("#885a17")),
    }
    title = f"MangoBox {'API Reference' if kind == 'reference' else 'Student Programming Guide'}"
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=46, rightMargin=46, topMargin=50, bottomMargin=53, title=title)
    story = [Paragraph(title, styles["title"])]
    for line in (f"Target: {profile['target']}", f"Mode: {profile['mode']}", f"Runtime: {profile.get('runtime','unknown')}", f"Host package: {profile.get('host_package','N/A')}", f"Generated: {date.today().isoformat()}"):
        story.append(Paragraph(clean_inline(line), styles["body"]))
    story.append(Paragraph("版本與模組支援依官網 profiles.json；實際啟用狀態、接線及 Host 套件仍須確認。", styles["note"]))
    story.append(PageBreak())
    for m in available:
        label = m["labels"].get(language, m["id"])
        story.append(Paragraph(clean_inline(label), styles["h1"]))
        md = (source_dir / (m["id"] + ".md")).read_text(encoding="utf-8")
        story.extend(extract(md, styles))
        story.append(PageBreak())
    # remove trailing PageBreak to avoid unwanted blank page
    if isinstance(story[-1], PageBreak):
        story.pop()
    doc.build(story, onFirstPage=lambda c,d:footer(c,d,title), onLaterPages=lambda c,d:footer(c,d,title))
    print(f"Generated {path} ({len(available)} modules)")
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--output", default="dist/api-manuals")
    ap.add_argument("--language", default="zh-TW", choices=["zh-TW", "en"])
    ap.add_argument("--profile", help="Profile ID; defaults to latest recommended MangoLite Pico2W MicroPython")
    ap.add_argument("--kind", choices=["reference", "guides", "both"], default="both")
    args = ap.parse_args()
    data = json.loads((DATA / "profiles.json").read_text(encoding="utf-8"))
    p = args.profile or data["recommended"]["mangolite-pico2w"]["high_level_micropython"]
    for kind in (["reference", "guides"] if args.kind == "both" else [args.kind]):
        build(Path(args.output), p, args.language, kind)


if __name__ == "__main__":
    main()
