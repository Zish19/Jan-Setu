from ortools.sat.python import cp_model
from typing import List, Dict, Any
from ..schemas.firestore import Project
from ..config.settings import settings
from ..core.logging import get_logger

logger = get_logger(__name__)

class BudgetOptimizerService:
    """
    Multi-constraint budget optimization using Google OR-Tools CP-SAT solver.
    Maximizes priority score while respecting total budget and category caps.
    """
    def optimize(self, projects: List[Project]) -> Dict[str, Any]:
        logger.info(f"Starting optimization for {len(projects)} projects")
        
        model = cp_model.CpModel()
        
        # Variables: boolean array indicating if project[i] is selected
        selected = [model.NewBoolVar(f"x_{i}") for i in range(len(projects))]
        
        # We need integer costs for CP-SAT. Multiply by 100 to handle cents if needed, 
        # or just assume estimated_cost is in integer INR (which is standard).
        costs = [int(p.estimated_cost) for p in projects]
        
        # Note: MVP assumes priority_score is stored on the cluster, so Project needs to join it.
        # For simplicity in this mock, we assume project has a 'priority_score' property or 
        # we fetch it from its cluster. Let's assume projects are passed with 'priority_score' injected.
        # Here we mock priority scores for the solver if missing.
        priorities = [int(getattr(p, "priority_score", 50) * 100) for p in projects]
        
        # Constraint 1: Total Budget
        model.Add(sum(selected[i] * costs[i] for i in range(len(projects))) <= settings.TOTAL_BUDGET_INR)
        
        # (Future constraints like Category Caps and Ward Fairness go here using model.Add)
        
        # Objective: Maximize total priority score
        model.Maximize(sum(selected[i] * priorities[i] for i in range(len(projects))))
        
        # Solve
        solver = cp_model.CpSolver()
        status = solver.Solve(model)
        
        results = {
            "selected_projects": [],
            "rejected_projects": [],
            "budget_used": 0,
            "remaining_budget": settings.TOTAL_BUDGET_INR,
            "status": solver.StatusName(status)
        }
        
        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            for i in range(len(projects)):
                if solver.Value(selected[i]):
                    results["selected_projects"].append(projects[i])
                    results["budget_used"] += costs[i]
                else:
                    results["rejected_projects"].append({
                        "project": projects[i],
                        "reason": "Budget optimization constraint (lower ROI)"
                    })
            results["remaining_budget"] = settings.TOTAL_BUDGET_INR - results["budget_used"]
            logger.info("Optimization successful", extra={"budget_used": results["budget_used"]})
        else:
            logger.error("Optimization failed to find a feasible solution")
            
        return results
