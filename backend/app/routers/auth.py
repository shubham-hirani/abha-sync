from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.supabase_client import get_supabase_client, get_supabase_admin_client
from app.middleware.auth import get_current_user_id
from app.models.user import User
from app.schemas.auth import (
    SendOTPRequest,
    VerifyOTPRequest,
    RefreshTokenRequest,
    AuthResponse,
    MessageResponse,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/send-otp", response_model=MessageResponse, status_code=status.HTTP_200_OK)
async def send_otp(body: SendOTPRequest):
    """
    Send an OTP to the given phone number via Supabase (SMS).
    Works for both signup (new user) and login (existing user).
    """
    supabase = get_supabase_client()
    try:
        print(body.phone)
        res = supabase.auth.sign_in_with_otp({"phone": body.phone})
        # supabase-py raises on error automatically
        return MessageResponse(
            message="OTP sent successfully",
            detail=f"A 6-digit code was sent to {body.phone}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to send OTP: {str(e)}",
        )


@router.post("/verify-otp", response_model=AuthResponse, status_code=status.HTTP_200_OK)
async def verify_otp(body: VerifyOTPRequest, db: Session = Depends(get_db)):
    """
    Verify the OTP and return Supabase session tokens.
    On first login (signup), creates a user profile in our PostgreSQL DB.
    """
    supabase = get_supabase_client()
    try:
        res = supabase.auth.verify_otp(
            {"phone": body.phone, "token": body.token, "type": "sms"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired OTP: {str(e)}",
        )

    if not res.session or not res.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OTP verification failed — no session returned",
        )

    supabase_uid = res.user.id
    access_token = res.session.access_token
    refresh_token = res.session.refresh_token

    # Upsert user profile in our PostgreSQL DB
    db_user = db.query(User).filter(User.supabase_uid == supabase_uid).first()
    if db_user is None:
        db_user = User(
            supabase_uid=supabase_uid,
            phone_number=body.phone,
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
        refresh_token=refresh_token,
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
