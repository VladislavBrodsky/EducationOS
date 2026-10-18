from datetime import timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from educationos.auth import Principal, authorize_learner, now
from educationos.config import Settings
from educationos.contracts import STEPS, Attempt, CreateEvidence, Evidence, StartAttempt
from educationos.curriculum import Curriculum
from educationos.errors import DomainError, forbidden, not_found
from educationos.models import AttemptRow, EvidenceRow, MissionVersion


def invalid(message: str):
    return DomainError(422, "INVALID_INPUT", message)


class LearningService:
    def __init__(self, session: AsyncSession, curriculum: Curriculum, settings: Settings):
        self.session, self.curriculum, self.settings = session, curriculum, settings

    async def start(self, principal: Principal, data: StartAttempt) -> Attempt:
        learner = await authorize_learner(self.session, principal, data.learner_id)
        mission = self.curriculum.get(data.mission_version_id)
        if mission is None:
            raise not_found()
        if mission.age_band != learner.age_band:
            raise forbidden()
        stored = await self.session.get(MissionVersion, mission.id)
        digest = self.curriculum.version_digest(mission)
        if stored is None:
            raise DomainError(503, "UNAVAILABLE", "Curriculum must be provisioned before learning.")
        if stored.content_digest != digest:
            raise DomainError(503, "UNAVAILABLE", "Curriculum version verification failed.")
        attempt = AttemptRow(
            tenant_id=principal.tenant_id,
            learner_id=learner.id,
            mission_version_id=mission.id,
            status="active",
            created_at=now(),
        )
        self.session.add(attempt)
        await self.session.flush()
        return Attempt.model_validate(attempt)

    async def get_attempt(
        self, principal: Principal, attempt_id: UUID, *, lock=False
    ) -> AttemptRow:
        statement = select(AttemptRow).where(
            AttemptRow.id == attempt_id,
            AttemptRow.tenant_id == principal.tenant_id,
        )
        if lock:
            statement = statement.with_for_update()
        attempt = await self.session.scalar(statement)
        if attempt is None:
            raise not_found()
        await authorize_learner(self.session, principal, attempt.learner_id)
        return attempt

    async def add_evidence(self, principal: Principal, data: CreateEvidence) -> Evidence:
        attempt = await self.get_attempt(principal, data.attempt_id, lock=True)
        if attempt.status != "active":
            raise invalid("A completed attempt cannot accept new evidence.")
        # Free-form synthetic input is private and is never forwarded to any model/tool.
        row = EvidenceRow(
            tenant_id=principal.tenant_id,
            learner_id=attempt.learner_id,
            attempt_id=attempt.id,
            step=data.step,
            payload=data.payload.model_dump(),
            created_at=now(),
            retention_until=now() + timedelta(days=self.settings.evidence_retention_days),
        )
        self.session.add(row)
        await self.session.flush()
        return Evidence.model_validate(row)

    async def evidence(self, principal: Principal, learner_id: UUID) -> list[Evidence]:
        await authorize_learner(self.session, principal, learner_id)
        rows = await self.session.scalars(
            select(EvidenceRow)
            .where(
                EvidenceRow.tenant_id == principal.tenant_id,
                EvidenceRow.learner_id == learner_id,
                EvidenceRow.retention_until > now(),
            )
            .order_by(EvidenceRow.created_at)
            .limit(500)
        )
        return [Evidence.model_validate(row) for row in rows]

    async def delete_evidence(self, principal: Principal, evidence_id: UUID):
        row = await self.session.scalar(
            select(EvidenceRow)
            .where(
                EvidenceRow.id == evidence_id,
                EvidenceRow.tenant_id == principal.tenant_id,
            )
            .with_for_update()
        )
        if row is None:
            raise not_found()
        await authorize_learner(self.session, principal, row.learner_id)
        if principal.kind != "adult":
            raise forbidden()
        await self.session.delete(row)

    async def complete(self, principal: Principal, attempt_id: UUID) -> Attempt:
        attempt = await self.get_attempt(principal, attempt_id, lock=True)
        if attempt.status == "complete":
            return Attempt.model_validate(attempt)
        rows = list(
            await self.session.scalars(
                select(EvidenceRow).where(
                    EvidenceRow.tenant_id == principal.tenant_id,
                    EvidenceRow.attempt_id == attempt.id,
                    EvidenceRow.retention_until > now(),
                )
            )
        )
        if set(row.step for row in rows) != set(STEPS):
            raise invalid("Record evidence for each of the seven TRIZ steps before completion.")
        ideas = {
            row.payload.get("text", "").casefold()
            for row in rows
            if row.step == "imagine" and row.payload.get("kind") == "idea"
        }
        if len(ideas) < 2:
            raise invalid("Record two distinct alternatives for the imagine step.")
        measures = [
            r.payload
            for r in rows
            if r.step == "experiment" and r.payload.get("kind") == "measurement"
        ]
        labels = {
            m["label"].casefold()
            for m in measures
            if m["unit"] == "seconds" and 0 <= m["value"] <= 60
        }
        if not {"baseline", "redesign"}.issubset(labels):
            raise invalid("Record baseline and redesign measurements in seconds, capped at 60.")
        for step in ("hypothesis", "reflect", "transfer"):
            if not any(r.step == step and r.payload.get("text", "").strip() for r in rows):
                raise invalid(f"Record a written {step} before completion.")
        attempt.status = "complete"
        await self.session.flush()
        return Attempt.model_validate(attempt)
