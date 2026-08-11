import logging

from fastapi import APIRouter

from backend.core.exceptions import AIServiceError
from backend.core.rtl import require_rtl
from backend.models.schemas import RtlRequest
from backend.parsers.verilog_parser import parse_verilog
from backend.graph.rtl_graph import build_diagram_payload

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/schematic")
def schematic(request: RtlRequest):
    try:
        rtl = require_rtl(request.rtl)
        parsed = parse_verilog(rtl)
        payload = build_diagram_payload(parsed)
        logger.info("Schematic data prepared nodes=%s", len(payload.get("rtl_graph", {}).get("nodes", [])))
        return {
            "schematic": payload.get("rtl_graph"),
            "parsed_data": parsed,
            "svg": payload.get("svg"),
            "mermaid": payload.get("mermaid"),
        }
    except Exception as exc:
        logger.exception("Schematic route failed")
        raise AIServiceError("Schematic generation failed. Please try again.") from exc
