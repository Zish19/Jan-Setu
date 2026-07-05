from fastapi import APIRouter, Depends
from ...schemas.response import ApiResponse
from ...core.auth import require_role
from ...services.optimizer import BudgetOptimizerService
from ...core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["Optimization"])

def get_optimizer():
    # Placeholder for DI
    return BudgetOptimizerService()

@router.post("", response_model=ApiResponse)
async def run_optimization(
    # user = Depends(require_role("mp")), # Only MP/admin can run optimizer
    optimizer: BudgetOptimizerService = Depends(get_optimizer)
):
    """
    Runs the CP-SAT budget optimizer over open projects/clusters.
    """
    logger.info("Optimization endpoint hit")
    
    # In reality, fetch projects from ProjectRepository where status == 'PROPOSED'
    mock_projects = []
    results = optimizer.optimize(mock_projects)
    
    return ApiResponse(
        success=True,
        message="Optimization complete",
        data=results
    )
