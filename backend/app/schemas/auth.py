from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    consent_given: bool = False


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    user_id: str
    email: str
    abha_number: str | None
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
