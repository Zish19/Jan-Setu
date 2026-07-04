from .base import BaseRepository
from ..schemas.firestore import Signal, Cluster, Project

class SignalRepository(BaseRepository[Signal]):
    collection_name = "signals"
    model_class = Signal

class ClusterRepository(BaseRepository[Cluster]):
    collection_name = "clusters"
    model_class = Cluster

class ProjectRepository(BaseRepository[Project]):
    collection_name = "projects"
    model_class = Project
