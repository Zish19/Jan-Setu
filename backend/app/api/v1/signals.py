import base64
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from ...schemas.response import ApiResponse
from ...core.auth import verify_firebase_token
from ...core.logging import get_logger

from ...api.dependencies import get_orchestrator
from ...services.orchestrator import SignalProcessingOrchestrator

logger = get_logger(__name__)
router = APIRouter(tags=["Signals"])

class CreateSignalRequest(BaseModel):
    text: str
    lat: float
    lng: float
    image_base64: Optional[str] = None
    audio_base64: Optional[str] = None

@router.post("", response_model=ApiResponse)
async def create_signal(
    req: CreateSignalRequest,
    # user = Depends(verify_firebase_token), # Optional citizen auth
    orchestrator = Depends(get_orchestrator)
):
    """
    Ingests a new citizen signal and triggers the AI pipeline synchronously to return immediate feedback.
    """
    logger.info("Received new signal", extra={"lat": req.lat, "lng": req.lng})
    
    try:
        image_bytes = base64.b64decode(req.image_base64) if req.image_base64 else None
        audio_bytes = base64.b64decode(req.audio_base64) if req.audio_base64 else None
        
        # This hits Gemini, clustering, scoring, and saves to DB synchronously
        result = await orchestrator.process_signal(req.text, req.lat, req.lng, image_data=image_bytes, audio_data=audio_bytes)
        
        return ApiResponse(
            success=True,
            message="Signal processed successfully.",
            data=result
        )
    except Exception as e:
        logger.error("AI pipeline failed", extra={"error": str(e)})
        # In a real app we would return a 500 status code but here we want to gracefully return the error object
        return ApiResponse(
            success=False,
            message="AI pipeline failed.",
            data={"error": str(e)}
        )
