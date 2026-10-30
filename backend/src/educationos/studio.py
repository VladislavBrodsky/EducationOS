"""Adult curriculum authoring with required human review and heuristic moderation."""

import re
from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Request
from pydantic import Field, StrictBool, StringConstraints, field_validator, model_validator
from sqlalchemy import (
    JSON,
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    String,
    UniqueConstraint,
    select,
    update,
)
from sqlalchemy.orm import Mapped, mapped_column

from educationos.adult import AdultPrincipal, AdultSession, adult_principal, check_environment
from educationos.auth import now
from educationos.contracts import AgeBand, Contract
from educationos.errors import DomainError, forbidden, not_found
from educationos.models import Base

router = APIRouter(tags=["adult-curriculum-studio"])
Adult = Annotated[AdultPrincipal, Depends(adult_principal)]
Status = Literal["draft", "review", "published"]


class StudioMission(Base):
    __tablename__ = "studio_missions"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(index=True)
    author_id: Mapped[UUID] = mapped_column(ForeignKey("adult_accounts.id"))
    content: Mapped[dict] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(12), default="draft")
    version: Mapped[int] = mapped_column(default=1)
    published_version: Mapped[int | None]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    __table_args__ = (
        CheckConstraint("status IN ('draft','review','published')", name="studio_status"),
        CheckConstraint("version >= 1", name="studio_version_positive"),
        CheckConstraint(
            "published_version IS NULL OR "
            "(published_version >= 1 AND published_version <= version)",
            name="studio_published_version",
        ),
        UniqueConstraint("tenant_id", "id"),
        ForeignKeyConstraint(
            ["tenant_id", "author_id"], ["adult_accounts.tenant_id", "adult_accounts.id"]
        ),
    )


class StudioRevision(Base):
    __tablename__ = "studio_revisions"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    mission_id: Mapped[UUID] = mapped_column(ForeignKey("studio_missions.id"))
    version: Mapped[int]
    status: Mapped[str] = mapped_column(String(12))
    content: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    __table_args__ = (
        UniqueConstraint("mission_id", "version"),
        CheckConstraint("status IN ('draft','review','published')", name="studio_revision_status"),
        CheckConstraint("version >= 1", name="studio_revision_version_positive"),
    )


class StudioAudit(Base):
    __tablename__ = "studio_audit"
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    mission_id: Mapped[UUID] = mapped_column(ForeignKey("studio_missions.id"))
    actor_id: Mapped[UUID] = mapped_column(ForeignKey("adult_accounts.id"))
    action: Mapped[str] = mapped_column(String(20))
    version: Mapped[int]
    note: Mapped[str | None] = mapped_column(String(600))
    moderation_flags: Mapped[list] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    __table_args__ = (
        Index("studio_audit_mission_version", "mission_id", "version"),
        CheckConstraint("action IN ('created','edited','submitted','approved','rejected')"),
    )


# Do not accept active markup, contact details, or requests for personal data in curriculum.
CONTACT = re.compile(
    r"https?://|www\.|[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}|"
    r"(?:\+?\d[ .()-]*){9,}|"
    r"\b(?:your (?:full name|phone number|email|home address|date of birth)|"
    r"(?:send|upload|share) (?:me |us )?(?:your |a )?(?:photo|selfie)|"
    r"contact me|dm me|direct message)\b",
    re.IGNORECASE,
)


def plain_text(value: str) -> str:
    if re.search(
        r"[<>\x00-\x08\x0b\x0c\x0e-\x1f\x7f\U0001f000-\U0001faff\u2600-\u27bf]", value
    ) or CONTACT.search(value):
        raise ValueError("Use plain educational text without contact or personal data")
    return value


StepText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=5, max_length=220)]


class StageContent(Contract):
    age_band: AgeBand
    challenge: str = Field(min_length=10, max_length=500)
    # Ordered notice, contradiction, imagine, hypothesis, experiment, reflect, transfer.
    steps: list[StepText] = Field(min_length=7, max_length=7)
    safety_note: str = Field(min_length=10, max_length=300)

    @field_validator("challenge", "safety_note")
    @classmethod
    def safe_text(cls, value: str):
        return plain_text(value)

    @field_validator("steps")
    @classmethod
    def safe_steps(cls, values: list[str]):
        return [plain_text(value) for value in values]


class MissionInput(Contract):
    title: str = Field(min_length=3, max_length=120)
    summary: str = Field(min_length=10, max_length=600)
    triz_principle: str = Field(min_length=3, max_length=180)
    stages: list[StageContent] = Field(min_length=5, max_length=5)

    @field_validator("title", "summary", "triz_principle")
    @classmethod
    def safe_text(cls, value: str):
        return plain_text(value)

    @model_validator(mode="after")
    def all_age_stages(self):
        if {stage.age_band for stage in self.stages} != set(AgeBand):
            raise ValueError("Provide each of the five age stages exactly once")
        return self


