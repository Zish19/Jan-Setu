import hashlib
import numpy as np
from typing import Dict, List, Optional
from ..core.gemini import gemini_client
from ..core.logging import get_logger

logger = get_logger(__name__)

class EmbeddingService:
    """
    Handles text normalization, caching, generating embeddings via Gemini,
    and calculating cosine similarities.
    """
    def __init__(self):
        # In a real distributed system, this would be Redis.
        # For this MVP, an in-memory dictionary suffices for runtime caching.
        self._cache: Dict[str, List[float]] = {}
        self.similarity_threshold = 0.82

    def _normalize_text(self, text: str) -> str:
        """Normalizes text by lowercasing and stripping whitespace."""
        return " ".join(text.lower().split())

    def _generate_cache_key(self, normalized_text: str) -> str:
        """Generates a SHA-256 hash of the normalized text."""
        return hashlib.sha256(normalized_text.encode('utf-8')).hexdigest()

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generates an embedding for the given text.
        Checks cache first.
        """
        normalized = self._normalize_text(text)
        if not normalized:
            raise ValueError("Cannot generate embedding for empty text.")
            
        cache_key = self._generate_cache_key(normalized)
        
        if cache_key in self._cache:
            logger.info("Embedding Cache Hit", extra={"cache_key": cache_key})
            return self._cache[cache_key]
            
        logger.info("Embedding Cache Miss", extra={"cache_key": cache_key})
        embedding = gemini_client.generate_embeddings(normalized)
        self._cache[cache_key] = embedding
        return embedding

    def calculate_similarity(self, emb1: List[float], emb2: List[float]) -> float:
        """Calculates cosine similarity between two vectors."""
        vec1 = np.array(emb1)
        vec2 = np.array(emb2)
        
        dot_product = np.dot(vec1, vec2)
        norm_product = np.linalg.norm(vec1) * np.linalg.norm(vec2)
        
        if norm_product == 0:
            return 0.0
            
        return float(dot_product / norm_product)

    def is_similar(self, emb1: List[float], emb2: List[float]) -> bool:
        """Checks if two embeddings meet the similarity threshold."""
        return self.calculate_similarity(emb1, emb2) >= self.similarity_threshold
