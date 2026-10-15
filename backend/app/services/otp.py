import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models import OtpChallenge, User

logger = logging.getLogger(__name__)


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


def _generate_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def request_otp(db: Session, user: User) -> int:
    settings = get_settings()
    code = _generate_code()
    now = datetime.now(timezone.utc)
    challenge = OtpChallenge(
        user_id=user.id,
        code_hash=_hash_code(code),
        expires_at=now + timedelta(seconds=settings.otp_ttl_seconds),
    )
    db.add(challenge)
    db.commit()
    logger.info("DEV OTP for %s: %s", user.phone, code)
    return settings.otp_ttl_seconds


def verify_otp(db: Session, user: User, code: str) -> bool:
    now = datetime.now(timezone.utc)
    challenge = (
        db.query(OtpChallenge)
        .filter(
            OtpChallenge.user_id == user.id,
            OtpChallenge.used_at.is_(None),
            OtpChallenge.expires_at > now,
        )
        .order_by(OtpChallenge.created_at.desc())
        .first()
    )
    if challenge is None or challenge.code_hash != _hash_code(code):
        return False
    challenge.used_at = now
    user.phone_verified = True
    db.commit()
    return True
