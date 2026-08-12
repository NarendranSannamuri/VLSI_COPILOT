import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from backend.ai.chat import chat_with_rtl
from backend.core.exceptions import AIServiceError, ValidationError
from backend.core.rtl import require_rtl
from backend.routers.auth import get_current_user_email

router = APIRouter()
logger = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    rtl: str = Field(min_length=1)
    question: str = Field(min_length=1)
    history: list[dict] = Field(default_factory=list)


@router.post("/chat")
def chat(request: ChatRequest, email: str = Depends(get_current_user_email)):
    try:
        rtl = require_rtl(request.rtl)
        question = (request.question or "").strip()
        if not question:
            raise ValidationError("Question is required.")

        history_blob = ""
        if request.history:
            lines = []
            for item in request.history[-8:]:
                role = item.get("sender") or item.get("role") or "user"
                text = item.get("text") or item.get("content") or ""
                if text:
                    lines.append(f"{role}: {text}")
            history_blob = "\n".join(lines)

        if history_blob:
            enriched = (
                f"Conversation so far:\n{history_blob}\n\n"
                f"New question:\n{question}"
            )
            answer = chat_with_rtl(rtl, enriched)
        else:
            answer = chat_with_rtl(rtl, question)

        if isinstance(answer, str) and answer.startswith("AI Error:"):
            raise AIServiceError("Chat assistant is temporarily unavailable.")

        return {"answer": answer}
    except ValidationError:
        raise
    except AIServiceError:
        raise
    except Exception as exc:
        logger.exception("Chat route failed")
        raise AIServiceError("Chat assistant is temporarily unavailable.") from exc
