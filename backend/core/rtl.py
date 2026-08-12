from backend.core.exceptions import ValidationError


def require_rtl(rtl: str) -> str:
    text = (rtl or "").strip()
    if not text:
        raise ValidationError("RTL code is required.")
    return text
