import logging
import re

from fastapi import APIRouter

from backend.analyzers.metrics import calculate_metrics
from backend.core.exceptions import AIServiceError
from backend.core.rtl import require_rtl
from backend.models.schemas import RtlRequest
from backend.parsers.verilog_parser import parse_verilog

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/metrics")
def metrics(request: RtlRequest):
    try:
        rtl = require_rtl(request.rtl)
        parsed = parse_verilog(rtl)
        base = calculate_metrics(parsed)

        regs = len(re.findall(r"\breg\b", rtl, re.IGNORECASE))
        wires = len(re.findall(r"\bwire\b", rtl, re.IGNORECASE))
        always = len(re.findall(r"\balways\b", rtl, re.IGNORECASE))
        assigns = len(parsed.get("assignments", []))

        logic_depth = max(1, min(12, assigns + always))
        estimated_area = (base["inputs"] + base["outputs"]) * 2 + assigns * 3 + regs * 8
        estimated_delay_ns = round(0.05 * logic_depth + 0.02 * assigns, 2)

        result = {
            **base,
            "registers": regs,
            "wires": wires,
            "always_blocks": always,
            "logic_depth": logic_depth,
            "estimated_area": estimated_area,
            "estimated_delay_ns": estimated_delay_ns,
            "complexity_score": base["inputs"] + base["outputs"] + assigns + regs,
        }

        logger.info("Metrics computed module=%s", parsed.get("module_name"))
        return {"metrics": result, "parsed_data": parsed}
    except Exception as exc:
        logger.exception("Metrics route failed")
        raise AIServiceError("Metrics generation failed. Please try again.") from exc
