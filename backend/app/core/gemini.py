import time
import uuid
import google.generativeai as genai
from typing import Optional, Any, Dict, Type
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from google.api_core.exceptions import ResourceExhausted, InternalServerError
from ..config.settings import settings
from .logging import get_logger

logger = get_logger(__name__)

# Initialize the library
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiClient:
    """
    Singleton Gemini Client.
    Handles rate limits, logging, retries, and schema validation.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(GeminiClient, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        # We reuse models where possible
        self.flash_model = "gemini-1.5-flash"
        self.pro_model = "gemini-1.5-pro"
        self.embedding_model = "models/text-embedding-004"

    def _get_model(self, use_pro: bool = False, system_instruction: Optional[str] = None) -> genai.GenerativeModel:
        model_name = self.pro_model if use_pro else self.flash_model
        return genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_instruction
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((ResourceExhausted, InternalServerError))
    )
    def generate_json(self, prompt: str, schema: Type[BaseModel], use_pro: bool = False, system_instruction: Optional[str] = None) -> BaseModel:
        """Generates structured JSON mapped to a Pydantic schema."""
        req_id = str(uuid.uuid4())
        model = self._get_model(use_pro, system_instruction)
        start_time = time.time()
        
        try:
            logger.info("Gemini Request Started", extra={"request_id": req_id, "model": model.model_name, "type": "json"})
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=schema,
                )
            )
            
            latency = time.time() - start_time
            # Assuming usage_metadata is available in the response for token counts
            usage = response.usage_metadata if hasattr(response, 'usage_metadata') else None
            
            logger.info("Gemini Request Success", extra={
                "request_id": req_id,
                "latency_sec": round(latency, 3),
                "usage": usage.total_token_count if usage else None
            })
            
            return schema.model_validate_json(response.text)
            
        except Exception as e:
            logger.error("Gemini Request Failed", extra={"request_id": req_id, "error": str(e)})
            raise e

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((ResourceExhausted, InternalServerError))
    )
    def generate_text(self, prompt: str, use_pro: bool = False, system_instruction: Optional[str] = None) -> str:
        """Generates plain text."""
        req_id = str(uuid.uuid4())
        model = self._get_model(use_pro, system_instruction)
        start_time = time.time()
        
        try:
            logger.info("Gemini Request Started", extra={"request_id": req_id, "model": model.model_name, "type": "text"})
            response = model.generate_content(prompt)
            latency = time.time() - start_time
            
            usage = response.usage_metadata if hasattr(response, 'usage_metadata') else None
            logger.info("Gemini Request Success", extra={
                "request_id": req_id,
                "latency_sec": round(latency, 3),
                "usage": usage.total_token_count if usage else None
            })
            return response.text
        except Exception as e:
            logger.error("Gemini Request Failed", extra={"request_id": req_id, "error": str(e)})
            raise e

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def generate_embeddings(self, text: str) -> list[float]:
        """Generates embeddings for a given text."""
        req_id = str(uuid.uuid4())
        start_time = time.time()
        try:
            logger.info("Gemini Embedding Started", extra={"request_id": req_id})
            result = genai.embed_content(
                model=self.embedding_model,
                content=text,
                task_type="retrieval_document"
            )
            latency = time.time() - start_time
            logger.info("Gemini Embedding Success", extra={"request_id": req_id, "latency_sec": round(latency, 3)})
            return result['embedding']
        except Exception as e:
            logger.error("Gemini Embedding Failed", extra={"request_id": req_id, "error": str(e)})
            raise e

gemini_client = GeminiClient()
