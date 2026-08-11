import logging

from fastapi import APIRouter

from backend.core.exceptions import AIServiceError
from backend.core.rtl import require_rtl
from backend.graph.rtl_graph import build_diagram_payload
from backend.models.schemas import RtlRequest
from backend.parsers.verilog_parser import parse_verilog

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/diagram")
def diagram(request: RtlRequest):
    try:
        rtl = require_rtl(request.rtl)
        parsed = parse_verilog(rtl)
        payload = build_diagram_payload(parsed)
        logger.info("Diagram built nodes=%s", len(payload.get("rtl_graph", {}).get("nodes", [])))
        return payload
    except Exception as exc:
        logger.exception("Diagram route failed")
        raise AIServiceError("Diagram generation failed. Please try again.") from exc
