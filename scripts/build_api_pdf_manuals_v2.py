#!/usr/bin/env python3
"""MangoBox branded PDF manuals v2 — canonical Markdown, navigable TOC, hyperlinks."""
from __future__ import annotations
import argparse, json, re
from datetime import date
from html import escape
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether
from reportlab.platypus.tableofcontents import TableOfContents

BASE=Path(__file__).resolve().parents[1]/"docs"/"student-guide"
DATA=BASE/"site"/"data"
NAVY=colors.HexColor("#172033")
MUTED=colors.HexColor("#64748b")
ORANGE=colors.HexColor("#ff7a16")
CYAN=colors.HexColor("#13b8d4")
PALE=colors.HexColor("#fff7ed")
LINE=colors.HexColor("#dbe3ec")
FONT="MangoCJK"
SITE="https://circleoyang.github.io/MangoBox-Platform/docs/student-guide/site/"
PAGESIZE=A4

def font_setup():
    import os
    p=os.environ.get("MANGOBOX_PDF_FONT","/usr/share/fonts/truetype/arphic-bkai00mp/bkai00mp.ttf")
    if not Path(p).is_file(): raise RuntimeError("Required embeddable CJK font missing: "+p)
    pdfmetrics.registerFont(TTFont(FONT,p))

def inline(s):
    s=escape(s)
    s=re.sub(r'\*\*(.+?)\*\*',r'<font color="#d85d00">\1</font>',s)
    s=re.sub(r'`([^`]+)`',r'<font color="#087ea4">\1</font>',s)
    s=re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)',r'<link href="\2" color="#087ea4">\1</link>',s)
    s=re.sub(r'\[([^\]]+)\]\((?:\.\.?/)[^)]+\)',r'\1',s)
    return s

class Book(SimpleDocTemplate):
    def afterFlowable(self,flow):
        level=getattr(flow,"toc_level",None)
        if level is None:return
        key=getattr(flow,"anchor_key",None)
        if not key:return
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(flow.getPlainText()[:120],key,level=level,closed=level==0)
        self.notify("TOCEntry",(level,flow.getPlainText(),self.page,key))

def heading(txt,style,level,key):
    p=Paragraph(inline(txt),style)
    p.toc_level=level
    p.anchor_key=key
    return p

