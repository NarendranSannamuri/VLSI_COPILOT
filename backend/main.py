import logging
import os
import time
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.core.exceptions import AppError
from backend.core.logging_config import setup_logging
from backend.routers.analysis import router as analysis_router
from backend.routers.bugs import router as bugs_router
from backend.routers.chat import router as chat_router
from backend.routers.diagram import router as diagram_router
from backend.routers.metrics import router as metrics_router
from backend.routers.optimize import router as optimize_router
from backend.routers.report import router as report_router
from backend.routers.schematic import router as schematic_router
from backend.routers.testbench import router as testbench_router
from backend.routers.upload import router as upload_router

load_dotenv()
setup_logging(os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("vlsi_copilot")

app = FastAPI(
    title="VLSI Copilot",
    description="AI-Powered RTL Engineering Workspace",
    version="2.0.0",
)

cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = uuid.uuid4().hex[:8]
    start = time.perf_counter()
    try:
        response = await call_next(request)
    except Exception:
        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.exception(
            "request_failed id=%s %s %s %.1fms",
            request_id,
            request.method,
            request.url.path,
            elapsed_ms,
        )
        raise

    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "request id=%s %s %s status=%s %.1fms",
        request_id,
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(AppError)
async def app_error_handler(_request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "success": False},
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exc: StarletteHTTPException):
    detail = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": detail, "success": False},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Invalid request payload.",
            "errors": exc.errors(),
            "success": False,
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Please try again.",
            "success": False,
        },
    )


app.include_router(upload_router)
app.include_router(analysis_router)
app.include_router(metrics_router)
app.include_router(bugs_router)
app.include_router(diagram_router)
app.include_router(schematic_router)
app.include_router(testbench_router)
app.include_router(optimize_router)
app.include_router(chat_router)
app.include_router(report_router)


@app.get("/")
def home():
    return {
        "message": "Welcome to VLSI Copilot",
        "status": "Running Successfully",
        "version": "2.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "vlsi-copilot",
        "version": "2.0.0",
    }
