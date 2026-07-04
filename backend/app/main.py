from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .core.exceptions import global_exception_handler

tags_metadata = [
    {"name": "Authentication", "description": "Operations with user authentication and token generation."},
    {"name": "Signals", "description": "Intake for raw citizen complaints (multimodal: text, voice, images)."},
    {"name": "Clusters", "description": "Geo-spatially grouped issues merged via AI embeddings."},
    {"name": "Dashboard", "description": "Live KPIs for the MP Command Center."},
    {"name": "Optimization", "description": "OR-Tools CP-SAT budget solver endpoints."},
    {"name": "Assistant", "description": "Gemini-powered RAG agent for constituency intelligence."},
    {"name": "Trust", "description": "Public trust score and transparency metrics."},
    {"name": "Audit", "description": "Officer impact verification endpoints."}
]

app = FastAPI(
    title="Jan-Setu API", 
    description="""
    **Jan-Setu** is an AI-native civic intelligence platform. 
    It ingests messy, multimodal citizen reports, clusters them geospatially, and uses **CP-SAT OR-Tools + Google Gemini** to recommend budget-optimal infrastructure interventions for Members of Parliament.
    """,
    version="1.0.0",
    openapi_tags=tags_metadata
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handler
app.add_exception_handler(Exception, global_exception_handler)

# Include Routers
from .api.v1.signals import router as signals_router
from .api.v1.optimize import router as optimize_router
from .api.v1.assistant import router as assistant_router
from .api.v1.clusters import router as clusters_router
from .api.v1.dashboard import router as dashboard_router
from .api.v1.trust import router as trust_router
from .api.v1.audit import router as audit_router

app.include_router(signals_router, prefix="/api/v1/signals", tags=["Signals"])
app.include_router(optimize_router, prefix="/api/v1/optimize", tags=["Optimization"])
app.include_router(assistant_router, prefix="/api/v1/assistant", tags=["Assistant"])
app.include_router(clusters_router, prefix="/api/v1/clusters", tags=["Clusters"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(trust_router, prefix="/api/v1/trust", tags=["Trust"])
app.include_router(audit_router, prefix="/api/v1/audit", tags=["Audit"])

@app.get("/health", tags=["Authentication"])
def health_check():
    return {"status": "ok", "service": "Jan-Setu API"}

# Main entrypoint will include routers later
