import base64
from fastapi import APIRouter, BackgroundTasks, Depends
from pydantic import BaseModel
from typing import Optional
from ...schemas.response import ApiResponse
from ...core.auth import verify_firebase_token
from ...core.logging import get_logger

# (In a real app, Orchestrator would be injected via Depends. We'll mock the import for structure)
from ...services.orchestrator import SignalProcessingOrchestrator
# Assuming orchestrator is instantiated in a dependency module:
# from ...api.dependencies import get_orchestrator

logger = get_logger(__name__)
router = APIRouter(prefix="/signals", tags=["Signals"])

class CreateSignalRequest(BaseModel):
    text: str
    lat: float
    lng: float
    image_base64: Optional[str] = None

# We use a mock dependency here to satisfy the endpoint definition.
# Actual wiring happens in main.py / dependencies module.
def get_orchestrator():
    # Placeholder for DI
    return None

async def run_pipeline_task(orchestrator: SignalProcessingOrchestrator, req: CreateSignalRequest):
    """Background task to run the AI pipeline."""
    try:
        logger.info("Starting background AI pipeline task")
        image_bytes = base64.b64decode(req.image_base64) if req.image_base64 else None
        
        # This will hit Gemini, clustering, scoring, and save to DB
        # await orchestrator.process_signal(req.text, req.lat, req.lng, image_bytes)
        
        # Mocking the call since DI isn't fully wired in this snippet
        pass
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
