import json
from datetime import UTC, datetime
from pathlib import Path

import pytest
from redis.exceptions import ConnectionError
from sqlalchemy.exc import IntegrityError

from educationos.config import Settings
from educationos.contracts import CreateEvidence
from educationos.errors import DomainError
from educationos.limits import RedisRateLimiter
from educationos.models import Tenant
from educationos.seed_demo import LEARNER_ID


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
