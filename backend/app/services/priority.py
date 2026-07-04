from typing import Dict, Any
from ..schemas.firestore import Cluster
from ..config.settings import settings
from ..core.logging import get_logger

logger = get_logger(__name__)

class PriorityCalculator:
    """
    Pure mathematical calculator for cluster priority scoring.
    """
    def __init__(self):
        # Weights could be loaded from config
        self.weights = {
            "signal_count": 0.4,
            "severity_avg": 0.4,
            "geo_verification": 0.2
        }

    def calculate(self, signals_count: int, severity_avg: float, geo_confidence: float) -> Dict[str, Any]:
        """
        severity_avg: 1.0 (LOW), 2.0 (MEDIUM), 3.0 (HIGH)
        geo_confidence: 0.0 to 1.0
        """
        # Normalize signal count (logarithmic to prevent extreme skew)
        import math
        norm_count = min(1.0, math.log10(signals_count + 1) / 3.0)  # Maxes out around 1000 signals
        
        # Normalize severity (out of 3.0)
        norm_severity = severity_avg / 3.0
        
        score = (
            (norm_count * self.weights["signal_count"]) +
            (norm_severity * self.weights["severity_avg"]) +
            (geo_confidence * self.weights["geo_verification"])
        ) * 100.0  # Scale to 0-100
        
        return {
            "total_score": round(score, 2),
            "factor_breakdown": {
                "signal_volume": round(norm_count * 100, 2),
                "severity": round(norm_severity * 100, 2),
                "verification": round(geo_confidence * 100, 2)
            }
        }

class PriorityScoringService:
    """
    Coordinates data gathering for the priority calculator.
    """
    def __init__(self, calculator: PriorityCalculator):
        self.calculator = calculator
        
    def recalculate_cluster_priority(self, cluster: Cluster, current_signals: list) -> Dict[str, Any]:
        logger.info(f"Recalculating priority for cluster {cluster.id}")
        
        # 1. Compute average severity
        severity_map = {"LOW": 1.0, "MEDIUM": 2.0, "HIGH": 3.0}
        total_severity = sum(severity_map.get(s.get("severity", "LOW"), 1.0) for s in current_signals)
        avg_severity = total_severity / max(1, len(current_signals))
        
        # 2. Mock geo confidence since we don't have it stored on cluster directly yet
        geo_confidence = 0.95
        
        return self.calculator.calculate(
            signals_count=len(current_signals),
            severity_avg=avg_severity,
            geo_confidence=geo_confidence
        )
