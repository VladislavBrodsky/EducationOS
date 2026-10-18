from datetime import timedelta
from uuid import uuid4

import pytest
from sqlalchemy import select

from educationos.auth import hash_token, now
from educationos.models import AuthSession, Consent, EvidenceRow, GuardianGrant, MissionVersion
from educationos.seed_demo import LEARNER_ID
from tests.conftest import add_other_tenant

MISSION = "e0500000-0000-4000-8000-000000000003"


async def start(client, auth, learner=LEARNER_ID):
    return await client.post(
        "/api/v1/attempts",
        headers=auth,
        json={"learnerId": str(learner), "missionVersionId": MISSION},
    )


async def add(client, auth, attempt, step, payload):
    return await client.post(
        "/api/v1/evidence",
        headers=auth,
        json={"attemptId": attempt, "step": step, "payload": payload},
    )


@pytest.mark.parametrize("token", [None, "bad", "A" * 43])
async def test_unauthenticated_cannot_start(client, token):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    response = await start(client, headers)
    assert response.status_code == 401
    assert "Bearer" in response.headers["www-authenticate"]


async def test_persisted_version_pinned_attempt_and_evidence(client, auth, fixture_app):
    response = await start(client, auth)
    assert response.status_code == 201, response.text
    attempt = response.json()
    assert attempt["missionVersionId"] == MISSION
    assert attempt["learnerId"] == str(LEARNER_ID)
    response = await add(
        client, auth, attempt["id"], "notice", {"kind": "observation", "text": "Demo paper bends."}
    )
    assert response.status_code == 201, response.text
    stored = response.json()
    assert stored["retentionUntil"] > stored["createdAt"]
    evidence = await client.get(f"/api/v1/learners/{LEARNER_ID}/evidence", headers=auth)
    assert evidence.json()["items"][0]["id"] == stored["id"]
    fresh = await client.get(f"/api/v1/attempts/{attempt['id']}", headers=auth)
    assert fresh.json() == attempt


async def test_cross_tenant_and_guardian_enumeration_denied(client, auth, fixture_app):
    token, learner = await add_other_tenant(fixture_app)
    assert (await start(client, auth, learner)).status_code == 403
    assert (
        await client.get(f"/api/v1/learners/{learner}/evidence", headers=auth)
    ).status_code == 403
    other_auth = {"Authorization": f"Bearer {token}"}
    attempt = (await start(client, other_auth, learner)).json()
    assert (await client.get(f"/api/v1/attempts/{attempt['id']}", headers=auth)).status_code == 404
    assert (
        await add(client, auth, attempt["id"], "notice", {"kind": "idea", "text": "Demo"})
    ).status_code == 404
    assert (
        await client.post(f"/api/v1/attempts/{attempt['id']}/complete", headers=auth)
    ).status_code == 404


@pytest.mark.parametrize("entity", ["consent", "guardian", "session"])
async def test_revocation_checked_every_request(client, auth, fixture_app, entity):
    attempt = (await start(client, auth)).json()
    async for session in fixture_app.state.database.session():
        if entity == "consent":
            row = await session.scalar(select(Consent).where(Consent.learner_id == LEARNER_ID))
        elif entity == "guardian":
            row = await session.scalar(
                select(GuardianGrant).where(GuardianGrant.learner_id == LEARNER_ID)
            )
        else:
            row = await session.get(AuthSession, hash_token(fixture_app.state.test_token))
        row.revoked_at = now()
    result = await client.get(f"/api/v1/attempts/{attempt['id']}", headers=auth)
    assert result.status_code == (401 if entity == "session" else 403)


async def test_expired_session_and_consent(client, auth, fixture_app):
    async for session in fixture_app.state.database.session():
        consent = await session.scalar(select(Consent).where(Consent.learner_id == LEARNER_ID))
        consent.expires_at = now() - timedelta(seconds=1)
    assert (await start(client, auth)).status_code == 403
    async for session in fixture_app.state.database.session():
        row = await session.get(AuthSession, hash_token(fixture_app.state.test_token))
        row.expires_at = now() - timedelta(seconds=1)
    assert (await start(client, auth)).status_code == 401


async def test_wrong_age_band_denied(client, auth):
    result = await client.post(
        "/api/v1/attempts",
        headers=auth,
        json={"learnerId": str(LEARNER_ID), "missionVersionId": MISSION[:-1] + "1"},
    )
    assert result.status_code == 403


async def test_changed_published_content_fail_closed(client, auth, fixture_app):
    async for session in fixture_app.state.database.session():
        row = await session.get(MissionVersion, __import__("uuid").UUID(MISSION))
        row.content_digest = "0" * 64
    assert (await start(client, auth)).status_code == 503


async def test_completion_requires_real_structure_and_freezes_attempt(client, auth):
    attempt = (await start(client, auth)).json()["id"]
    path = f"/api/v1/attempts/{attempt}/complete"
    assert (await client.post(path, headers=auth)).status_code == 422
    for step in (
        "notice",
        "contradiction",
        "imagine",
        "hypothesis",
        "experiment",
        "reflect",
        "transfer",
    ):
        result = await add(
            client, auth, attempt, step, {"kind": "idea", "text": f"Synthetic {step} evidence"}
        )
        assert result.status_code == 201
    assert (await client.post(path, headers=auth)).status_code == 422  # one alternative
    await add(client, auth, attempt, "imagine", {"kind": "idea", "text": "A second folded design"})
    assert (await client.post(path, headers=auth)).status_code == 422  # no measurements
    for label, value in (("baseline", 12), ("redesign", 45)):
        result = await add(
            client,
            auth,
            attempt,
            "experiment",
            {"kind": "measurement", "label": label, "value": value, "unit": "seconds"},
        )
        assert result.status_code == 201
    response = await client.post(path, headers=auth)
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "complete"
    assert (await client.post(path, headers=auth)).json() == response.json()  # idempotent
    assert (
        await add(client, auth, attempt, "notice", {"kind": "idea", "text": "Late"})
    ).status_code == 422


async def test_expired_evidence_hidden_and_deletion_is_private(client, auth, fixture_app):
    attempt = (await start(client, auth)).json()["id"]
    item = (
        await add(client, auth, attempt, "notice", {"kind": "observation", "text": "Demo"})
    ).json()
    async for session in fixture_app.state.database.session():
        row = await session.get(EvidenceRow, __import__("uuid").UUID(item["id"]))
        row.retention_until = now() - timedelta(seconds=1)
    result = await client.get(f"/api/v1/learners/{LEARNER_ID}/evidence", headers=auth)
    assert result.json() == {"items": []}
    assert (await client.delete(f"/api/v1/evidence/{item['id']}", headers=auth)).status_code == 200
    assert (await client.delete(f"/api/v1/evidence/{item['id']}", headers=auth)).status_code == 404


async def test_learner_token_cannot_cross_learner_or_delete(client, fixture_app):
    token = "L" * 43
    async for session in fixture_app.state.database.session():
        session.add(
            AuthSession(
                token_hash=hash_token(token),
                tenant_id=fixture_app.state.test_tenant,
                principal_kind="learner",
                subject_id=LEARNER_ID,
                expires_at=now() + timedelta(hours=1),
            )
        )
    headers = {"Authorization": f"Bearer {token}"}
    attempt = (await start(client, headers)).json()["id"]
    item = (await add(client, headers, attempt, "notice", {"kind": "idea", "text": "Demo"})).json()
    assert (
        await client.delete(f"/api/v1/evidence/{item['id']}", headers=headers)
    ).status_code == 403
    assert (await start(client, headers, uuid4())).status_code == 403
