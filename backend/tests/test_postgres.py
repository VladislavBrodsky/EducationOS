"""Real PostgreSQL/RLS/pgvector/worker checks against an explicitly disposable test DB."""

import asyncio
import os
import subprocess
from datetime import timedelta
from pathlib import Path
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import select, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import DBAPIError

from educationos.auth import now
from educationos.config import Settings
from educationos.curriculum import Curriculum
from educationos.database import Database
from educationos.main import create_app
from educationos.models import EvidenceRow
from educationos.seed_demo import LEARNER_ID, TENANT_ID, provision
from educationos.worker import run_once

ADMIN = os.getenv("EDUCATIONOS_TEST_DATABASE_URL")
APP = os.getenv("EDUCATIONOS_TEST_APP_DATABASE_URL")
WORKER = os.getenv("EDUCATIONOS_TEST_WORKER_DATABASE_URL")
pytestmark = pytest.mark.skipif(
    not (ADMIN and APP and WORKER), reason="Disposable PostgreSQL URLs not provided"
)
ROOT = Path(__file__).resolve().parents[1]


def migrate(target):
    env = {**os.environ, "EDUCATIONOS_DATABASE_URL": ADMIN, "EDUCATIONOS_ENVIRONMENT": "test"}
    command = "downgrade" if target == "base" else "upgrade"
    result = subprocess.run(
        [str(ROOT / ".venv/bin/alembic"), command, target],
        cwd=ROOT,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )
    # Error output may contain local DSNs; do not print it into CI logs.
    assert result.returncode == 0, "PostgreSQL migration failed"


async def test_postgres_runtime_tenant_rls_immutability_and_worker():
    assert make_url(ADMIN).database.endswith("_test"), "Only disposable *_test DBs may be migrated"
    assert make_url(APP).database == make_url(ADMIN).database
    assert make_url(WORKER).database == make_url(ADMIN).database
    await asyncio.to_thread(migrate, "head")
    admin = Database(Settings(environment="test", database_url=ADMIN))
    runtime = Database(Settings(environment="test", database_url=APP))
    worker = Database(Settings(environment="test", database_url=WORKER))
    curriculum = Curriculum(Settings().curriculum_path)
    try:
        async for session in admin.session():
            token = await provision(session, curriculum)
        async for session in runtime.session():
            role = (
                await session.execute(
                    text("SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname=current_user")
                )
            ).one()
            assert role == (False, False)
            assert list(await session.scalars(select(EvidenceRow.id))) == []
            assert list(await session.execute(text("SELECT id FROM learners"))) == []
        # Exercise DB auth, transaction-local tenant context, and live Redis limits.
        app = create_app(
            Settings(
                environment="test",
                database_url=APP,
                redis_url=os.getenv("EDUCATIONOS_TEST_REDIS_URL", "redis://localhost:6379/0"),
            )
        )
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://test"
        ) as client:
            headers = {"Authorization": f"Bearer {token}"}
            response = await client.post(
                "/api/v1/attempts",
                headers=headers,
                json={
                    "learnerId": str(LEARNER_ID),
                    "missionVersionId": str(curriculum.list()[2].id),
                },
            )
            assert response.status_code == 201, response.text
            attempt_id = response.json()["id"]
            # Synthetic UUID used for private fixture; responses do not reveal tenant data.
            response = await client.post(
                "/api/v1/evidence",
                headers=headers,
                json={
                    "attemptId": attempt_id,
                    "step": "notice",
                    "payload": {"kind": "observation", "text": "Synthetic persistence fixture"},
                },
            )
            assert response.status_code == 201
            live_evidence_id = response.json()["id"]
            assert (await client.get("/health/ready")).status_code == 200
        await app.state.database.close()
        await app.state.redis.aclose()
        async for session in admin.session():
            live = await session.get(EvidenceRow, __import__("uuid").UUID(live_evidence_id))
            expired_id = uuid4()
            session.add(
                EvidenceRow(
                    id=expired_id,
                    tenant_id=TENANT_ID,
                    learner_id=LEARNER_ID,
                    attempt_id=live.attempt_id,
                    step="notice",
                    payload={"kind": "idea", "text": "Expired synthetic"},
                    created_at=now() - timedelta(days=31),
                    retention_until=now() - timedelta(seconds=1),
                )
            )
        async for session in runtime.session():
            await session.execute(
                text("SELECT set_config('app.tenant_id', :tenant, true)"), {"tenant": str(uuid4())}
            )
            assert list(await session.scalars(select(EvidenceRow.id))) == []
        with pytest.raises(DBAPIError):
            async for session in runtime.session():
                await session.execute(
                    text("UPDATE mission_versions SET content_digest = 'changed'")
                )
        with pytest.raises(DBAPIError):
            async for session in admin.session():
                await session.execute(
                    text("UPDATE mission_versions SET content_digest = 'changed'")
                )
        with pytest.raises(DBAPIError):
            async for session in worker.session():
                await session.execute(text("SELECT payload FROM evidence"))
        async for session in worker.session():
            role = (
                await session.execute(
                    text("SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname=current_user")
                )
            ).one()
            assert role == (False, False)
            assert (
                len(list(await session.execute(text("SELECT retention_until FROM evidence")))) == 1
            )
        await run_once(worker, curriculum)
        async for session in admin.session():
            assert await session.get(EvidenceRow, expired_id) is None
            assert (
                await session.get(EvidenceRow, __import__("uuid").UUID(live_evidence_id))
                is not None
            )
            assert await session.scalar(text("SELECT count(*) FROM curated_chunks")) >= 35
            assert (
                await session.scalar(
                    text("SELECT count(*) FROM async_jobs WHERE status='complete'")
                )
                >= 2
            )
        # Rollback rehearsal: migration owns only this disposable schema.
        await asyncio.to_thread(migrate, "base")
        await asyncio.to_thread(migrate, "head")
    finally:
        await admin.close()
        await runtime.close()
        await worker.close()
