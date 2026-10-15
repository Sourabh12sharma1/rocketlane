from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_current_user, hash_password, verify_password
from app.db import get_db
from app.models import User
from app.schemas import (
    AuthResponse,
    LoginRequest,
    OtpRequestResponse,
    OtpVerifyRequest,
    OtpVerifyResponse,
    RegisterRequest,
    UserPublic,
)
from app.services.otp import request_otp, verify_otp

router = APIRouter()


def _auth_response(user: User) -> AuthResponse:
    return AuthResponse(
        access_token=create_access_token(str(user.id)),
        user=UserPublic.model_validate(user),
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        phone=body.phone,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    db.refresh(user)
    return _auth_response(user)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return _auth_response(user)


@router.post("/otp/request", response_model=OtpRequestResponse)
def otp_request(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expires_in = request_otp(db, user)
    return OtpRequestResponse(ok=True, expires_in=expires_in)


@router.post("/otp/verify", response_model=OtpVerifyResponse)
def otp_verify(
    body: OtpVerifyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_otp(db, user, body.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired code",
        )
    return OtpVerifyResponse(phone_verified=True)
