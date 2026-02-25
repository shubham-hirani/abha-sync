from pydantic import BaseModel, field_validator
import re


class SendOTPRequest(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Strip whitespace
        v = v.strip()
        # Must start with + and contain 10-15 digits
        if not re.match(r"^\+[1-9]\d{9,14}$", v):
            raise ValueError(
                "Phone number must be in E.164 format, e.g. +919876543210"
            )
        return v


class VerifyOTPRequest(BaseModel):
    phone: str
    token: str
    consent_given: bool = False

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^\+[1-9]\d{9,14}$", v):
            raise ValueError("Phone number must be in E.164 format, e.g. +919876543210")
        return v

    @field_validator("token")
    @classmethod
    def validate_token(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^\d{6}$", v):
            raise ValueError("OTP must be a 6-digit number")
        return v


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    user_id: str
    supabase_uid: str
    phone_number: str
    abha_number: str | None
    email: str | None
    preferred_language: str
    consent_given: bool
    created_at: str | None
    last_login: str | None


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class MessageResponse(BaseModel):
    message: str
    detail: str | None = None
