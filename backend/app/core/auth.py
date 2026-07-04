from fastapi import Request, HTTPException
from firebase_admin import auth
from ..core.logging import get_logger

logger = get_logger(__name__)

def verify_firebase_token(request: Request):
    """
    Dependency to verify Firebase JWT token from Authorization header.
    Requires 'Bearer <token>'.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
        
    token = auth_header.split(" ")[1]
    
    try:
        decoded_token = auth.verify_id_token(token)
        # Store user info in request state for downstream handlers
        request.state.user = decoded_token
        return decoded_token
    except Exception as e:
        logger.error("Authentication failed", extra={"error": str(e)})
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

def require_role(role: str):
    """
    Dependency generator to enforce role-based access.
    Assumes role is stored in custom claims of the Firebase JWT.
    """
    def role_checker(request: Request):
        user = getattr(request.state, "user", None)
        if not user:
            verify_firebase_token(request)
            user = request.state.user
            
        user_role = user.get("role")
        if user_role != role and user_role != "admin": # Admin can access anything
            logger.warning("Forbidden access attempt", extra={"uid": user.get("uid"), "required_role": role, "actual_role": user_role})
            raise HTTPException(status_code=403, detail=f"Operation requires {role} role.")
        return user
    return role_checker