def parse_md(md,sty,mod):
    result=[];code=[];paragraph=[];table=[]
    ci=0;hi=0;inside=False
    def pflush():
        if paragraph:
            result.append(Paragraph(inline(" ".join(paragraph)),sty["body"]))
            paragraph.clear()
    def cflush():
        if code:
            rows=[]
            for raw in code:
                raw=raw.expandtabs(4)
                if not raw:raw=" "
                for i in range(0,len(raw),78):
                    rows.append([Paragraph(escape(raw[i:i+78]).replace(" ","&nbsp;"),sty["code"])])
            t=Table(rows,colWidths=[493],hAlign="LEFT")
            t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),colors.HexColor("#f0f4f8")),("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),2),("BOTTOMPADDING",(0,0),(-1,-1),2)]))
            result.append(t);result.append(Spacer(1,9));code.clear()
    def tflush():
        if not table:return
        cells=[[Paragraph(inline(col),sty["cell"]) for col in row] for row in table]
        width=493/max(1,len(cells[0]))
        t=Table(cells,colWidths=[width]*len(cells[0]),repeatRows=1,hAlign="LEFT")
        t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,0),(-1,0),colors.HexColor("#f0f4f8")),("LINEBELOW",(0,0),(-1,0),.8,ORANGE),("GRID",(0,0),(-1,-1),.3,LINE),("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6)]))
        result.append(t);result.append(Spacer(1,10));table.clear()
    for raw in md.splitlines():
        line=raw.strip()
        if line.startswith("```"):
            if not inside:pflush();tflush();inside=True
            else:cflush();inside=False
            continue
        if inside:code.append(raw.rstrip());continue
        if line.startswith("|"):
            pflush()
            parts=[x.strip() for x in line.strip("|").split("|")]
            if all(re.fullmatch(r'[:\- ]+',x or "-") for x in parts):continue
            table.append(parts);continue
        tflush()
        if not line:pflush();continue
        if line.startswith("#"):
            pflush();depth=len(line)-len(line.lstrip("#"));hi+=1
            # Main module is inserted separately; markdown headings become PDF hierarchy below it.
            level=1 if depth<=2 else 2
            result.append(heading(line[depth:].strip(),sty["section"] if level==1 else sty["sub"],level,f"{mod}-h{hi}"))
        elif line.startswith(">"):
            pflush()
            box=Table([[Paragraph(inline(line.lstrip("> ")),sty["note"])]],colWidths=[493])
            box.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),PALE),("LINEBEFORE",(0,0),(0,-1),3,ORANGE),("LEFTPADDING",(0,0),(-1,-1),12),("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9)]))
            result.append(box);result.append(Spacer(1,7))
        elif line.startswith("- ") or re.match(r'^\d+\. ',line):
            pflush();result.append(Paragraph("• "+inline(re.sub(r'^(?:- |\d+\. )','',line)),sty["body"]))
        else:paragraph.append(line)
    pflush();tflush();cflush()
    return result

def cover(canvas,doc,meta):
    w,h=A4;canvas.saveState()
    canvas.setFillColor(NAVY);canvas.rect(0,0,w,h,fill=1,stroke=0)
    canvas.setFillColor(ORANGE);canvas.rect(0,h-22,w,22,fill=1,stroke=0)
    canvas.setFillColor(CYAN);canvas.circle(w+80,h-180,200,fill=1,stroke=0)
    canvas.setFillColor(colors.HexColor("#25334a"));canvas.circle(w-40,h-205,147,fill=1,stroke=0)
    canvas.setFillColor(ORANGE);canvas.circle(w-56,h-202,61,fill=1,stroke=0)
    canvas.setFillColor(colors.white);canvas.setFont(FONT,15);canvas.drawString(48,h-107,"MANGOBOX  /  OFFICIAL DOCUMENTATION")
    canvas.setFont(FONT,34);canvas.drawString(48,h-276,"MangoBox")
    canvas.setFont(FONT,23);canvas.drawString(48,h-325,meta["title"])
    canvas.setStrokeColor(ORANGE);canvas.setLineWidth(5);canvas.line(48,h-350,240,h-350)
    canvas.setFont(FONT,12)
    canvas.drawString(48,h-404,"裝置  "+meta["target"])
    canvas.drawString(48,h-432,"模式  "+meta["mode"])
    canvas.drawString(48,h-460,"Runtime  "+meta["runtime"])
    canvas.setFillColor(colors.HexColor("#ccd5e0"));canvas.setFont(FONT,10)
    canvas.drawString(48,75,"國立臺北商業大學  ·  MangoBox AI 精準教學平台")
    canvas.drawString(48,51,date.today().isoformat()+"  |  版本對應官方 API 文件")
    canvas.restoreState()

def standard(canvas,doc,meta):
    if doc.page==1:cover(canvas,doc,meta);return
    w,h=A4;canvas.saveState()
    canvas.setFillColor(ORANGE);canvas.rect(0,h-9,w,9,fill=1,stroke=0)
    canvas.setFont(FONT,9);canvas.setFillColor(NAVY)
    canvas.drawString(48,h-35,"MANGOBOX  /  "+meta["title"])
    canvas.setStrokeColor(LINE);canvas.line(48,h-44,w-48,h-44)
    canvas.line(48,42,w-48,42)
    canvas.setFont(FONT,8);canvas.setFillColor(MUTED)
    canvas.drawString(48,28,meta["target"]+"  ·  Runtime "+meta["runtime"])
    canvas.drawRightString(w-48,28,f"{doc.page:02d}")
    canvas.restoreState()

def build(out_dir,profile_id,language,kind):
    pdata=json.loads((DATA/"profiles.json").read_text(encoding="utf-8"))
    modules=json.loads((DATA/"modules.json").read_text(encoding="utf-8"))["modules"]
    profile=next((p for p in pdata["profiles"] if p["id"]==profile_id),None)
    if not profile:raise SystemExit("Unknown profile "+profile_id)
    current=[m for m in modules if m["capability"] in profile["capabilities"]]
    prefix="host-python/" if profile["mode"]=="host_python" else ""
    folder="reference" if kind=="reference" else "guides"
    root=BASE/language/prefix/folder
    missing=[m["id"] for m in current if not (root/(m["id"]+".md")).is_file()]
    if missing:raise SystemExit("Missing canonical docs: "+", ".join(missing))
    font_setup();out_dir.mkdir(parents=True,exist_ok=True)
    output=out_dir/f"MangoBox_{kind}_{language}_{profile_id}.pdf"
    s={
      "body":ParagraphStyle("Body",fontName=FONT,fontSize=9.5,leading=17,textColor=NAVY,spaceAfter=8),
      "code":ParagraphStyle("Code",fontName=FONT,fontSize=7.5,leading=12,textColor=NAVY),
      "cell":ParagraphStyle("Cell",fontName=FONT,fontSize=8,leading=13,textColor=NAVY),
      "note":ParagraphStyle("Note",fontName=FONT,fontSize=9,leading=15,textColor=NAVY),
      "chapter":ParagraphStyle("Chapter",fontName=FONT,fontSize=21,leading=30,textColor=NAVY,spaceAfter=15),
      "section":ParagraphStyle("Section",fontName=FONT,fontSize=13,leading=20,textColor=colors.HexColor("#d85d00"),spaceBefore=16,spaceAfter=8),
      "sub":ParagraphStyle("Subsection",fontName=FONT,fontSize=10.5,leading=17,textColor=NAVY,spaceBefore=10,spaceAfter=5),
      "toc":ParagraphStyle("TOC",fontName=FONT,fontSize=10.2,leading=19,textColor=NAVY,leftIndent=12),
      "toc2":ParagraphStyle("TOC2",fontName=FONT,fontSize=8.7,leading=16,textColor=MUTED,leftIndent=35),
    }
    meta=dict(title=("API Reference 手冊" if kind=="reference" else "學生程式設計指南") if language=="zh-TW" else ("API Reference Manual" if kind=="reference" else "Student Programming Guide"),target=profile["target"],mode=profile["mode"],runtime=str(profile["runtime"]))
    doc=Book(str(output),pagesize=A4,leftMargin=48,rightMargin=48,topMargin=63,bottomMargin=58,title="MangoBox "+meta["title"],author="MangoBox Platform")
    story=[Spacer(1,645),PageBreak(),Paragraph("快速導覽  /  CONTENTS",s["chapter"]),Paragraph("點擊章節或方法名稱即可跳轉；PDF 閱讀器側邊書籤亦可展開章節。",s["note"]),Spacer(1,14)]
    toc=TableOfContents()
    toc.levelStyles=[s["toc"],s["toc2"],s["toc2"]]
    toc.dotsMinLevel=0
    story.extend([toc,PageBreak()])
    story.extend([Paragraph("使用說明  /  HOW TO USE",s["chapter"]),Paragraph("本手冊來自 MangoBox 官方 API Markdown，依指定 Runtime 與執行模式篩選。不同版本或 Host 套件可能存在能力差異；請使用官方文件查詢最新支援資訊。",s["body"]),Paragraph(f'<link href="{SITE}" color="#087ea4">開啟 MangoBox 線上 API 文件 ↗</link>',s["body"]),Paragraph(f'<link href="{SITE}ai-context-builder.html" color="#087ea4">建立 AI 專用 API Context ↗</link>',s["body"]),PageBreak()])
    for i,m in enumerate(current,1):
        label=m["labels"].get(language,m["id"])
        story.append(heading(f"{i:02d}  {label}",s["chapter"],0,"module-"+m["id"]))
        story.append(Paragraph(f'<link href="{SITE}?lang={language}&module={m["id"]}&mode={profile["mode"]}&view={("reference" if kind=="reference" else "guide")}" color="#087ea4">查看此模組官網說明 ↗</link>',s["note"]))
        story.append(Spacer(1,8))
        story.extend(parse_md((root/(m["id"]+".md")).read_text(encoding="utf-8"),s,m["id"]))
        if i!=len(current):story.append(PageBreak())
    doc.multiBuild(story,onFirstPage=lambda c,d:cover(c,d,meta),onLaterPages=lambda c,d:standard(c,d,meta))
    print("GENERATED",output,"modules",len(current))
    return output

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--output",default="dist/api-manuals")
    p.add_argument("--language",default="zh-TW",choices=["zh-TW","en"])
    p.add_argument("--profile")
    p.add_argument("--kind",default="both",choices=["reference","guides","both"])
    a=p.parse_args()
    d=json.loads((DATA/"profiles.json").read_text(encoding="utf-8"))
    profile=a.profile or d["recommended"]["mangolite-pico2w"]["high_level_micropython"]
    for kind in (["reference","guides"] if a.kind=="both" else [a.kind]):build(Path(a.output),profile,a.language,kind)
if __name__=="__main__":main()
