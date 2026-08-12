import logging

from fastapi import APIRouter

from backend.analyzers.design_checker import check_design
from backend.analyzers.metrics import calculate_metrics
from backend.analyzers.rtl_analyzer import analyze_rtl
from backend.analyzers.syntax_checker import check_syntax
from backend.core.exceptions import AIServiceError
from backend.core.rtl import require_rtl
from backend.models.schemas import RtlRequest
from backend.parsers.verilog_parser import parse_verilog
from backend.services.report_generator import generate_report

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/analysis")
def analysis(request: RtlRequest):
    try:
        rtl = require_rtl(request.rtl)
        parsed = parse_verilog(rtl)
        syntax_errors = check_syntax(rtl)
        analysis_data = analyze_rtl(parsed)
        warnings = check_design(parsed)
        metrics = calculate_metrics(parsed)
        report = generate_report(parsed, analysis_data, warnings, metrics)

        logger.info("Analysis complete module=%s", parsed.get("module_name"))

        return {
            "parsed_data": parsed,
            "syntax_errors": syntax_errors,
            "analysis": analysis_data,
            "warnings": warnings,
            "report": report,
        }
    except Exception as exc:
        logger.exception("Analysis route failed")
        raise AIServiceError("Analysis failed. Please try again.") from exc
