import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import random
from app.core.firebase import db
from app.core.logging import get_logger
from app.repositories.domain import SignalRepository, ClusterRepository, ProjectRepository
from app.schemas.firestore import Signal, Cluster, Project

logger = get_logger(__name__)

WARDS = ["ward_1", "ward_2", "ward_3", "ward_4", "ward_5"]
CATEGORIES = ["Roads", "Healthcare", "Education", "Water & Sanitation", "Others"]

def seed_database():
    logger.info("Starting demo database seed...")
    
    signal_repo = SignalRepository()
    cluster_repo = ClusterRepository()
    
    # Clean up existing data for clean demo
    # (In a real script you might delete collection or keep it)
    
    # 20 Multilingual complaints (mocked as english here for brevity)
    complaints = [
        "Huge pothole on main road causing accidents.",
        "Primary health center has no doctors after 2 PM.",
        "School roof is leaking water.",
        "No drinking water supply for 3 days.",
        "Garbage dumped near park.",
        "Streetlights are not working on MG Road.",
        "Hospital bed shortage during viral fever outbreak.",
        "Primary school lacks functional toilets.",
        "Drainage is overflowing into streets.",
        "Stray dog menace near market area.",
        "Potholes causing traffic jams.",
        "PHC medicine stock is empty.",
        "High school needs computer lab.",
        "Pipeline burst wasting water.",
        "Public toilet is very dirty.",
        "Road construction abandoned halfway.",
        "Ambulance service takes 2 hours.",
        "Teacher shortage in village school.",
        "Sewage mixed with drinking water.",
        "Mosquito breeding in open drains."
    ]
    
    for i, text in enumerate(complaints):
        category = CATEGORIES[i % len(CATEGORIES)]
        ward = random.choice(WARDS)
        
        signal = Signal(
            text=text,
            translated_text=text,
            category=category,
            location={"lat": 28.6139 + random.uniform(-0.05, 0.05), "lng": 77.2090 + random.uniform(-0.05, 0.05)},
            status="PROCESSED"
        )
        
        # We will directly create mock clusters for demo speed
        cluster = Cluster(
            category=category,
            signals_count=random.randint(1, 50),
            priority_score=random.uniform(30.0, 95.0),
            location_center=signal.location,
            status="OPEN",
            explanation=f"High volume of {category.lower()} complaints with severe impact."
        )
        
        cluster_id = cluster_repo.create(cluster)
        signal.cluster_id = cluster_id
        signal_repo.create(signal)
        
    logger.info("Successfully seeded 20 signals and clusters.")

if __name__ == "__main__":
    seed_database()
