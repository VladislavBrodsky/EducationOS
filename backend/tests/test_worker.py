from datetime import timedelta
from uuid import uuid4

from sqlalchemy import select

from educationos.auth import now
from educationos.models import AsyncJob, AttemptRow, CuratedChunk, EvidenceRow
from educationos.seed_demo import LEARNER_ID, TENANT_ID
from educationos.worker import run_once


async def test_maintenance_indexes_public_sources_and_only_expires_old_evidence(fixture_app):
    database, curriculum = fixture_app.state.database, fixture_app.state.curriculum
    async for session in database.session():
        attempt = AttemptRow(
            tenant_id=TENANT_ID,
            learner_id=LEARNER_ID,
            mission_version_id=curriculum.list()[2].id,
            status="active",
            created_at=now(),
        )
        session.add(attempt)
        await session.flush()
        old, live = uuid4(), uuid4()
        for identifier, expiry in (
            (old, now() - timedelta(seconds=1)),
            (live, now() + timedelta(days=1)),
        ):
            session.add(
                EvidenceRow(
                    id=identifier,
                    tenant_id=TENANT_ID,
                    learner_id=LEARNER_ID,
                    attempt_id=attempt.id,
                    step="notice",
                    payload={"kind": "idea", "text": "Synthetic fixture"},
                    created_at=now(),
                    retention_until=expiry,
                )
            )
    await run_once(database, curriculum)
    async for session in database.session():
        assert await session.get(EvidenceRow, old) is None
        assert await session.get(EvidenceRow, live) is not None
        indexed = list(await session.scalars(select(CuratedChunk)))
        assert len(indexed) >= 35
        assert all(chunk.source_uri.startswith("curriculum://") for chunk in indexed)
        count = len(indexed)
        assert all(job.status == "complete" for job in await session.scalars(select(AsyncJob)))
    await run_once(database, curriculum)
    async for session in database.session():
        assert len(list(await session.scalars(select(CuratedChunk)))) == count
