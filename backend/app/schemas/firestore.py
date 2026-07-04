from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FirestoreModel(BaseModel):
    id: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    deleted: bool = False

class Signal(FirestoreModel):
    text: str
    translated_text: Optional[str] = None
    category: Optional[str] = None
    location: dict # e.g. {"lat": float, "lng": float}
    status: str = "PENDING"
    cluster_id: Optional[str] = None

class Cluster(FirestoreModel):
    category: str
    signals_count: int = 0
    priority_score: float = 0.0
    location_center: dict
    status: str = "OPEN"
    explanation: Optional[str] = None

class Project(FirestoreModel):
    cluster_id: str
    category: str
    estimated_cost: float
    status: str = "PROPOSED"
