import json
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import AsyncMock

import pytest
from redis.exceptions import ConnectionError
from sqlalchemy.exc import IntegrityError

from educationos.config import Settings
from educationos.contracts import CreateEvidence
from educationos.errors import DomainError
from educationos.limits import RedisRateLimiter
from educationos.models import Tenant
from educationos.seed_demo import LEARNER_ID
from educationos.seed_demo import main as seed_main


async def test_public_curriculum_without_identity(client):
    response = await client.get("/api/v1/missions?age_band=10-12")
    assert response.status_code == 200
    missions = response.json()["items"]
    assert len(missions) == 1
    assert missions[0]["ageBand"] == "10-12"
    assert len(missions[0]["content"]["steps"]) == 7
    assert "adultGuidance" in missions[0]["content"]
    single = await client.get(f"/api/v1/missions/{missions[0]['id']}")
    assert single.json() == missions[0]
    assert response.headers["x-content-type-options"] == "nosniff"
    assert (await client.get("/health/live")).json()["mode"] == "synthetic-only"


async def test_readiness_reports_redis_dependency(client, fixture_app, monkeypatch):
    # Unit readiness must be independent of whether Redis happens to run locally or in CI.
    ping = AsyncMock(return_value=True)
    monkeypatch.setattr(fixture_app.state.redis, "ping", ping)
    assert (await client.get("/health/ready")).status_code == 200
    ping.assert_awaited_once()
    ping.side_effect = ConnectionError("Synthetic unavailable Redis fixture")
    assert (await client.get("/health/ready")).status_code == 503


async def test_live_capabilities_unconditionally_closed(client, auth):
    for route in ("/api/v1/auth/register", "/api/v1/ai/respond"):
        assert (await client.post(route, headers=auth, json={"enabled": True})).status_code == 503


async def test_body_contract_and_error_privacy(client, auth):
    payload = {"learnerId": str(LEARNER_ID), "missionVersionId": "personal-name@example.test"}
    response = await client.post("/api/v1/attempts", headers=auth, json=payload)
    assert response.status_code == 422
    assert "personal-name" not in response.text
    assert (await client.post("/api/v1/attempts", content="x" * 17000)).status_code == 413
    assert (
        await client.post("/api/v1/attempts", content="{}", headers={"Content-Type": "text/plain"})
    ).status_code == 415
    assert (await client.get("/api/v1/missions?age_band=unknown")).status_code == 422


async def test_real_tenant_rows_blocked_even_in_database(fixture_app):
    with pytest.raises(IntegrityError):
        async for session in fixture_app.state.database.session():
            session.add(Tenant(synthetic=False))
            await session.flush()


async def test_rate_limiter_fail_closed():
    class BrokenRedis:
        async def eval(self, *args):
            raise ConnectionError("no redis")

    with pytest.raises(DomainError) as caught:
        await RedisRateLimiter(BrokenRedis(), 1).check("opaque-hash")
    assert caught.value.status == 503

    class OverLimit:
        async def eval(self, *args):
            return 2

    with pytest.raises(DomainError) as caught:
        await RedisRateLimiter(OverLimit(), 1).check("opaque-hash")
    assert caught.value.status == 429


async def test_private_requests_use_rate_limiter(client, auth, fixture_app):
    class Deny:
        async def check(self, identity):
            raise DomainError(429, "RATE_LIMITED", "Try later")

    fixture_app.state.limiter = Deny()
    assert (await client.get("/api/v1/auth/session", headers=auth)).status_code == 429


def test_nonfinite_or_extra_evidence_rejected():
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        CreateEvidence(
            attemptId="e0500000-0000-4000-8000-000000000001",
            step="experiment",
            payload={
                "kind": "measurement",
                "label": "baseline",
                "value": float("nan"),
                "unit": "seconds",
            },
        )


def test_production_requires_explicit_secure_settings():
    with pytest.raises(ValueError):
        Settings(environment="production")


def test_staging_requires_managed_credentials_and_https_origins():
    with pytest.raises(ValueError):
        Settings(environment="staging")
    settings = Settings(
        environment="staging",
        database_url="postgresql+psycopg://educationos_app:generated-staging-secret@postgres.internal:5432/educationos_staging",
        redis_url="redis://default:generated-staging-secret@redis.internal:6379/0",
        allowed_origins=["https://app.educationos.space"],
    )
    assert settings.environment == "staging"


async def test_staging_keeps_curriculum_public_and_private_calls_closed(client, fixture_app, auth):
    fixture_app.state.settings.environment = "staging"
    assert (await client.get("/api/v1/missions?age_band=10-12")).status_code == 200
    response = await client.get(
        "/api/v1/attempts/00000000-0000-4000-8000-000000000001", headers=auth
    )
    assert response.status_code == 503


async def test_staging_refuses_synthetic_seed(monkeypatch):
    monkeypatch.setenv("EDUCATIONOS_ENVIRONMENT", "staging")
    monkeypatch.setenv(
        "EDUCATIONOS_DATABASE_URL",
        "postgresql+psycopg://educationos_app:generated-staging-secret@postgres.internal:5432/educationos_staging",
    )
    monkeypatch.setenv(
        "EDUCATIONOS_REDIS_URL", "redis://default:generated-staging-secret@redis.internal:6379/0"
    )
    monkeypatch.setenv("EDUCATIONOS_ALLOWED_ORIGINS", '["https://app.educationos.space"]')
    with pytest.raises(SystemExit, match="disabled in deployed environments"):
        await seed_main()


def test_exact_pins_backed_by_registry_evidence():
    evidence = json.loads((Path(__file__).parents[1] / "dependency-evidence.json").read_text())
    cutoff = datetime(2026, 10, 19, tzinfo=UTC)
    assert all(datetime.fromisoformat(p["upload_time"]) < cutoff for p in evidence.values())


def test_settings_errors_hide_credentials():
    with pytest.raises(ValueError) as caught:
        Settings(
            environment="production",
            database_url="postgresql+psycopg://u:injected-private-password@db/prod",
        )
    assert "injected-private-password" not in str(caught.value)


def test_bundled_curriculum_matches_reviewed_source(fixture_app):
    bundled = fixture_app.state.settings.curriculum_path.read_bytes()
    shared = Path(__file__).parents[2] / "shared/curriculum/missions.v1.json"
    assert bundled == shared.read_bytes()
