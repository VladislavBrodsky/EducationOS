import hashlib
import re
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from educationos.errors import DomainError, forbidden
from educationos.models import AuthSession, Consent, GuardianGrant, Learner, Tenant


@dataclass(frozen=True)
class Principal:
    tenant_id: UUID
    subject_id: UUID
    kind: str
    token_hash: str


def now() -> datetime:
    return datetime.now(UTC)


def as_utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def new_token() -> str:
    return secrets.token_urlsafe(32)


async def authenticate(session: AsyncSession, token: str | None) -> Principal:
    invalid = DomainError(401, "UNAUTHENTICATED", "Authentication is required.")
    if token is None or not re.fullmatch(r"[A-Za-z0-9_-]{43}", token):
        raise invalid
    stored = await session.get(AuthSession, hash_token(token))
    if stored is None or stored.revoked_at is not None or as_utc(stored.expires_at) <= now():
        raise invalid
    tenant = await session.get(Tenant, stored.tenant_id)
    if tenant is None or not tenant.synthetic or stored.principal_kind not in {"adult", "learner"}:
        raise invalid
    return Principal(stored.tenant_id, stored.subject_id, stored.principal_kind, stored.token_hash)


async def authorize_learner(
    session: AsyncSession, principal: Principal, learner_id: UUID
) -> Learner:
    learner = await session.scalar(
        select(Learner).where(
            Learner.id == learner_id,
            Learner.tenant_id == principal.tenant_id,
            Learner.synthetic.is_(True),
        )
    )
    if learner is None:
        raise forbidden()
    if principal.kind == "learner":
        if principal.subject_id != learner_id:
            raise forbidden()
    else:
        grant = await session.scalar(
            select(GuardianGrant).where(
                GuardianGrant.tenant_id == principal.tenant_id,
                GuardianGrant.account_id == principal.subject_id,
                GuardianGrant.learner_id == learner_id,
                GuardianGrant.revoked_at.is_(None),
            )
        )
        if grant is None:
            raise forbidden()
    consent = await session.scalar(
        select(Consent).where(
            Consent.tenant_id == principal.tenant_id,
            Consent.learner_id == learner_id,
            Consent.purpose == "synthetic_learning",
            Consent.policy_version == "synthetic-v1",
            Consent.granted_at <= now(),
            Consent.expires_at > now(),
            Consent.revoked_at.is_(None),
        )
    )
    if consent is None:
        raise forbidden()
    return learner
