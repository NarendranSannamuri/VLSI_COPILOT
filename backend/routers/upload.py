
from fastapi.responses import FileResponse
import os
from backend.services.pdf_generator import generate_pdf
from backend.ai.bug_detector import detect_bugs
from backend.ai.scorer import score_verilog
from backend.ai.reviewer import review_verilog
from fastapi import APIRouter, UploadFile, File
from backend.parsers.verilog_parser import parse_verilog
from backend.analyzers.rtl_analyzer import analyze_rtl
from backend.analyzers.design_checker import check_design
from backend.analyzers.metrics import calculate_metrics
from backend.services.report_generator import generate_report
from backend.services.testbench_generator import generate_testbench
from backend.analyzers.syntax_checker import check_syntax

router = APIRouter()


@router.post("/upload")
async def upload_verilog(file: UploadFile = File(...)):

    content = await file.read()

    verilog_text = content.decode("utf-8")
    syntax_errors = check_syntax(verilog_text)

    parsed = parse_verilog(verilog_text)

    analysis = analyze_rtl(parsed)

    warnings = check_design(parsed)
    metrics = calculate_metrics(parsed)
    report = generate_report(
        parsed,
        analysis,
        warnings,
        metrics
    )
    ai_review = review_verilog(verilog_text)
    rtl_score = score_verilog(verilog_text)
    testbench = generate_testbench(parsed)
    bugs = detect_bugs(verilog_text)
    pdf_report = generate_pdf(
        file.filename,
        parsed,
        analysis,
        metrics,
        ai_review,
        rtl_score,
        bugs
    )

    return {
    "filename": file.filename,
    "syntax_errors": syntax_errors,
    "parsed_data": parsed,
    "analysis": analysis,
    "warnings": warnings,
    "metrics": metrics,
    "ai_review": ai_review,
    "rtl_score": rtl_score,
    "bugs": bugs,
    "testbench": testbench,
    "pdf_report": pdf_report,
    "report": report

    }


@router.get("/download-report")
def download_report():

    pdf_path = "RTL_Report.pdf"

    if os.path.exists(pdf_path):

        return FileResponse(
            path=pdf_path,
            filename="RTL_Report.pdf",
            media_type="application/pdf"
        )

    return {
        "error": "Report not found."
    }


