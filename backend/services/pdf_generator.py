import os
import re
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def make_table(data, col_widths=None):
    """Creates a beautifully styled, professional-looking table for the report."""
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")), # Dark slate header
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.HexColor("#f1f5f9")]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    return t

def format_markdown_lines(text):
    """Converts markdown paragraphs to ReportLab Paragraphs with HTML tagging."""
    if not isinstance(text, str):
        return [Paragraph(str(text), getSampleStyleSheet()["Normal"])]

    styles = getSampleStyleSheet()
    normal_style = styles["Normal"]
    heading3_style = styles["Heading3"]

    paragraphs = []
    lines = text.split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Headers
        if line.startswith("###") or line.startswith("##") or line.startswith("#"):
            p_text = line.replace("#", "").strip()
            paragraphs.append(Paragraph(f"<b>{p_text}</b>", heading3_style))
        # Bullet list
        elif line.startswith("*") or line.startswith("-"):
            p_text = line[1:].strip()
            # Convert **bold** to <b>bold</b>
            p_text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", p_text)
            paragraphs.append(Paragraph(f"&bull; {p_text}", normal_style))
        else:
            p_text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", line)
            paragraphs.append(Paragraph(p_text, normal_style))

    return paragraphs

def generate_pdf(
    filename,
    parsed,
    analysis,
    metrics,
    ai_review,
    rtl_score,
    bugs,
    block_diagram_rl=None,
    schematic_diagram_rl=None
):
    pdf_name = "RTL_Report.pdf"
    doc = SimpleDocTemplate(
        pdf_name,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.HexColor("#0f172a"),
        alignment=0, # Left-aligned
        spaceAfter=15
    )
    h2_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=15,
        spaceAfter=8,
        keepWithNext=True
    )
    h3_style = ParagraphStyle(
        'SubsectionHeading',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor("#334155"),
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    normal_style = styles["Normal"]

    story = []

    # 1. Document Title & Header Card
    story.append(Paragraph("<b>VLSI Copilot RTL Analysis Report</b>", title_style))

    meta_data = [
        ["Specification Port", "Value Detail"],
        ["Target RTL Source File", filename],
        ["Top-Level Module Name", parsed.get("module_name") or "N/A"],
        ["Design Classification", metrics.get("design_type") or "Combinational"],
        ["Design Logic Complexity", metrics.get("module_complexity") or "Low"]
    ]
    story.append(make_table(meta_data, col_widths=[180, 320]))
    story.append(Spacer(1, 15))

    # 2. Section 1: Module Interface & Block Diagram
    story.append(Paragraph("1. Module Architecture & Interface Specifications", h2_style))
    summary_text = analysis.get("rtl_summary") or "Design interface features module ports and logic blocks."
    story.append(Paragraph(summary_text, normal_style))
    story.append(Spacer(1, 8))

    if block_diagram_rl:
        story.append(Paragraph("<b>Figure 1: Module Architecture Block Diagram</b>", h3_style))
        story.append(block_diagram_rl)
        story.append(Spacer(1, 15))

    # 3. Section 2: Gate-Level Schematic Diagram
    if schematic_diagram_rl:
        story.append(Paragraph("2. Gate-Level Logic Schematic Diagram", h2_style))
        story.append(Paragraph("The schematic below illustrates the derived logic gate network mapped topologically from left to right:", normal_style))
        story.append(Spacer(1, 8))
        story.append(schematic_diagram_rl)
        story.append(Spacer(1, 15))

    # 4. Section 3: Design Metrics & Structural Checks
    story.append(Paragraph("3. Design Metrics & Structural Checks", h2_style))
    metrics_data = [
        ["Logic Metric Category", "Quantity Count"],
        ["Input Ports Count", str(metrics.get("inputs", 0))],
        ["Output Ports Count", str(metrics.get("outputs", 0))],
        ["Continuous Assign Statements", str(metrics.get("assignments", 0))]
    ]
    story.append(make_table(metrics_data, col_widths=[250, 250]))
    story.append(Spacer(1, 15))

    # 5. Section 4: RTL Score & Optimization Suggestions
    story.append(Paragraph("4. RTL Quality & Synthesizability Score", h2_style))

    score_val = rtl_score.get("rtl_score", 0) if isinstance(rtl_score, dict) else 0
    coding_qual = rtl_score.get("coding_quality", "N/A") if isinstance(rtl_score, dict) else "N/A"
    synth_val = "Yes" if (isinstance(rtl_score, dict) and rtl_score.get("synthesizable", True)) else "No"
    latch_val = "Yes (Risk Identified)" if (isinstance(rtl_score, dict) and rtl_score.get("latch_risk", False)) else "No (Safe)"

    score_data = [
        ["Quality Evaluation Metric", "Score Detail"],
        ["Overall Quality Score", f"{score_val} / 100"],
        ["Synthesizable", synth_val],
        ["Latch Inference Risk", latch_val],
        ["Coding Style Quality", coding_qual]
    ]
    story.append(make_table(score_data, col_widths=[220, 280]))
    story.append(Spacer(1, 10))

    if isinstance(rtl_score, dict):
        score_summ = rtl_score.get("summary") or "Evaluation complete."
        score_opt = rtl_score.get("optimization") or "No optimization needed."
        story.append(Paragraph(f"<b>Evaluation Summary:</b> {score_summ}", normal_style))
        story.append(Spacer(1, 5))
        story.append(Paragraph(f"<b>Recommended Optimizations:</b> {score_opt}", normal_style))
    story.append(Spacer(1, 15))

    # 6. Section 5: Bug Detection Analysis
    story.append(Paragraph("5. Bug Detection & Verification Analysis", h2_style))

    severity = bugs.get("severity", "None") if isinstance(bugs, dict) else "None"
    if severity == "None" or severity == "Unknown":
        story.append(Paragraph("<b>No critical RTL bugs or synthesis issues were detected in this Verilog design.</b>", normal_style))
    else:
        bug_data = [
            ["RTL Verification Field", "Diagnostic Details"],
            ["Diagnostic Severity", str(bugs.get("severity", "N/A"))],
            ["Identified Issue Type", str(bugs.get("bug_type", "N/A"))],
            ["Approximate Line Number", str(bugs.get("line", "N/A"))],
            ["Technical Reason", str(bugs.get("reason", "N/A"))],
            ["Actionable Recommendation", str(bugs.get("recommendation", "N/A"))]
        ]
        story.append(make_table(bug_data, col_widths=[160, 340]))
    story.append(Spacer(1, 15))

    # 7. Section 6: AI-Assisted Expert Engineering Review
    story.append(Paragraph("6. AI-Assisted Expert Engineering Review", h2_style))

    if isinstance(ai_review, str):
        paragraphs = format_markdown_lines(ai_review)
        for p in paragraphs:
            story.append(p)
            story.append(Spacer(1, 4))
    elif isinstance(ai_review, dict):
        summary = ai_review.get("summary") or "No summary."
        story.append(Paragraph(f"<b>Summary:</b> {summary}", normal_style))
        story.append(Spacer(1, 5))

        strengths = ai_review.get("strengths") or []
        if strengths:
            story.append(Paragraph("<b>Design Strengths:</b>", h3_style))
            for st in strengths:
                story.append(Paragraph(f"&bull; {st}", normal_style))
            story.append(Spacer(1, 5))

        issues = ai_review.get("issues") or []
        if issues:
            story.append(Paragraph("<b>Potential Design Issues:</b>", h3_style))
            for iss in issues:
                story.append(Paragraph(f"&bull; {iss}", normal_style))
            story.append(Spacer(1, 5))

        recs = ai_review.get("recommendations") or []
        if recs:
            story.append(Paragraph("<b>Expert Recommendations:</b>", h3_style))
            for rc in recs:
                story.append(Paragraph(f"&bull; {rc}", normal_style))

    doc.build(story)
    return pdf_name
