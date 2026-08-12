import logging

from fastapi import APIRouter, Depends

from backend.ai.comparator import compare_rtl
from backend.ai.optimizer import optimize_verilog
from backend.core.exceptions import AIServiceError
from backend.core.rtl import require_rtl
from backend.models.schemas import RtlRequest
from backend.routers.auth import get_current_user_email

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/optimize")
def optimize(request: RtlRequest, email: str = Depends(get_current_user_email)):
    try:
        rtl = require_rtl(request.rtl)
        result = optimize_verilog(rtl)
        optimized_code = result.get("optimized_code", rtl)
        summary = result.get("summary", "")
        improvements = compare_rtl(rtl, optimized_code)

        return {
            "optimized_code": optimized_code,
            "summary": summary,
            "improvements": improvements.get("improvements", []) if isinstance(improvements, dict) else [],
        }
    except AIServiceError:
        raise
    except Exception as exc:
        logger.exception("Optimize route failed")
        raise AIServiceError("Optimization failed. Please try again.") from exc
