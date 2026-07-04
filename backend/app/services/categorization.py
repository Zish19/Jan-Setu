from ..core.gemini import gemini_client
from ..core.logging import get_logger
from ..prompts.categorization import CATEGORIZATION_PROMPT
from ..schemas.response import CategorizationResult

logger = get_logger(__name__)

class CategorizationService:
    """
    Handles categorizing citizen reports using Gemini Flash with deterministic JSON output.
    """
    def categorize(self, translated_text: str) -> CategorizationResult:
        if not translated_text:
            raise ValueError("Text is required for categorization.")
            
        logger.info("Categorization started")
        prompt = CATEGORIZATION_PROMPT.format(text=translated_text)
        
        result = gemini_client.generate_json(
            prompt=prompt,
            schema=CategorizationResult,
            use_pro=False,
            temperature=0.1
        )
        
        logger.info("Categorization completed", extra={
            "category": result.category,
            "confidence": result.confidence
        })
        
        return result
