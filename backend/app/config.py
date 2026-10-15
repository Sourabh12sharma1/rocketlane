from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    database_url: str = "postgresql+psycopg://rocketlane:rocketlane@localhost:5432/rocketlane"
    jwt_secret: str = "dev-only-change-me"
    jwt_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:5173"
    otp_ttl_seconds: int = 300
    max_upload_bytes: int = 5 * 1024 * 1024


def get_settings() -> Settings:
    return Settings()
