from typing import TypeVar, Generic, Optional, List, Dict, Any, Tuple
from google.cloud.firestore import Client, CollectionReference, DocumentReference, DocumentSnapshot, Transaction
from datetime import datetime
from pydantic import BaseModel
from ..core.firebase import db
from ..core.logging import get_logger

logger = get_logger(__name__)

T = TypeVar("T", bound=BaseModel)

class BaseRepository(Generic[T]):
    """
    Generic Repository handling common Firestore operations.
    Contains NO business logic.
    """
    collection_name: str
    model_class: type[T]
    
    def __init__(self, client: Client = db):
        self.db = client
        self.collection: CollectionReference = self.db.collection(self.collection_name)
    
    def _add_timestamps(self, data: dict, is_update: bool = False) -> dict:
        now = datetime.utcnow()
        if not is_update:
            data['createdAt'] = now
        data['updatedAt'] = now
        return data

    def create(self, data: T, doc_id: Optional[str] = None) -> str:
        """Creates a new document and returns its ID."""
        doc_data = data.model_dump(exclude_unset=True)
        doc_data = self._add_timestamps(doc_data)
        doc_data['deleted'] = False
        
        if doc_id:
            self.collection.document(doc_id).set(doc_data)
            return doc_id
        else:
            _, doc_ref = self.collection.add(doc_data)
            return doc_ref.id

    def get(self, doc_id: str) -> Optional[T]:
        """Retrieves a document by ID."""
        doc = self.collection.document(doc_id).get()
        if doc.exists and not doc.to_dict().get('deleted', False):
            return self.model_class(**doc.to_dict())
        return None

    def update(self, doc_id: str, data: dict) -> None:
        """Updates an existing document."""
        data = self._add_timestamps(data, is_update=True)
        self.collection.document(doc_id).update(data)

    def soft_delete(self, doc_id: str) -> None:
        """Soft deletes a document."""
        self.collection.document(doc_id).update({"deleted": True, "updatedAt": datetime.utcnow()})

    def list(self, filters: Optional[Dict[str, Any]] = None, limit: int = 100, cursor: Optional[DocumentSnapshot] = None) -> Tuple[List[T], Optional[DocumentSnapshot]]:
        """
        Lists documents with basic filtering and pagination.
        Returns a tuple of (results, last_document_snapshot).
        """
        query = self.collection.where("deleted", "==", False)
        
        if filters:
            for key, value in filters.items():
                query = query.where(key, "==", value)
                
        query = query.limit(limit)
        
        if cursor:
            query = query.start_after(cursor)
            
        docs = query.stream()
        
        results = []
        last_doc = None
        for doc in docs:
            results.append(self.model_class(**doc.to_dict()))
            last_doc = doc
            
        return results, last_doc
        
    def run_in_transaction(self, transaction: Transaction, doc_id: str, update_fn: callable):
        """
        Runs an update function inside a Firestore transaction.
        update_fn should take (transaction, DocumentReference)
        """
        doc_ref = self.collection.document(doc_id)
        return update_fn(transaction, doc_ref)
