from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet


def generate_pdf(
    filename,
    parsed,
    analysis,
    metrics,
    ai_review,
    rtl_score,
    bugs
):

    pdf_name = "RTL_Report.pdf"

    doc = SimpleDocTemplate(pdf_name)

    styles = getSampleStyleSheet()

    story = []

    story.append(Paragraph("<b>VLSI Copilot RTL Analysis Report</b>", styles["Title"]))

    story.append(Paragraph(f"<b>File:</b> {filename}", styles["Normal"]))
    story.append(Paragraph(f"<b>Module:</b> {parsed['module_name']}", styles["Normal"]))

    story.append(Paragraph("<br/>", styles["Normal"]))

    story.append(Paragraph("<b>RTL Analysis</b>", styles["Heading2"]))
    story.append(Paragraph(str(analysis), styles["Normal"]))

    story.append(Paragraph("<br/>", styles["Normal"]))

    story.append(Paragraph("<b>Metrics</b>", styles["Heading2"]))
    story.append(Paragraph(str(metrics), styles["Normal"]))

    story.append(Paragraph("<br/>", styles["Normal"]))

    story.append(Paragraph("<b>RTL Score</b>", styles["Heading2"]))
    story.append(Paragraph(str(rtl_score), styles["Normal"]))

    story.append(Paragraph("<br/>", styles["Normal"]))

    story.append(Paragraph("<b>AI Review</b>", styles["Heading2"]))
    story.append(Paragraph(ai_review.replace("\n", "<br/>"), styles["Normal"]))

    story.append(Paragraph("<br/>", styles["Normal"]))

    story.append(Paragraph("<b>Bug Detection</b>", styles["Heading2"]))
    story.append(Paragraph(str(bugs), styles["Normal"]))

    doc.build(story)

    return pdf_name