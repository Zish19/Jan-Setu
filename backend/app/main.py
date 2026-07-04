from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .core.exceptions import global_exception_handler

app = FastAPI(title=settings.PROJECT_NAME, description="AI-native constituency development intelligence platform")

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

app.include_router(signals_router, prefix="/api/v1/signals")
app.include_router(optimize_router, prefix="/api/v1/optimize")
app.include_router(assistant_router, prefix="/api/v1/assistant")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}

# Main entrypoint will include routers later
