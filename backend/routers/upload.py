from fastapi import APIRouter, UploadFile, File
from backend.parsers.verilog_parser import parse_verilog
from backend.analyzers.rtl_analyzer import analyze_rtl
from backend.analyzers.design_checker import check_design
from backend.analyzers.metrics import calculate_metrics
from backend.services.report_generator import generate_report
from backend.services.testbench_generator import generate_testbench

router = APIRouter()


@router.post("/upload")
async def upload_verilog(file: UploadFile = File(...)):

    content = await file.read()

    verilog_text = content.decode("utf-8")

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
    testbench = generate_testbench(parsed)

    return {

        "filename": file.filename,

        "report": report,

        "testbench": testbench

    }


