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

@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}

# Main entrypoint will include routers later
