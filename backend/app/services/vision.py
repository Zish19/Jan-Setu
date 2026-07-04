from ..core.gemini import gemini_client
from ..core.logging import get_logger
from ..prompts.vision import VISION_PROMPT

logger = get_logger(__name__)

class VisionService:
    """
    Handles image analysis using Gemini Vision capabilities.
    """
    def analyze(self, image_data: bytes, mime_type: str = "image/jpeg") -> str:
        if not image_data:
            return ""
            
        logger.info("Vision analysis started")
        
        # We use Flash for vision analysis unless heavy reasoning is needed,
        # but for parsing images of issues, Flash is excellent.
        analysis = gemini_client.analyze_image(
            image_data=image_data,
            mime_type=mime_type,
            prompt=VISION_PROMPT,
            use_pro=False
        )
        
        logger.info("Vision analysis completed")
        return analysis.strip()
