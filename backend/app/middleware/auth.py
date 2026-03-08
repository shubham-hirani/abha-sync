from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token

security = HTTPBearer()


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> str:
    """
    Validates the custom JWT access token.
    Returns the user's user_id. Raises 401 if token is invalid.
    """
    token = credentials.credentials
    try:
        payload = decode_token(token)
        if not payload or payload.get("type") == "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials: check access token",
            )
        user_id = payload.get("sub")
        if not user_id:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials: no user returned",
            )
        return user_id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
        )
