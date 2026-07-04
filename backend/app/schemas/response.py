from pydantic import BaseModel, Field
from typing import Optional, Any, Dict

class CategorizationResult(BaseModel):
    category: str = Field(description="The primary category of the issue (e.g., Roads, Healthcare, Education, Water & Sanitation, Others).")
    subcategory: str = Field(description="A more specific subcategory.")
    severity: str = Field(description="The severity level: 'LOW', 'MEDIUM', or 'HIGH'.")
    affected_infrastructure: Optional[str] = Field(description="The specific infrastructure affected, if any.")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0.", ge=0.0, le=1.0)

class ApiError(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None

class ApiResponse(BaseModel):
    success: bool
    message: str = ""
    data: Optional[Any] = None
    meta: Optional[Dict[str, Any]] = None
    error: Optional[ApiError] = None
