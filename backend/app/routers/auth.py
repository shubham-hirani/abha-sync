from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.middleware.auth import get_current_user_id
from app.models.user import User
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    RefreshTokenRequest,
    AuthResponse,
    MessageResponse,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user with email and password,
    create a profile in PostgreSQL, and issue JWTs.
    """
    db_user = db.query(User).filter(User.email == body.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    hashed_password = get_password_hash(body.password)

    db_user = User(
        email=body.email,
        hashed_password=hashed_password,
        consent_given=body.consent_given,
        last_login=datetime.utcnow(),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    access_token = create_access_token(subject=str(db_user.user_id))
    refresh_token = create_refresh_token(subject=str(db_user.user_id))

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut(**db_user.to_dict()),
    )

@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an existing user with email and password.
    """
    db_user = db.query(User).filter(User.email == body.email).first()
    if not db_user or not verify_password(body.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    db_user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(db_user)

    access_token = create_access_token(subject=str(db_user.user_id))
    refresh_token = create_refresh_token(subject=str(db_user.user_id))

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut(**db_user.to_dict()),
    )

@router.post("/refresh", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh the session using a refresh token."""
    payload = decode_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_id = payload.get("sub")
    db_user = db.query(User).filter(User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db_user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(db_user)

    access_token = create_access_token(subject=str(db_user.user_id))
    new_refresh_token = create_refresh_token(subject=str(db_user.user_id))

    return AuthResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserOut(**db_user.to_dict()),
    )

@router.post("/logout", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def logout(uid: str = Depends(get_current_user_id)):
    """Sign out the current user (stateless, so we just return success)."""
    return MessageResponse(message="Logged out successfully")

@router.get("/me", response_model=UserOut, status_code=status.HTTP_200_OK)
async def get_me(uid: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Return the authenticated user's profile."""
    db_user = db.query(User).filter(User.user_id == uid).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return UserOut(**db_user.to_dict())
