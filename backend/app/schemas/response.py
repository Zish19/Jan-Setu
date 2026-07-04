from pydantic import BaseModel, Field
from typing import Optional

class CategorizationResult(BaseModel):
    category: str = Field(description="The primary category of the issue (e.g., Roads, Healthcare, Education, Water & Sanitation, Others).")
    subcategory: str = Field(description="A more specific subcategory.")
    severity: str = Field(description="The severity level: 'LOW', 'MEDIUM', or 'HIGH'.")
    affected_infrastructure: Optional[str] = Field(description="The specific infrastructure affected, if any.")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0.", ge=0.0, le=1.0)
