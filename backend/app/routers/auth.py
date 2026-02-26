from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.supabase_client import get_supabase_client, get_supabase_admin_client
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
    Register a new user with email and password via Supabase,
    then create a profile in our PostgreSQL DB.
    """
    supabase = get_supabase_client()
    try:
        res = supabase.auth.sign_up({"email": body.email, "password": body.password})
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signup failed: {str(e)}",
        )

    if not res.session or not res.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Signup failed — no session returned. The email may already be registered.",
        )

    supabase_uid = res.user.id
    access_token = res.session.access_token
    refresh_token_value = res.session.refresh_token

    # Create user profile in PostgreSQL
    db_user = db.query(User).filter(User.supabase_uid == supabase_uid).first()
    if db_user is None:
        db_user = User(
            supabase_uid=supabase_uid,
            email=body.email,
            consent_given=body.consent_given,
            last_login=datetime.utcnow(),
        )
        db.add(db_user)
    else:
        db_user.last_login = datetime.utcnow()
        if body.consent_given:
            db_user.consent_given = True

    db.commit()
    db.refresh(db_user)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token_value,
        user=UserOut(**db_user.to_dict()),
    )


@router.post("/login", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate an existing user with email and password via Supabase.
    """
    supabase = get_supabase_client()
    try:
        res = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Login failed: {str(e)}",
        )

    if not res.session or not res.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    supabase_uid = res.user.id
    access_token = res.session.access_token
    refresh_token_value = res.session.refresh_token

    # Upsert user profile
    db_user = db.query(User).filter(User.supabase_uid == supabase_uid).first()
    if db_user is None:
        db_user = User(
            supabase_uid=supabase_uid,
            email=body.email,
            last_login=datetime.utcnow(),
        )
        db.add(db_user)
    else:
        db_user.last_login = datetime.utcnow()

    db.commit()
    db.refresh(db_user)

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token_value,
        user=UserOut(**db_user.to_dict()),
    )


@router.post("/refresh", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh the Supabase session using a refresh token."""
    supabase = get_supabase_client()
    try:
        res = supabase.auth.refresh_session(body.refresh_token)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not refresh session: {str(e)}",
        )

    if not res.session or not res.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session refresh failed",
        )

    supabase_uid = res.user.id
    db_user = db.query(User).filter(User.supabase_uid == supabase_uid).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db_user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(db_user)

    return AuthResponse(
        access_token=res.session.access_token,
        refresh_token=res.session.refresh_token,
        user=UserOut(**db_user.to_dict()),
    )


@router.post("/logout", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def logout(uid: str = Depends(get_current_user_id)):
    """Sign out the current user from Supabase (invalidates all sessions)."""
    supabase = get_supabase_admin_client()
    try:
        supabase.auth.admin.sign_out(uid)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Logout failed: {str(e)}",
        )
    return MessageResponse(message="Logged out successfully")


@router.get("/me", response_model=UserOut, status_code=status.HTTP_200_OK)
async def get_me(uid: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    """Return the authenticated user's profile."""
    db_user = db.query(User).filter(User.supabase_uid == uid).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return UserOut(**db_user.to_dict())
