import asyncio
from datetime import timedelta
from uuid import uuid4

import pytest
from sqlalchemy import select

from educationos import adult
from educationos.adult import (
    AdultAccount,
    AdultAudit,
    AdultAuthSession,
    AdultConsent,
    email_locator,
    password_digest,
    password_matches,
)
from educationos.auth import now

PASSWORD = "local-test-password-060"
PASSWORD_HASH = password_digest(PASSWORD)


async def make_account(app, role="guardian", email="guardian@example.test", tenant_id=None):
    async for session in app.state.database.session():
        account = AdultAccount(
            tenant_id=tenant_id or uuid4(),
            email_hash=email_locator(email),
            password_hash=PASSWORD_HASH,
            role=role,
            adult_attested=True,
            identity_verified=False,
        )
        session.add(account)
        await session.flush()
        result = account.id, account.tenant_id
    return result


@pytest.fixture
async def guardian(fixture_app):
    return await make_account(fixture_app)


async def sign_in(client, email="guardian@example.test"):
    response = await client.post(
        "/api/v1/adults/login", json={"email": email, "password": PASSWORD}
    )
    assert response.status_code == 200, response.text
    return {"X-CSRF-Token": response.json()["csrfToken"]}


def test_password_hash_uses_salt_and_constant_work():
    digest = password_digest(PASSWORD)
    assert digest != PASSWORD_HASH
    assert password_matches(PASSWORD, digest)
    assert not password_matches("wrong-local-password", digest)
    assert not password_matches(PASSWORD, "corrupt")


async def test_login_session_cookie_is_private_and_contains_no_identity(client, guardian):
    response = await client.post(
        "/api/v1/adults/login", json={"email": "GUARDIAN@example.test", "password": PASSWORD}
    )
    assert response.status_code == 200
    assert "httponly" in response.headers["set-cookie"].lower()
    assert "samesite=strict" in response.headers["set-cookie"].lower()
    assert "Path=/" in response.headers["set-cookie"]
    body = response.json()
    assert body["adult"] == {
        "id": str(guardian[0]),
        "role": "guardian",
        "adultAttested": True,
        "identityVerified": False,
    }
    assert "email" not in response.text and PASSWORD not in response.text
    assert len(body["csrfToken"]) == 64
    session = await client.get("/api/v1/adults/session")
    assert session.json() == body


async def test_credentials_and_client_role_cannot_grant_access(client, guardian):
    for email in ("guardian@example.test", "missing@example.test"):
        response = await client.post(
            "/api/v1/adults/login", json={"email": email, "password": "incorrect-password"}
        )
        assert response.status_code == 401
        assert response.json()["error"]["message"] == "Adult sign-in could not be completed."
    response = await client.post(
        "/api/v1/adults/login",
        json={"email": "guardian@example.test", "password": PASSWORD, "role": "reviewer"},
    )
    assert response.status_code == 422
    assert (await client.get("/api/v1/adults/session")).status_code == 401
    assert (await client.post("/api/v1/adults/register", json={})).status_code == 404


async def test_login_refuses_foreign_origin(client, guardian):
    response = await client.post(
        "/api/v1/adults/login",
        json={"email": "guardian@example.test", "password": PASSWORD},
        headers={"Origin": "https://attacker.example"},
    )
    assert response.status_code == 403


async def test_csrf_required_on_cookie_writes_and_token_is_bound(client, guardian):
    csrf = await sign_in(client)
    payload = {"purpose": "child_learning", "policyVersion": "scaffold-v1", "acknowledged": True}
    for headers in ({}, {"X-CSRF-Token": "0" * 64}):
        response = await client.post("/api/v1/adults/consents", json=payload, headers=headers)
        assert response.status_code == 403
        assert response.json()["error"]["code"] == "CSRF_REQUIRED"
    assert (
        await client.post("/api/v1/adults/consents", json=payload, headers=csrf)
    ).status_code == 201


async def test_guardian_acknowledgement_never_enables_child_profiles(client, fixture_app, guardian):
    csrf = await sign_in(client)
    payload = {"purpose": "child_learning", "policyVersion": "scaffold-v1", "acknowledged": True}
    first = await client.post("/api/v1/adults/consents", json=payload, headers=csrf)
    assert first.status_code == 201
    item = first.json()
    assert item["status"] == "pending_verification"
    assert item["childProfilesAvailable"] is False
    repeated = await client.post("/api/v1/adults/consents", json=payload, headers=csrf)
    assert repeated.json()["id"] == item["id"]
    listed = await client.get("/api/v1/adults/consents")
    assert len(listed.json()["items"]) == 1
    child = await client.post("/api/v1/adults/child-profiles", json={}, headers=csrf)
    assert child.status_code == 503
    assert child.json()["error"]["code"] == "CHILD_PROFILES_CLOSED"
    revoked = await client.delete(f"/api/v1/adults/consents/{item['id']}", headers=csrf)
    assert revoked.status_code == 200
    assert revoked.json()["status"] == "revoked"
    assert revoked.json()["revokedAt"] is not None
    async for session in fixture_app.state.database.session():
        records = list(await session.scalars(select(AdultAudit)))
        assert {record.event for record in records} >= {
            "adult.session.created",
            "consent.intent.acknowledged",
            "consent.intent.revoked",
        }
        assert len(list(await session.scalars(select(AdultConsent)))) == 1


