import base64
from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Optional
from ...schemas.response import ApiResponse
from ...core.auth import verify_firebase_token
from ...core.logging import get_logger

from ...api.dependencies import get_orchestrator
from ...services.orchestrator import SignalProcessingOrchestrator

logger = get_logger(__name__)
router = APIRouter(prefix="/signals", tags=["Signals"])

class CreateSignalRequest(BaseModel):
    text: str
    lat: float
    lng: float
    image_base64: Optional[str] = None
    audio_base64: Optional[str] = None

async def run_pipeline_task(orchestrator: SignalProcessingOrchestrator, req: CreateSignalRequest):
    """Background task to run the AI pipeline."""
    try:
        logger.info("Starting background AI pipeline task")
        image_bytes = base64.b64decode(req.image_base64) if req.image_base64 else None
        audio_bytes = base64.b64decode(req.audio_base64) if req.audio_base64 else None
        
        # This hits Gemini, clustering, scoring, and saves to DB
        await orchestrator.process_signal(req.text, req.lat, req.lng, image_data=image_bytes, audio_data=audio_bytes)
        
    except Exception as e:
        logger.error("Background AI pipeline failed", extra={"error": str(e)})

@router.post("", response_model=ApiResponse)
async def create_signal(
    req: CreateSignalRequest,
    background_tasks: BackgroundTasks,
    # user = Depends(verify_firebase_token), # Optional citizen auth
    orchestrator = Depends(get_orchestrator)
):
    """
    Ingests a new citizen signal and triggers the AI pipeline in the background.
    """
    logger.info("Received new signal", extra={"lat": req.lat, "lng": req.lng})
    
    background_tasks.add_task(run_pipeline_task, orchestrator, req)
    
    return ApiResponse(
        success=True,
        message="Signal received and pipeline initiated.",
        data={"status": "PROCESSING"}
    )
