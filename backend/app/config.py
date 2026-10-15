from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_LOCAL_DATABASE_URL = (
    "postgresql+psycopg://rocketlane@127.0.0.1:5433/rocketlane"
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = Field(
        default=_LOCAL_DATABASE_URL,
        description="Override via DATABASE_URL in .env for local/dev.",
    )
    jwt_secret: str = Field(
        ...,
        min_length=32,
        description="Required; set JWT_SECRET in .env (>= 32 characters).",
    )
    jwt_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:5173"
    otp_ttl_seconds: int = 300
    max_upload_bytes: int = 5 * 1024 * 1024
    otp_max_attempts: int = 5

    @field_validator("jwt_secret")
    @classmethod
    def reject_weak_jwt_secret(cls, value: str) -> str:
        weak = {"dev-only-change-me", "change-me", "secret", "jwt-secret"}
        if value.strip().lower() in weak:
            raise ValueError("JWT_SECRET is too weak; use a long random secret")
        return value


def get_settings() -> Settings:
    return Settings()
