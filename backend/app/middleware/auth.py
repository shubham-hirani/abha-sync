from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.supabase_client import get_supabase_client

security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> str:
    """
    Validates the Supabase access token by calling Supabase Auth API.
    Returns the user's Supabase UID. Raises 401 if token is invalid.
    """
    token = credentials.credentials
    try:
        supabase = get_supabase_client()
        res = supabase.auth.get_user(token)
        if res and res.user:
            return res.user.id
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials: no user returned",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )
