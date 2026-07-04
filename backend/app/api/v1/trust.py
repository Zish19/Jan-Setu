from fastapi import APIRouter, HTTPException
from ..repositories.domain import ProjectRepository

router = APIRouter()
project_repo = ProjectRepository()

@router.get("/")
def get_public_trust_data():
    try:
        completed_projects = project_repo.list(status="COMPLETED", limit=100)
        
        # Calculate completion %
        total_projects = len(project_repo.list(limit=1000))
        completion_percent = round((len(completed_projects) / total_projects) * 100) if total_projects > 0 else 0
        
        return {
            "data": {
                "overall_trust_score": 92,
                "completion_percent": completion_percent,
                "recent_completed": [p.dict() for p in completed_projects[:5]]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
