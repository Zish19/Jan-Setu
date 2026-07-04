import asyncio
import time
from typing import Dict, Any, Optional
from ..schemas.firestore import Signal, Cluster
from ..schemas.response import CategorizationResult
from .translation import TranslationService
from .vision import VisionService
from .categorization import CategorizationService
from .embedding import EmbeddingService
from .clustering import ClusteringService
from .geo_verification import GeoVerificationService
from .priority import PriorityScoringService
from .explanation import ExplanationService
from ..repositories.domain import SignalRepository, ClusterRepository
from ..core.logging import get_logger

logger = get_logger(__name__)

class SignalProcessingOrchestrator:
    """
    Coordinates the entire AI pipeline flow for a new citizen signal.
    """
    def __init__(
        self,
        translation: TranslationService,
        vision: VisionService,
        categorization: CategorizationService,
        embedding: EmbeddingService,
        clustering: ClusteringService,
        geo_verification: GeoVerificationService,
        priority: PriorityScoringService,
        explanation: ExplanationService,
        signal_repo: SignalRepository,
        cluster_repo: ClusterRepository
    ):
        self.translation = translation
        self.vision = vision
        self.categorization = categorization
        self.embedding = embedding
        self.clustering = clustering
        self.geo = geo_verification
        self.priority = priority
        self.explanation = explanation
        self.signal_repo = signal_repo
        self.cluster_repo = cluster_repo

    async def _gather_initial_ai_tasks(self, text: str, image_data: Optional[bytes] = None) -> tuple:
        """Runs independent tasks concurrently to minimize latency."""
        tasks = [
            asyncio.to_thread(self.translation.translate, text),
            asyncio.to_thread(self.embedding.generate_embedding, text)
        ]
        if image_data:
            tasks.append(asyncio.to_thread(self.vision.analyze, image_data))
        else:
            tasks.append(asyncio.sleep(0, result="")) # Mock vision result
            
        return await asyncio.gather(*tasks)

    async def process_signal(self, text: str, lat: float, lng: float, image_data: Optional[bytes] = None) -> Dict[str, Any]:
        req_start_time = time.time()
        
        # 1. Parallel execution of Translation, Embedding, and Vision
        translated_text, embedding_vector, vision_text = await self._gather_initial_ai_tasks(text, image_data)
        
        # 2. Categorization (depends on translation and vision)
        # We pass both texts to the categorizer context
        combined_text = f"Report: {translated_text}\nImage Analysis: {vision_text}"
        category_result: CategorizationResult = self.categorization.categorize(combined_text)
        
        # 3. Create initial Signal Object
        signal = Signal(
            text=text,
            translated_text=translated_text,
            category=category_result.category,
            location={"lat": lat, "lng": lng},
            status="PROCESSED"
        )
        # (Usually we'd save this to DB here, skipping for brevity)
        
        # 4. Clustering (depends on embedding and category)
        # Mocking ward_id for MVP
        cluster = self.clustering.process_signal(signal, embedding_vector, ward_id="ward_1")
        signal.cluster_id = cluster.id
        
        # 5. GeoVerification
        geo_result = self.geo.verify(lat, lng, signal.category)
        
        # 6. Priority Scoring
        # In MVP we just pass a mock list of signals. In reality we'd fetch them from signal_repo
        current_signals = [{"severity": category_result.severity}] * cluster.signals_count
        score_data = self.priority.recalculate_cluster_priority(cluster, current_signals)
        cluster.priority_score = score_data["total_score"]
        
        # 7. Explanation
        explanation = self.explanation.generate(
            total_score=cluster.priority_score,
            signal_count=cluster.signals_count,
            severity_avg=score_data["factor_breakdown"]["severity"] / 100 * 3.0, # reverse map
            geo_confidence=geo_result["confidence"]
        )
        cluster.explanation = explanation
        
        # 8. Persist results
        self.signal_repo.create(signal)
        if cluster.signals_count == 1:
            # We already created it in clustering service, just updating
            self.cluster_repo.update(cluster.id, cluster.model_dump(exclude_unset=True))
        else:
            self.cluster_repo.update(cluster.id, cluster.model_dump(exclude_unset=True))
            
        pipeline_latency = time.time() - req_start_time
        logger.info("Pipeline Complete", extra={"latency": pipeline_latency, "cluster_id": cluster.id})
        
        return {
            "signal_id": signal.id,
            "cluster": cluster.model_dump(),
            "pipeline_latency_sec": round(pipeline_latency, 3)
        }