class MissionUpdate(MissionInput):
    expected_version: int = Field(ge=1, strict=True)


class VersionInput(Contract):
    expected_version: int = Field(ge=1, strict=True)


class ReviewInput(VersionInput):
    decision: Literal["approve", "reject"]
    note: str = Field(min_length=10, max_length=600)
    safety_reviewed: StrictBool = False

    @field_validator("note")
    @classmethod
    def safe_text(cls, value: str):
        return plain_text(value)


class MissionOutput(MissionInput):
    id: UUID
    status: Status
    version: int
    author_id: UUID
    moderation_flags: list[str]
    created_at: datetime
    updated_at: datetime


class MissionList(Contract):
    items: list[MissionOutput]


class RevisionOutput(Contract):
    version: int
    status: Status
    content: MissionInput
    created_at: datetime


class AuditOutput(Contract):
    id: UUID
    action: str
    actor_id: UUID
    version: int
    note: str | None
    moderation_flags: list[str]
    created_at: datetime


class HistoryOutput(Contract):
    versions: list[RevisionOutput]
    events: list[AuditOutput]


class PublicMission(MissionInput):
    id: UUID
    version: int
    published_at: datetime


class PublicMissionList(Contract):
    items: list[PublicMission]


# These intentionally conservative flags assist reviewers. Absence is not evidence of safety.
MODERATION_RULES = {
    "sharp_tools": r"\b(?:knife|knives|razor|saw|sharp blade)\b",
    "hazardous_materials": r"\b(?:bleach|acid|solvent|explosive|gunpowder|toxic|poison)\b",
    "open_flame": r"\b(?:open flame|burner|light a fire|matches|boiling water)\b",
    "unsafe_electricity": r"\b(?:mains|wall outlet|high voltage|electrical socket)\b",
    "unsafe_behavior": r"\b(?:choke|choking|suffocate|self.harm|climb (?:a |the )?roof)\b",
    "external_contact": r"\b(?:meet a stranger|private chat|secret from (?:your )?parents)\b",
}


def moderation_flags(content: dict) -> list[str]:
    data = MissionInput.model_validate(content)
    parts = [data.title, data.summary, data.triz_principle]
    for stage in data.stages:
        parts.extend([stage.challenge, stage.safety_note, *stage.steps])
    text = "\n".join(parts)
    return [name for name, pattern in MODERATION_RULES.items() if re.search(pattern, text, re.I)]


