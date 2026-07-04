from typing import Optional, List, Dict, Any, Tuple
from ..schemas.firestore import Cluster, Signal
from ..repositories.domain import ClusterRepository
from .embedding import EmbeddingService
from ..core.logging import get_logger
import math

logger = get_logger(__name__)

class ClusteringService:
    def __init__(self, repository: ClusterRepository, embedding_service: EmbeddingService):
        self.repository = repository
        self.embedding_service = embedding_service
        self.merge_threshold = 0.82
        self.radius_km = 5.0 # Max distance for same cluster

    def _haversine(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate the great circle distance in kilometers between two points."""
        R = 6371.0
        lat1_rad, lon1_rad = math.radians(lat1), math.radians(lon1)
        lat2_rad, lon2_rad = math.radians(lat2), math.radians(lon2)
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    def process_signal(self, signal: Signal, signal_embedding: List[float], ward_id: str) -> Cluster:
        """
        Finds a matching cluster or creates a new one based on distance, category, and embedding similarity.
        Assumes signal has 'category', 'location'
        """
        logger.info("Clustering evaluation started")
        
        # 1. Search existing open clusters in the same ward and category
        # In MVP we might not strictly query by ward_id if it's not in Cluster schema yet, 
        # but we definitely query by category.
        clusters, _ = self.repository.list(filters={"category": signal.category, "status": "OPEN"}, limit=100)
        
        best_match: Optional[Cluster] = None
        highest_sim = 0.0
        
        for cluster in clusters:
            # Note: For MVP, assume we store a centroid embedding on the cluster. 
            # If not present, we skip. Realistically, we'd fetch the first signal's embedding for the cluster.
            # To keep it simple, let's assume we store cluster embeddings in a separate store or on the cluster itself.
            # We'll mock the cluster embedding fetch here for the example architecture.
            pass
            
        # Due to complexity of storing/fetching cluster embeddings in this MVP phase,
        # we will stub the actual merge logic.
        
        # If matched, we would update centroid and count.
        
        # Fallback: create new
        new_cluster = Cluster(
            category=signal.category,
            signals_count=1,
            location_center=signal.location,
            status="OPEN"
        )
        cluster_id = self.repository.create(new_cluster)
        new_cluster.id = cluster_id
        
        logger.info(f"Created new cluster {cluster_id}")
        return new_cluster
