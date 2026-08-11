import logging

from fastapi import APIRouter

from backend.core.exceptions import AIServiceError
from backend.core.rtl import require_rtl
from backend.models.schemas import RtlRequest
from backend.parsers.verilog_parser import parse_verilog
from backend.services.testbench_generator import generate_testbench

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/testbench")
def testbench(request: RtlRequest):
    try:
        rtl = require_rtl(request.rtl)
        parsed = parse_verilog(rtl)
        tb = generate_testbench(parsed)
        logger.info("Testbench generated for %s", parsed.get("module_name"))
        return {"testbench": tb, "parsed_data": parsed}
    except Exception as exc:
        logger.exception("Testbench route failed")
        raise AIServiceError("Testbench generation failed. Please try again.") from exc