@pytest.mark.parametrize("acknowledged", [False, 1, "true", None])
async def test_consent_requires_explicit_boolean_and_policy(client, guardian, acknowledged):
    csrf = await sign_in(client)
    response = await client.post(
        "/api/v1/adults/consents",
        json={
            "purpose": "child_learning",
            "policyVersion": "scaffold-v1",
            "acknowledged": acknowledged,
        },
        headers=csrf,
    )
    assert response.status_code == 422


async def test_consent_rejects_child_data_and_unknown_policy(client, guardian):
    csrf = await sign_in(client)
    for change in ({"policyVersion": "future"}, {"childName": "private"}):
        response = await client.post(
            "/api/v1/adults/consents",
            json={
                "purpose": "child_learning",
                "policyVersion": "scaffold-v1",
                "acknowledged": True,
                **change,
            },
            headers=csrf,
        )
        assert response.status_code == 422
        assert "private" not in response.text


async def test_consent_is_scoped_to_own_guardian_even_in_same_tenant(client, fixture_app, guardian):
    csrf = await sign_in(client)
    created = await client.post(
        "/api/v1/adults/consents",
        json={"purpose": "child_learning", "policyVersion": "scaffold-v1", "acknowledged": True},
        headers=csrf,
    )
    await make_account(fixture_app, email="second@example.test", tenant_id=guardian[1])
    other_csrf = await sign_in(client, "second@example.test")
    assert (await client.get("/api/v1/adults/consents")).json()["items"] == []
    assert (
        await client.delete(f"/api/v1/adults/consents/{created.json()['id']}", headers=other_csrf)
    ).status_code == 403


async def test_role_is_read_from_server_and_guardian_operations_deny_educator(
    client, fixture_app, guardian
):
    await sign_in(client)
    async for session in fixture_app.state.database.session():
        account = await session.get(AdultAccount, guardian[0])
        account.role = "educator"
    assert (await client.get("/api/v1/adults/session")).json()["adult"]["role"] == "educator"
    assert (await client.get("/api/v1/adults/consents")).status_code == 403


async def test_logout_revokes_session_against_replay(client, guardian):
    csrf = await sign_in(client)
    token = client.cookies[adult.COOKIE_NAME]
    assert (await client.post("/api/v1/adults/logout", headers=csrf)).status_code == 200
    replay = await client.get(
        "/api/v1/adults/session", headers={"Authorization": f"Bearer {token}"}
    )
    assert replay.status_code == 401


async def test_disabled_account_and_expired_session_fail_closed(client, fixture_app, guardian):
    await sign_in(client)
    async for session in fixture_app.state.database.session():
        account = await session.get(AdultAccount, guardian[0])
        account.active = False
    assert (await client.get("/api/v1/adults/session")).status_code == 401
    async for session in fixture_app.state.database.session():
        account = await session.get(AdultAccount, guardian[0])
        account.active = True
        stored = await session.scalar(select(AdultAuthSession))
        stored.expires_at = now() - timedelta(seconds=1)
    assert (await client.get("/api/v1/adults/session")).status_code == 401


async def test_production_adult_workspace_remains_closed(client, fixture_app, guardian):
    await sign_in(client)
    fixture_app.state.settings.environment = "production"
    assert (await client.get("/api/v1/adults/session")).status_code == 503
    response = await client.post(
        "/api/v1/adults/login", json={"email": "guardian@example.test", "password": PASSWORD}
    )
    assert response.status_code == 503


async def test_password_work_has_a_fail_fast_concurrency_budget(client, fixture_app, guardian):
    fixture_app.state.adult_password_slots = asyncio.Semaphore(0)
    response = await client.post(
        "/api/v1/adults/login", json={"email": "guardian@example.test", "password": PASSWORD}
    )
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "AUTH_BUSY"
    async for session in fixture_app.state.database.session():
        assert list(await session.scalars(select(AdultAuthSession))) == []


async def test_rate_protection_failure_prevents_session_issuance(client, fixture_app, guardian):
    class FailedProtection:
        async def check(self, identity):
            from educationos.errors import DomainError

            raise DomainError(503, "UNAVAILABLE", "Request protection is unavailable.")

    fixture_app.state.limiter = FailedProtection()
    response = await client.post(
        "/api/v1/adults/login", json={"email": "guardian@example.test", "password": PASSWORD}
    )
    assert response.status_code == 503
    async for session in fixture_app.state.database.session():
        assert list(await session.scalars(select(AdultAuthSession))) == []
