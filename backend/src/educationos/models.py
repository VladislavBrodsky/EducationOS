"""Persistence layer. Every private operation must scope by tenant and learner."""

from datetime import datetime
from uuid import UUID, uuid4

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    String,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Tenant(Base):
    __tablename__ = "tenants"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    synthetic: Mapped[bool] = mapped_column(Boolean, default=True)
    __table_args__ = (CheckConstraint("synthetic = true", name="tenant_synthetic_only"),)


class Learner(Base):
    __tablename__ = "learners"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), index=True)
    age_band: Mapped[str] = mapped_column(String(8))
    synthetic: Mapped[bool] = mapped_column(Boolean, default=True)
    __table_args__ = (
        UniqueConstraint("tenant_id", "id"),
        CheckConstraint("synthetic = true", name="learner_synthetic_only"),
    )


class GuardianGrant(Base):
    __tablename__ = "guardian_grants"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), index=True)
    account_id: Mapped[UUID] = mapped_column(Uuid)
    learner_id: Mapped[UUID] = mapped_column(ForeignKey("learners.id"))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    __table_args__ = (
        UniqueConstraint("tenant_id", "account_id", "learner_id"),
        ForeignKeyConstraint(["tenant_id", "learner_id"], ["learners.tenant_id", "learners.id"]),
    )


class Consent(Base):
    __tablename__ = "consents"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), index=True)
    learner_id: Mapped[UUID] = mapped_column(ForeignKey("learners.id"))
    purpose: Mapped[str] = mapped_column(String(40), default="synthetic_learning")
    policy_version: Mapped[str] = mapped_column(String(40), default="synthetic-v1")
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    __table_args__ = (
        ForeignKeyConstraint(["tenant_id", "learner_id"], ["learners.tenant_id", "learners.id"]),
    )


class AuthSession(Base):
    __tablename__ = "auth_sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), index=True)
    principal_kind: Mapped[str] = mapped_column(String(12))
    subject_id: Mapped[UUID] = mapped_column(Uuid)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    __table_args__ = (CheckConstraint("principal_kind IN ('adult','learner')"),)


class MissionVersion(Base):
    __tablename__ = "mission_versions"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True)
    mission_id: Mapped[UUID] = mapped_column(Uuid)
    version: Mapped[int]
    content_digest: Mapped[str] = mapped_column(String(64))
    content: Mapped[dict] = mapped_column(JSON)
    __table_args__ = (UniqueConstraint("mission_id", "version"),)


class AttemptRow(Base):
    __tablename__ = "attempts"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), index=True)
    learner_id: Mapped[UUID] = mapped_column(ForeignKey("learners.id"), index=True)
    mission_version_id: Mapped[UUID] = mapped_column(ForeignKey("mission_versions.id"))
    status: Mapped[str] = mapped_column(String(12), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    __table_args__ = (
        CheckConstraint("status IN ('active','complete')"),
        UniqueConstraint("tenant_id", "learner_id", "id"),
        ForeignKeyConstraint(["tenant_id", "learner_id"], ["learners.tenant_id", "learners.id"]),
    )


class EvidenceRow(Base):
    __tablename__ = "evidence"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(ForeignKey("tenants.id"), index=True)
    learner_id: Mapped[UUID] = mapped_column(ForeignKey("learners.id"), index=True)
    attempt_id: Mapped[UUID] = mapped_column(ForeignKey("attempts.id", ondelete="CASCADE"))
    step: Mapped[str] = mapped_column(String(20))
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    retention_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)

    __table_args__ = (
        ForeignKeyConstraint(
            ["tenant_id", "learner_id", "attempt_id"],
            ["attempts.tenant_id", "attempts.learner_id", "attempts.id"],
            ondelete="CASCADE",
        ),
    )


class CuratedChunk(Base):
    """No learner content. Provider embeddings remain offline until evaluation approval."""

    __tablename__ = "curated_chunks"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    source_uri: Mapped[str] = mapped_column(String(300))
    source_digest: Mapped[str] = mapped_column(String(64))
    ordinal: Mapped[int]
    content: Mapped[str] = mapped_column(String(1600))
    embedding_model: Mapped[str | None] = mapped_column(String(100))
    embedding: Mapped[list | None] = mapped_column(Vector(384).with_variant(JSON, "sqlite"))
    __table_args__ = (UniqueConstraint("source_uri", "source_digest", "ordinal"),)


class AsyncJob(Base):
    __tablename__ = "async_jobs"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    kind: Mapped[str] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    __table_args__ = (
        CheckConstraint("kind IN ('purge_expired_evidence','index_curated_curriculum')"),
        CheckConstraint("status IN ('pending','complete','failed')"),
        Index("jobs_pending", "status", "created_at"),
    )
