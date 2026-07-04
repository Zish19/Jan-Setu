from ..core.gemini import gemini_client
from ..core.logging import get_logger
from ..prompts.priority_explanation import EXPLANATION_PROMPT

logger = get_logger(__name__)

class ExplanationService:
    """
    Generates professional, factual explanations of computed priority scores.
    Uses Gemini Pro as instructed, with strict non-hallucination rules.
    """
    def generate(self, total_score: float, signal_count: int, severity_avg: float, geo_confidence: float) -> str:
        logger.info("Explanation generation started")
        
        prompt = EXPLANATION_PROMPT.format(
            total_score=total_score,
            signal_count=signal_count,
            severity_avg=round(severity_avg, 2),
            geo_confidence=round(geo_confidence, 2)
        )
        
        explanation = gemini_client.generate_text(
            prompt=prompt,
            use_pro=True # Use Pro for sophisticated executive summaries
        )
        
        logger.info("Explanation generation completed")
        return explanation.strip()
