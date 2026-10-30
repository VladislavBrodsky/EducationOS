"""Migrated PostgreSQL studio/auth integration with the restricted runtime DB role.

Only disposable *_test databases supplied through the explicit test URLs may be used.
Run sequentially after test_postgres.py: both files exercise the same disposable schema.
"""

import asyncio
import os
from uuid import UUID, uuid4

import httpx
import pytest
from alembic.autogenerate import compare_metadata
from alembic.migration import MigrationContext
from sqlalchemy import select, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import DBAPIError

from educationos.adult import AdultAccount, AdultAudit, AdultConsent, email_locator, password_digest
from educationos.config import Settings
from educationos.database import Database
from educationos.main import create_app
from educationos.models import Base
from educationos.studio import StudioAudit, StudioRevision
from tests.test_postgres import migrate
from tests.test_studio import mission_data

ADMIN = os.getenv("EDUCATIONOS_TEST_DATABASE_URL")
APP = os.getenv("EDUCATIONOS_TEST_APP_DATABASE_URL")
pytestmark = pytest.mark.skipif(
    not (ADMIN and APP), reason="Disposable PostgreSQL admin and runtime URLs not provided"
)


async def login(client, email, password):
    response = await client.post(
        "/api/v1/adults/login", json={"email": email, "password": password}
    )
    assert response.status_code == 200, response.text
    token = response.cookies.get("eos_adult")
    assert token and "httponly" in response.headers["set-cookie"].lower()
    return {"Authorization": f"Bearer {token}"}


