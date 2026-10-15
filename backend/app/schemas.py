import uuid

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    phone: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: uuid.UUID
    email: EmailStr
    phone: str
    phone_verified: bool

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class OtpRequestResponse(BaseModel):
    ok: bool
    expires_in: int


class OtpVerifyRequest(BaseModel):
    code: str


class OtpVerifyResponse(BaseModel):
    phone_verified: bool
