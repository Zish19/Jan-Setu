from ..core.gemini import gemini_client
from ..core.logging import get_logger
from ..prompts.translation import TRANSLATION_PROMPT

logger = get_logger(__name__)

class TranslationService:
    """
    Handles translation of citizen reports to English.
    """
    def translate(self, text: str) -> str:
        if not text or not text.strip():
            return ""
            
        logger.info("Translation generation started")
        prompt = TRANSLATION_PROMPT.format(text=text)
        
        # We use Flash for translation as it is fast and capable enough
        translated_text = gemini_client.generate_text(
            prompt=prompt,
            use_pro=False
        )
        
        logger.info("Translation generation completed")
        return translated_text.strip()
