"""Bounded durable maintenance jobs; no arbitrary task payloads or learner AI input."""

import argparse
import asyncio
import logging
from uuid import uuid4

from sqlalchemy import delete, select, text

from educationos.ai.retrieval import chunks
from educationos.auth import now
from educationos.config import Settings
from educationos.curriculum import Curriculum
from educationos.database import Database
from educationos.models import AsyncJob, CuratedChunk, EvidenceRow


async def execute_job(session, job: AsyncJob, curriculum: Curriculum):
    if job.kind == "purge_expired_evidence":
        await session.execute(
            delete(EvidenceRow)
            .where(EvidenceRow.retention_until <= now())
            .execution_options(synchronize_session=False)
        )
    elif job.kind == "index_curated_curriculum":
        for chunk in chunks(curriculum):
            exists = await session.scalar(
                select(CuratedChunk.id).where(
                    CuratedChunk.source_uri == chunk.source_uri,
                    CuratedChunk.source_digest == chunk.source_digest,
                    CuratedChunk.ordinal == chunk.ordinal,
                )
            )
            if exists is None:
                session.add(
                    CuratedChunk(
                        id=uuid4(),
                        source_uri=chunk.source_uri,
                        source_digest=chunk.source_digest,
                        ordinal=chunk.ordinal,
                        content=chunk.text,
                    )
                )
    else:
        raise ValueError("Job kind is not allowlisted")
    job.status, job.completed_at = "complete", now()


async def enqueue(database: Database):
    # Queue state commits before execution. Crash during execution leaves pending
    # work intact. The advisory lock serializes periodic producers on PostgreSQL.
    async for session in database.session():
        if session.bind.dialect.name == "postgresql":
            locked = await session.scalar(text("SELECT pg_try_advisory_xact_lock(606060)"))
            if not locked:
                return
        for kind in ("purge_expired_evidence", "index_curated_curriculum"):
            pending = await session.scalar(
                select(AsyncJob.id)
                .where(
                    AsyncJob.kind == kind,
                    AsyncJob.status == "pending",
                )
                .limit(1)
            )
            if pending is None:
                session.add(AsyncJob(kind=kind, created_at=now(), status="pending"))


async def run_once(database: Database, curriculum: Curriculum):
    await enqueue(database)
    for _ in range(5):
        job_id = None
        try:
            async for session in database.session():
                job = await session.scalar(
                    select(AsyncJob)
                    .where(
                        AsyncJob.status == "pending",
                    )
                    .order_by(AsyncJob.created_at)
                    .with_for_update(skip_locked=True)
                    .limit(1)
                )
                if job is None:
                    return
                job_id = job.id
                await execute_job(session, job, curriculum)
        except Exception:
            # Rollback completes before recording failure; never persist exception text.
            if job_id:
                async for session in database.session():
                    job = await session.get(AsyncJob, job_id, with_for_update=True)
                    if job and job.status == "pending":
                        job.status, job.completed_at = "failed", now()
            raise


async def main(once=False):
    settings = Settings()
    database = Database(settings)
    curriculum = Curriculum(settings.curriculum_path)
    try:
        while True:
            try:
                await run_once(database, curriculum)
            except Exception:
                if once:
                    raise
                logging.getLogger("educationos").error("worker.cycle_failed")
            if once:
                break
            # Bounded retry cadence. Failed work is a new periodic run, never an
            # unbounded immediate retry; SKIP LOCKED permits multiple consumers.
            await asyncio.sleep(300)
    finally:
        await database.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--once", action="store_true")
    asyncio.run(main(parser.parse_args().once))
