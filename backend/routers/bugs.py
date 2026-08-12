import logging

from fastapi import APIRouter, Depends

from backend.ai.bug_detector import detect_bugs
from backend.core.exceptions import AIServiceError
from backend.core.rtl import require_rtl
from backend.models.schemas import RtlRequest
from backend.routers.auth import get_current_user_email

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/bugs")
def bugs(request: RtlRequest, email: str = Depends(get_current_user_email)):
    try:
        rtl = require_rtl(request.rtl)
        result = detect_bugs(rtl)
        return result
    except AIServiceError:
        raise
    except Exception as exc:
        logger.exception("Bug detection route failed")
        raise AIServiceError("Bug detection failed. Please try again.") from exc