def mission_output(row: StudioMission) -> MissionOutput:
    return MissionOutput(
        **row.content,
        id=row.id,
        status=row.status,
        version=row.version,
        author_id=row.author_id,
        moderation_flags=moderation_flags(row.content),
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def permitted(principal: AdultPrincipal, roles: set[str]):
    if principal.role not in roles:
        raise forbidden()


async def scoped_mission(session: AdultSession, principal: AdultPrincipal, mission_id: UUID):
    permitted(principal, {"educator", "reviewer"})
    row = await session.scalar(
        select(StudioMission).where(
            StudioMission.id == mission_id, StudioMission.tenant_id == principal.tenant_id
        )
    )
    if row is None:
        raise not_found()
    return row


def conflict():
    return DomainError(409, "VERSION_CONFLICT", "The mission changed. Reload before continuing.")


async def record(
    session: AdultSession,
    row: StudioMission,
    principal: AdultPrincipal,
    action: str,
    note: str | None = None,
):
    session.add(
        StudioRevision(
            mission_id=row.id,
            version=row.version,
            status=row.status,
            content=row.content,
            created_at=row.updated_at,
        )
    )
    session.add(
        StudioAudit(
            mission_id=row.id,
            actor_id=principal.id,
            action=action,
            version=row.version,
            note=note,
            moderation_flags=moderation_flags(row.content),
            created_at=row.updated_at,
        )
    )
    await session.flush()


async def advance(
    session: AdultSession,
    row: StudioMission,
    principal: AdultPrincipal,
    expected: int,
    status: Status,
    action: str,
    content: dict | None = None,
    note: str | None = None,
):
    if row.version != expected:
        raise conflict()
    changes = {"version": expected + 1, "status": status, "updated_at": now()}
    if content is not None:
        changes["content"] = content
    if status == "published":
        changes["published_version"] = expected + 1
    changed = await session.execute(
        update(StudioMission)
        .where(
            StudioMission.id == row.id,
            StudioMission.tenant_id == principal.tenant_id,
            StudioMission.version == expected,
            StudioMission.status == row.status,
        )
        .values(**changes)
        .execution_options(synchronize_session=False)
    )
    if changed.rowcount != 1:
        raise conflict()
    await session.refresh(row)
    await record(session, row, principal, action, note)
    return mission_output(row)


@router.get("/api/v1/studio/missions", response_model=MissionList)
async def list_missions(principal: Adult, session: AdultSession):
    permitted(principal, {"educator", "reviewer"})
    rows = await session.scalars(
        select(StudioMission)
        .where(StudioMission.tenant_id == principal.tenant_id)
        .order_by(StudioMission.updated_at.desc(), StudioMission.id)
        .limit(100)
    )
    return MissionList(items=[mission_output(row) for row in rows])


@router.post("/api/v1/studio/missions", response_model=MissionOutput, status_code=201)
async def create_mission(data: MissionInput, principal: Adult, session: AdultSession):
    permitted(principal, {"educator"})
    timestamp = now()
    row = StudioMission(
        id=uuid4(),
        tenant_id=principal.tenant_id,
        author_id=principal.id,
        content=data.model_dump(mode="json", by_alias=True),
        status="draft",
        version=1,
        published_version=None,
        created_at=timestamp,
        updated_at=timestamp,
    )
    session.add(row)
    await session.flush()
    await record(session, row, principal, "created")
    return mission_output(row)


@router.get("/api/v1/studio/missions/{mission_id}", response_model=MissionOutput)
async def get_mission(mission_id: UUID, principal: Adult, session: AdultSession):
    return mission_output(await scoped_mission(session, principal, mission_id))


@router.patch("/api/v1/studio/missions/{mission_id}", response_model=MissionOutput)
async def edit_mission(
    mission_id: UUID, data: MissionUpdate, principal: Adult, session: AdultSession
):
    permitted(principal, {"educator"})
    row = await scoped_mission(session, principal, mission_id)
    if row.author_id != principal.id:
        raise forbidden()
    if row.status == "review":
        raise DomainError(409, "IN_REVIEW", "Content under review cannot be edited.")
    content = MissionInput.model_validate(data.model_dump(exclude={"expected_version"}))
    return await advance(
        session,
        row,
        principal,
        data.expected_version,
        "draft",
        "edited",
        content.model_dump(mode="json", by_alias=True),
    )


@router.post("/api/v1/studio/missions/{mission_id}/submit", response_model=MissionOutput)
async def submit_mission(
    mission_id: UUID, data: VersionInput, principal: Adult, session: AdultSession
):
    permitted(principal, {"educator"})
    row = await scoped_mission(session, principal, mission_id)
    if row.author_id != principal.id:
        raise forbidden()
    if row.status != "draft":
        raise DomainError(409, "INVALID_TRANSITION", "Only drafts can be submitted for review.")
    return await advance(session, row, principal, data.expected_version, "review", "submitted")


@router.post("/api/v1/studio/missions/{mission_id}/review", response_model=MissionOutput)
async def review_mission(
    mission_id: UUID, data: ReviewInput, principal: Adult, session: AdultSession
):
    permitted(principal, {"reviewer"})
    row = await scoped_mission(session, principal, mission_id)
    if row.author_id == principal.id:
        raise forbidden()
    if row.version != data.expected_version:
        raise conflict()
    if row.status != "review":
        raise DomainError(409, "INVALID_TRANSITION", "Only submitted revisions can be reviewed.")
    if data.decision == "approve" and not data.safety_reviewed:
        raise DomainError(422, "SAFETY_REVIEW_REQUIRED", "Acknowledge review of every age stage.")
    if data.decision == "approve" and moderation_flags(row.content):
        raise DomainError(
            422, "MODERATION_REQUIRED", "Resolve all moderation flags before publication."
        )
    return await advance(
        session,
        row,
        principal,
        data.expected_version,
        "published" if data.decision == "approve" else "draft",
        "approved" if data.decision == "approve" else "rejected",
        note=data.note,
    )


@router.get("/api/v1/studio/missions/{mission_id}/history", response_model=HistoryOutput)
async def mission_history(mission_id: UUID, principal: Adult, session: AdultSession):
    row = await scoped_mission(session, principal, mission_id)
    versions = await session.scalars(
        select(StudioRevision)
        .where(StudioRevision.mission_id == row.id)
        .order_by(StudioRevision.version)
        .limit(500)
    )
    events = await session.scalars(
        select(StudioAudit)
        .where(StudioAudit.mission_id == row.id)
        .order_by(StudioAudit.version)
        .limit(500)
    )
    return HistoryOutput(
        versions=[RevisionOutput.model_validate(item) for item in versions],
        events=[AuditOutput.model_validate(item) for item in events],
    )


@router.get("/api/v1/curriculum/published", response_model=PublicMissionList)
async def published_missions(request: Request, session: AdultSession):
    check_environment(request)
    rows = await session.execute(
        select(StudioMission.id, StudioRevision)
        .join(
            StudioRevision,
            (StudioRevision.mission_id == StudioMission.id)
            & (StudioRevision.version == StudioMission.published_version)
            & (StudioRevision.status == "published"),
        )
        .order_by(StudioRevision.created_at.desc(), StudioMission.id)
        .limit(100)
    )
    return PublicMissionList(
        items=[
            PublicMission(
                **revision.content,
                id=mission_id,
                version=revision.version,
                published_at=revision.created_at,
            )
            for mission_id, revision in rows
        ]
    )
