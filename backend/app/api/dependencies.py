from ..services.translation import TranslationService
from ..services.vision import VisionService
from ..services.categorization import CategorizationService
from ..services.embedding import EmbeddingService
from ..services.clustering import ClusteringService
from ..services.geo_verification import GeoVerificationService
from ..services.priority import PriorityScoringService
from ..services.explanation import ExplanationService
from ..repositories.domain import SignalRepository, ClusterRepository
from ..services.orchestrator import SignalProcessingOrchestrator

_orchestrator = None

def get_orchestrator() -> SignalProcessingOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        cluster_repo = ClusterRepository()
        signal_repo = SignalRepository()
        embedding_svc = EmbeddingService()
        
        _orchestrator = SignalProcessingOrchestrator(
            translation=TranslationService(),
            vision=VisionService(),
            categorization=CategorizationService(),
            embedding=embedding_svc,
            clustering=ClusteringService(repository=cluster_repo, embedding_service=embedding_svc),
            geo_verification=GeoVerificationService(),
            priority=PriorityScoringService(),
            explanation=ExplanationService(),
            signal_repo=signal_repo,
            cluster_repo=cluster_repo
        )
    return _orchestrator
