from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..repositories.domain import ClusterRepository

router = APIRouter()
cluster_repo = ClusterRepository()

@router.get("/")
def list_clusters(limit: int = 50, status: Optional[str] = None):
    try:
        filters = {"status": status} if status else {}
        clusters = cluster_repo.list(limit=limit, **filters)
        return {"data": [c.dict() for c in clusters]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{cluster_id}")
def get_cluster(cluster_id: str):
    cluster = cluster_repo.get(cluster_id)
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")
    return {"data": cluster.dict()}
