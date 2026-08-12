from typing import Any

from fastapi.responses import JSONResponse


def error_response(detail: str, status_code: int = 400) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"detail": detail, "success": False},
    )


def ok(data: dict[str, Any] | None = None, **extra: Any) -> dict[str, Any]:
    """Merge optional extras into a flat payload (keeps existing API shapes)."""
    payload = dict(data or {})
    payload.update(extra)
    return payload
