from pathlib import Path
from typing import Literal
from urllib.parse import urlsplit

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="EDUCATIONOS_", extra="ignore", hide_input_in_errors=True
    )

    environment: Literal["development", "test", "staging", "production"] = "development"
    database_url: str = "postgresql+psycopg://educationos:educationos@localhost:5432/educationos"
    redis_url: str = "redis://localhost:6379/0"
    allowed_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    curriculum_path: Path = Path(__file__).resolve().parent / "data/missions.v1.json"
    rate_limit_per_minute: int = Field(60, ge=1, le=10000)
    evidence_retention_days: int = Field(30, ge=1, le=90)
    otlp_endpoint: str | None = None
    # Synthetic accounts are development fixtures only; no live onboarding or provider keys exist.

    @model_validator(mode="after")
    def enforce_deployed_environment(self):
        if self.environment in {"staging", "production"}:
            if not self.database_url.startswith("postgresql+psycopg://"):
                raise ValueError("Deployed environments require PostgreSQL with psycopg")
            database = make_url(self.database_url)
            if self.environment == "production" and database.query.get("sslmode") != "verify-full":
                raise ValueError("Production database requires verified TLS")
            if not database.password or database.password in {
                "educationos",
                "educationos-local-only",
                "educationos-app-local-only",
                "educationos-worker-local-only",
            }:
                raise ValueError("Deployed environments require managed database credentials")
            redis = urlsplit(self.redis_url)
            if redis.scheme not in {"redis", "rediss"} or not redis.password or not redis.hostname:
                raise ValueError("Deployed environments require authenticated Redis")
            if self.environment == "production" and redis.scheme != "rediss":
                raise ValueError("Production Redis requires authenticated TLS")
            if not self.allowed_origins:
                raise ValueError("Deployed environments require explicit frontend origins")
            for origin in self.allowed_origins:
                parsed = urlsplit(origin)
                if (
                    parsed.scheme != "https"
                    or not parsed.hostname
                    or parsed.username
                    or parsed.password
                    or parsed.path
                    or parsed.query
                    or parsed.fragment
                ):
                    raise ValueError("Deployed environments require exact HTTPS origins")
        return self
