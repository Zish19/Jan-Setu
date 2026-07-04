from fastapi import Request
from fastapi.responses import JSONResponse
from .logging import get_logger

logger = get_logger(__name__)

async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled Exception", extra={"path": request.url.path, "error": str(exc)})
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred. Please try again later.", "code": "INTERNAL_SERVER_ERROR"},
    )
