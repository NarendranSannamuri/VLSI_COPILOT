import logging

from fastapi import APIRouter, File, UploadFile

from backend.analyzers.syntax_checker import check_syntax
from backend.core.exceptions import ValidationError
from backend.parsers.verilog_parser import parse_verilog

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/upload")
async def upload_verilog(file: UploadFile = File(...)):
    """Accept RTL once. No AI. Returns text + lightweight parse only."""
    content = await file.read()

    try:
        verilog_text = content.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise ValidationError("File must be UTF-8 text.") from exc

    if not file.filename or not file.filename.lower().endswith((".v", ".sv")):
        raise ValidationError("Only .v or .sv Verilog files are supported.")

    if not verilog_text.strip():
        raise ValidationError("The uploaded file is empty.")

    syntax_errors = check_syntax(verilog_text)
    parsed = parse_verilog(verilog_text)

    logger.info("Upload accepted file=%s", file.filename)

    return {
        "filename": file.filename,
        "verilog_text": verilog_text,
        "syntax_errors": syntax_errors,
        "parsed_data": parsed,
    }
