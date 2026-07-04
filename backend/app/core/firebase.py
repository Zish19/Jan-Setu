import firebase_admin
from firebase_admin import credentials, firestore
from .logging import get_logger
from ..config.settings import settings

logger = get_logger(__name__)

def initialize_firebase() -> firestore.Client:
    """
    Initializes the Firebase Admin SDK using credentials from settings.
    Returns a Firestore client instance.
    """
    if not firebase_admin._apps:
        try:
            if settings.FIREBASE_PROJECT_ID and settings.FIREBASE_PRIVATE_KEY:
                # Construct credential dictionary
                cred_dict = {
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                    "client_email": settings.FIREBASE_CLIENT_EMAIL,
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized successfully with provided credentials.")
            else:
                # Fallback for local emulation / default credentials if configured
                firebase_admin.initialize_app()
                logger.info("Firebase initialized with default credentials.")
        except Exception as e:
            logger.error("Failed to initialize Firebase", extra={"error": str(e)})
            raise e
            
    return firestore.client()

db = initialize_firebase()
