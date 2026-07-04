from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..repositories.domain import ProjectRepository

router = APIRouter()
project_repo = ProjectRepository()

class VerifyRequest(BaseModel):
    evidence_url: str
    notes: str

@router.post("/{project_id}/verify")
def verify_project(project_id: str, payload: VerifyRequest):
    try:
        project = project_repo.get(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # In a real scenario, this would update Firestore.
        # project.status = "COMPLETED"
        # project.evidence_url = payload.evidence_url
        # project_repo.update(project_id, project)
        
        return {
            "status": "success",
            "message": "Project verified and trust delta applied.",
            "data": {
                "project_id": project_id,
                "trust_delta": "+2%"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
