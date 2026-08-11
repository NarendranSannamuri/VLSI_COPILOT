from fastapi.responses import FileResponse
import os
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Header, Depends, status
from backend.services.pdf_generator import generate_pdf
from backend.ai.bug_detector import detect_bugs
from backend.ai.scorer import score_verilog
from backend.ai.reviewer import review_verilog
from backend.parsers.verilog_parser import parse_verilog
from backend.analyzers.rtl_analyzer import analyze_rtl
from backend.analyzers.design_checker import check_design
from backend.analyzers.metrics import calculate_metrics
from backend.services.report_generator import generate_report
from backend.services.testbench_generator import generate_testbench
from backend.analyzers.syntax_checker import check_syntax
from backend.services.rtl_graph import RTLGraph
from backend.database import decode_access_token
from backend.routers.auth import get_current_user_email

router = APIRouter()

class PremiumRequestSchema(BaseModel):
    verilog_code: str
    filename: str = "design.v"


@router.post("/upload")
async def upload_verilog(file: UploadFile = File(...), authorization: str = Header(None)):

    content = await file.read()

    verilog_text = content.decode("utf-8")
    syntax_errors = check_syntax(verilog_text)

    parsed = parse_verilog(verilog_text)

    analysis = analyze_rtl(parsed)

    warnings = check_design(parsed)

    # Check if authenticated
    user_email = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        payload = decode_access_token(token)
        if payload:
            user_email = payload.get("email")

    if user_email:
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

        # Instantiate RTL graph and generate diagrams
        rtl_graph = RTLGraph(parsed)
        block_diagram_svg = rtl_graph.generate_block_diagram(theme="dark").to_svg()
        schematic_diagram_svg = rtl_graph.generate_schematic_diagram(theme="dark").to_svg()

        block_diagram_rl = rtl_graph.generate_block_diagram(theme="light").to_reportlab()
        schematic_diagram_rl = [part.to_reportlab() for part in rtl_graph.generate_schematic_diagram_parts(theme="light")]

        pdf_report = generate_pdf(
            file.filename,
            parsed,
            analysis,
            metrics,
            ai_review,
            rtl_score,
            bugs,
            block_diagram_rl,
            schematic_diagram_rl
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
            "report": report,
            "block_diagram_svg": block_diagram_svg,
            "schematic_diagram_svg": schematic_diagram_svg
        }
    else:
        # Guest: return only basic report and parser data
        report = generate_report(
            parsed,
            analysis,
            warnings,
            {"inputs": 0, "outputs": 0, "assignments": 0, "module_complexity": "Locked", "design_type": "Locked"}
        )
        return {
            "filename": file.filename,
            "syntax_errors": syntax_errors,
            "parsed_data": parsed,
            "analysis": analysis,
            "warnings": warnings,
            "metrics": None,
            "ai_review": None,
            "rtl_score": None,
            "bugs": None,
            "testbench": None,
            "pdf_report": None,
            "report": report,
            "block_diagram_svg": None,
            "schematic_diagram_svg": None
        }


@router.get("/download-report")
def download_report(email: str = Depends(get_current_user_email)):

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


# Premium Features Endpoints (Fully Auth Protected)
@router.post("/premium/diagrams")
def get_premium_diagrams(req: PremiumRequestSchema, email: str = Depends(get_current_user_email)):
    parsed = parse_verilog(req.verilog_code)
    rtl_graph = RTLGraph(parsed)
    block_svg = rtl_graph.generate_block_diagram(theme="dark").to_svg()
    schematic_svg = rtl_graph.generate_schematic_diagram(theme="dark").to_svg()
    return {
        "block_diagram_svg": block_svg,
        "schematic_diagram_svg": schematic_svg
    }

@router.post("/premium/metrics")
def get_premium_metrics(req: PremiumRequestSchema, email: str = Depends(get_current_user_email)):
    parsed = parse_verilog(req.verilog_code)
    metrics = calculate_metrics(parsed)
    return {
        "metrics": metrics
    }

@router.post("/premium/bugs")
def get_premium_bugs(req: PremiumRequestSchema, email: str = Depends(get_current_user_email)):
    bugs = detect_bugs(req.verilog_code)
    return {
        "bugs": bugs
    }

@router.post("/premium/ai-review")
def get_premium_ai_review(req: PremiumRequestSchema, email: str = Depends(get_current_user_email)):
    ai_review = review_verilog(req.verilog_code)
    rtl_score = score_verilog(req.verilog_code)
    return {
        "ai_review": ai_review,
        "rtl_score": rtl_score
    }

@router.post("/premium/testbench")
def get_premium_testbench(req: PremiumRequestSchema, email: str = Depends(get_current_user_email)):
    parsed = parse_verilog(req.verilog_code)
    testbench = generate_testbench(parsed)
    return {
        "testbench": testbench
    }

@router.post("/premium/generate-report")
def generate_premium_report(req: PremiumRequestSchema, email: str = Depends(get_current_user_email)):
    parsed = parse_verilog(req.verilog_code)
    analysis = analyze_rtl(parsed)
    warnings = check_design(parsed)
    metrics = calculate_metrics(parsed)
    ai_review = review_verilog(req.verilog_code)
    rtl_score = score_verilog(req.verilog_code)
    bugs = detect_bugs(req.verilog_code)

    rtl_graph = RTLGraph(parsed)
    block_diagram_rl = rtl_graph.generate_block_diagram(theme="light").to_reportlab()
    schematic_diagram_rl = [part.to_reportlab() for part in rtl_graph.generate_schematic_diagram_parts(theme="light")]

    pdf_report = generate_pdf(
        req.filename,
        parsed,
        analysis,
        metrics,
        ai_review,
        rtl_score,
        bugs,
        block_diagram_rl,
        schematic_diagram_rl
    )
    return {
        "pdf_report": pdf_report
    }