async def test_postgres_studio_auth_concurrency_immutability_and_schema():
    assert make_url(ADMIN).database.endswith("_test"), "Disposable *_test database required"
    assert make_url(APP).database == make_url(ADMIN).database
    await asyncio.to_thread(migrate, "head")
    admin = Database(Settings(environment="test", database_url=ADMIN))
    app = create_app(
        Settings(
            environment="test",
            database_url=APP,
            redis_url=os.getenv("EDUCATIONOS_TEST_REDIS_URL", "redis://localhost:6379/0"),
            # Still uses real Redis protection; allow this intentional multi-session test batch.
            rate_limit_per_minute=300,
        )
    )
    password = "synthetic-fixture-password-2026"
    tenant = uuid4()
    accounts = {}
    for name, role, account_tenant in (
        ("author", "educator", tenant),
        ("reviewer_one", "reviewer", tenant),
        ("reviewer_two", "reviewer", tenant),
        ("guardian", "guardian", tenant),
        ("outsider", "educator", uuid4()),
        ("other_guardian", "guardian", uuid4()),
    ):
        account_id = uuid4()
        accounts[name] = {
            "id": account_id,
            "email": f"studio-{account_id}@example.test",
            "role": role,
            "tenant": account_tenant,
        }
    try:
        async for session in admin.session():
            for account in accounts.values():
                session.add(
                    AdultAccount(
                        id=account["id"],
                        tenant_id=account["tenant"],
                        email_hash=email_locator(account["email"]),
                        password_hash=password_digest(password),
                        role=account["role"],
                        adult_attested=True,
                        identity_verified=False,
                    )
                )
        async for session in app.state.database.session():
            restricted = (
                await session.execute(
                    text("SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname=current_user")
                )
            ).one()
            assert restricted == (False, False)
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            headers = {
                name: await login(client, account["email"], password)
                for name, account in accounts.items()
            }
            headers["author_second"] = await login(client, accounts["author"]["email"], password)
            headers["guardian_second"] = await login(
                client, accounts["guardian"]["email"], password
            )
            response = await client.post(
                "/api/v1/studio/missions", headers=headers["author"], json=mission_data()
            )
            assert response.status_code == 201, response.text
            row = response.json()
            mission_id = UUID(row["id"])
            url = f"/api/v1/studio/missions/{row['id']}"
            assert (await client.get(url, headers=headers["outsider"])).status_code == 404
            assert (await client.get(url, headers=headers["guardian"])).status_code == 403
            assert (
                await client.get(url + "/history", headers=headers["outsider"])
            ).status_code == 404
            # Independent requests read the same version. PostgreSQL compare-and-swap permits
            # exactly one update and one revision/audit record even under concurrent submission.
            edits = await asyncio.gather(
                *(
                    client.patch(
                        url,
                        headers=headers[name],
                        json={**mission_data(f"Paper bridge revision {i}"), "expectedVersion": 1},
                    )
                    for i, name in ((1, "author"), (2, "author_second"))
                )
            )
            assert sorted(item.status_code for item in edits) == [200, 409]
            edited = next(item.json() for item in edits if item.status_code == 200)
            assert edited["version"] == 2
            submitted = await client.post(
                url + "/submit", headers=headers["author"], json={"expectedVersion": 2}
            )
            assert submitted.status_code == 200 and submitted.json()["version"] == 3
            review = {
                "expectedVersion": 3,
                "decision": "approve",
                "safetyReviewed": True,
                "note": "Reviewed all five age stages and their supervised paper activities.",
            }
            approvals = await asyncio.gather(
                *(
                    client.post(url + "/review", headers=headers[name], json=review)
                    for name in ("reviewer_one", "reviewer_two")
                )
            )
            assert sorted(item.status_code for item in approvals) == [200, 409]
            published = next(item.json() for item in approvals if item.status_code == 200)
            assert published["version"] == 4 and published["status"] == "published"
            public = (await client.get("/api/v1/curriculum/published")).json()["items"]
            public = next(item for item in public if item["id"] == row["id"])
            assert public["version"] == 4 and "authorId" not in public
            fork = await client.patch(
                url,
                headers=headers["author"],
                json={**mission_data("Next draft remains private"), "expectedVersion": 4},
            )
            assert fork.status_code == 200 and fork.json()["version"] == 5
            current_public = (await client.get("/api/v1/curriculum/published")).json()["items"]
            assert next(item for item in current_public if item["id"] == row["id"]) == public
            history = (await client.get(url + "/history", headers=headers["reviewer_one"])).json()
            assert [v["version"] for v in history["versions"]] == [1, 2, 3, 4, 5]
            assert len(history["events"]) == 5
            assert [e["action"] for e in history["events"]] == [
                "created",
                "edited",
                "submitted",
                "approved",
                "edited",
            ]
            # Consent intent is explicitly unverified and never creates a learner.
            consent_results = await asyncio.gather(
                *(
                    client.post(
                        "/api/v1/adults/consents",
                        headers=headers[name],
                        json={
                            "purpose": "child_learning",
                            "policyVersion": "scaffold-v1",
                            "acknowledged": True,
                        },
                    )
                    for name in ("guardian", "guardian_second")
                )
            )
            assert [result.status_code for result in consent_results] == [201, 201]
            assert consent_results[0].json()["id"] == consent_results[1].json()["id"]
            consent = consent_results[0]
            assert consent.json()["status"] == "pending_verification"
            assert consent.json()["childProfilesAvailable"] is False
            consent_url = f"/api/v1/adults/consents/{consent.json()['id']}"
            assert (
                await client.delete(consent_url, headers=headers["other_guardian"])
            ).status_code == 403
            revoked = await client.delete(consent_url, headers=headers["guardian"])
            assert revoked.status_code == 200 and revoked.json()["status"] == "revoked"
            child = await client.post(
                "/api/v1/adults/child-profiles", headers=headers["guardian"], json={}
            )
            assert child.status_code == 503
        async for session in admin.session():
            revisions = list(
                await session.scalars(
                    select(StudioRevision).where(StudioRevision.mission_id == mission_id)
                )
            )
            audit = list(
                await session.scalars(
                    select(StudioAudit).where(StudioAudit.mission_id == mission_id)
                )
            )
            assert len(revisions) == len(audit) == 5
            guardian_id = accounts["guardian"]["id"]
            consent_rows = list(
                await session.scalars(
                    select(AdultConsent).where(AdultConsent.account_id == guardian_id)
                )
            )
            consent_events = list(
                await session.scalars(
                    select(AdultAudit).where(
                        AdultAudit.actor_id == guardian_id,
                        AdultAudit.event == "consent.intent.acknowledged",
                    )
                )
            )
            assert len(consent_rows) == len(consent_events) == 1
            assert consent_rows[0].status == "revoked"
        # Restricted runtime lacks update/delete privileges; owner is additionally protected
        # by immutable-history triggers. An owner could deliberately remove a trigger only
        # through separate privileged database administration, outside the runtime app.
        for database in (app.state.database, admin):
            for table in ("studio_revisions", "studio_audit"):
                for mutation in (
                    f"UPDATE {table} SET version=version WHERE mission_id=:mission",
                    f"DELETE FROM {table} WHERE mission_id=:mission",
                ):
                    with pytest.raises(DBAPIError):
                        async for session in database.session():
                            await session.execute(text(mutation), {"mission": mission_id})
        # Detect model/migration drift rather than assuming the migration matches create_all.
        async with admin.engine.connect() as connection:
            differences = await connection.run_sync(
                lambda conn: compare_metadata(
                    MigrationContext.configure(conn, opts={"compare_type": True}), Base.metadata
                )
            )
            assert differences == [], "PostgreSQL schema differs from the SQLAlchemy models"
    finally:
        await app.state.database.close()
        await app.state.redis.aclose()
        await admin.close()
