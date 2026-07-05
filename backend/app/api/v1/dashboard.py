from fastapi import APIRouter, HTTPException
from ...repositories.domain import ClusterRepository, SignalRepository

router = APIRouter()
cluster_repo = ClusterRepository()
signal_repo = SignalRepository()

@router.get("/metrics")
def get_dashboard_metrics():
    """
    Returns live KPIs by hitting Firestore collections.
    """
    try:
        # For MVP, we fetch counts efficiently or use a small limit
        active_signals = len(signal_repo.list(limit=1000))
        open_clusters = len(cluster_repo.list(status="OPEN", limit=500))
        
        return {
            "data": {
                "active_reports": active_signals,
                "open_clusters": open_clusters,
                "budget_utilized_cr": 2.4, # Mocked value pending true CP-SAT writeback
                "trust_score": 92
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
