"""Invite-only adult workspace authentication and consent-intent scaffolding.

This module never creates children, verifies identity, or grants legal consent.
Only a server operator can provision roles. Production access remains closed.
"""

import asyncio
import hashlib
import hmac
import re
import secrets
from collections.abc import AsyncIterator
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Annotated, Literal
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, ConfigDict, Field, SecretStr, StrictBool, field_validator
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    String,
    UniqueConstraint,
    Uuid,
    select,
    text,
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column
from starlette.concurrency import run_in_threadpool

from educationos.auth import as_utc, hash_token, new_token, now
from educationos.errors import DomainError, forbidden
from educationos.models import Base

COOKIE_NAME = "eos_adult"
SESSION_HOURS = 8
ROLES = ("educator", "reviewer", "guardian")
POLICY_VERSION = "scaffold-v1"
TOKEN_PATTERN = re.compile(r"[A-Za-z0-9_-]{43}")
EMAIL_PATTERN = re.compile(r"[^\s@<>]{1,128}@[^\s@<>.]+(?:\.[^\s@<>.]+)+", re.ASCII)


class AdultAccount(Base):
    __tablename__ = "adult_accounts"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(Uuid, index=True)
    # Login locator only: plaintext email and identity documents are not stored.
    email_hash: Mapped[str] = mapped_column(String(64), unique=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    role: Mapped[str] = mapped_column(String(16))
    adult_attested: Mapped[bool] = mapped_column(Boolean, default=True)
    identity_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (
        UniqueConstraint("tenant_id", "id"),
        CheckConstraint("role IN ('educator','reviewer','guardian')", name="adult_role"),
        CheckConstraint("adult_attested = true", name="adult_attestation_required"),
        CheckConstraint("identity_verified = false", name="identity_verification_closed"),
    )


class AdultAuthSession(Base):
    __tablename__ = "adult_auth_sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    account_id: Mapped[UUID] = mapped_column(ForeignKey("adult_accounts.id"), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class AdultConsent(Base):
    __tablename__ = "adult_consents"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(Uuid, index=True)
    account_id: Mapped[UUID] = mapped_column(ForeignKey("adult_accounts.id"), index=True)
    purpose: Mapped[str] = mapped_column(String(40), default="child_learning")
    policy_version: Mapped[str] = mapped_column(String(40), default=POLICY_VERSION)
    status: Mapped[str] = mapped_column(String(30), default="pending_verification")
    acknowledged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    __table_args__ = (
        ForeignKeyConstraint(
            ["tenant_id", "account_id"], ["adult_accounts.tenant_id", "adult_accounts.id"]
        ),
        CheckConstraint("purpose = 'child_learning'", name="adult_consent_purpose"),
        CheckConstraint("policy_version = 'scaffold-v1'", name="adult_consent_policy"),
        CheckConstraint(
            "status IN ('pending_verification','revoked')", name="adult_consent_never_verified"
        ),
    )


class AdultAudit(Base):
    __tablename__ = "adult_audit"
    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True, default=uuid4)
    tenant_id: Mapped[UUID] = mapped_column(Uuid, index=True)
    actor_id: Mapped[UUID] = mapped_column(ForeignKey("adult_accounts.id"))
    event: Mapped[str] = mapped_column(String(60))
    target_id: Mapped[UUID | None] = mapped_column(Uuid)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (
        ForeignKeyConstraint(
            ["tenant_id", "actor_id"], ["adult_accounts.tenant_id", "adult_accounts.id"]
        ),
    )


@dataclass(frozen=True)
class AdultPrincipal:
    id: UUID
    tenant_id: UUID
    role: str
    session_hash: str
    csrf_token: str = field(default="", repr=False)


def email_locator(email: str) -> str:
    return hashlib.sha256(email.strip().casefold().encode()).hexdigest()


def password_digest(password: str) -> str:
    """scrypt uses a fresh 16-byte salt and fixed work parameters, never client options."""
    if not 12 <= len(password) <= 128:
        raise ValueError("Password must contain 12 to 128 characters")
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=2**15, r=8, p=1, maxmem=64 << 20)
    return f"scrypt:{salt.hex()}:{digest.hex()}"


def password_matches(password: str, stored: str) -> bool:
    try:
        scheme, salt, expected = stored.split(":")
        if scheme != "scrypt" or len(salt) != 32 or len(expected) != 128:
            return False
        actual = hashlib.scrypt(
            password.encode(), salt=bytes.fromhex(salt), n=2**15, r=8, p=1, maxmem=64 << 20
        )
        return hmac.compare_digest(actual.hex(), expected)
    except (ValueError, TypeError):
        return False


def csrf_for_token(token: str) -> str:
    return hmac.new(token.encode(), b"educationos-adult-csrf-v1", hashlib.sha256).hexdigest()


def require_role(principal: AdultPrincipal, *roles: str) -> None:
    if principal.role not in roles:
        raise forbidden()


def unavailable_adults() -> DomainError:
    return DomainError(503, "ADULT_WORKSPACE_CLOSED", "Adult workspace is unavailable.")


def check_environment(request: Request) -> None:
    if request.app.state.settings.environment == "production":
        raise unavailable_adults()


async def adult_session(request: Request) -> AsyncIterator[AsyncSession]:
    async for session in request.app.state.database.session():
        yield session


AdultSession = Annotated[AsyncSession, Depends(adult_session, scope="function")]
Session = AdultSession


async def adult_principal(request: Request, session: AdultSession) -> AdultPrincipal:
    check_environment(request)
    invalid = DomainError(401, "UNAUTHENTICATED", "Adult authentication is required.")
    authorization = request.headers.get("Authorization", "")
    bearer = authorization.startswith("Bearer ")
    token = authorization[7:] if bearer else request.cookies.get(COOKIE_NAME)
    if token is None or not TOKEN_PATTERN.fullmatch(token):
        raise invalid
    query = select(AdultAuthSession).where(AdultAuthSession.token_hash == hash_token(token))
    if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        query = query.with_for_update()
    stored = await session.scalar(query)
    if stored is None or stored.revoked_at is not None or as_utc(stored.expires_at) <= now():
        raise invalid
    account = await session.get(AdultAccount, stored.account_id)
    if (
        account is None
        or not account.active
        or not account.adult_attested
        or account.role not in ROLES
    ):
        raise invalid
    if session.bind.dialect.name == "postgresql":
        await session.execute(
            text("SELECT set_config('app.tenant_id', :tenant, true)"),
            {"tenant": str(account.tenant_id)},
        )
    await request.app.state.limiter.check("adult:" + stored.token_hash)
    csrf = csrf_for_token(token)
    if not bearer and request.method in {"POST", "PUT", "PATCH", "DELETE"}:
        supplied_csrf = request.headers.get("X-CSRF-Token", "")
        if not re.fullmatch(r"[a-f0-9]{64}", supplied_csrf) or not hmac.compare_digest(
            supplied_csrf, csrf
        ):
            raise DomainError(403, "CSRF_REQUIRED", "Refresh your adult session and try again.")
    return AdultPrincipal(account.id, account.tenant_id, account.role, stored.token_hash, csrf)


Adult = Annotated[AdultPrincipal, Depends(adult_principal)]


class AdultInput(BaseModel):
    model_config = ConfigDict(extra="forbid", hide_input_in_errors=True)


class LoginInput(AdultInput):
    email: str = Field(min_length=3, max_length=254)
    password: SecretStr = Field(min_length=12, max_length=128)

    @field_validator("email")
    @classmethod
    def valid_email(cls, value: str) -> str:
        if not EMAIL_PATTERN.fullmatch(value.strip()) or not value.isascii():
            raise ValueError("Invalid adult login identifier")
        return value.strip().casefold()


class ConsentInput(AdultInput):
    purpose: Literal["child_learning"]
    policyVersion: Literal["scaffold-v1"]
    acknowledged: StrictBool

    @field_validator("acknowledged")
    @classmethod
    def explicit_acknowledgement(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("Explicit acknowledgement is required")
        return value


class AdultView(AdultInput):
    id: UUID
    role: Literal["educator", "reviewer", "guardian"]
    adultAttested: Literal[True] = True
    identityVerified: Literal[False] = False


class SessionView(AdultInput):
    adult: AdultView
    csrfToken: str


class ConsentView(AdultInput):
    id: UUID
    purpose: Literal["child_learning"]
    policyVersion: Literal["scaffold-v1"]
    status: Literal["pending_verification", "revoked"]
    acknowledgedAt: datetime
    revokedAt: datetime | None
    childProfilesAvailable: Literal[False] = False


class ConsentList(AdultInput):
    items: list[ConsentView]


class LogoutView(AdultInput):
    signedOut: Literal[True] = True


def session_info(principal: AdultPrincipal) -> dict:
    return {
        "adult": {
            "id": str(principal.id),
            "role": principal.role,
            "adultAttested": True,
            "identityVerified": False,
        },
        "csrfToken": principal.csrf_token,
    }


def consent_info(row: AdultConsent) -> dict:
    return {
        "id": str(row.id),
        "purpose": row.purpose,
        "policyVersion": row.policy_version,
        "status": row.status,
        "acknowledgedAt": as_utc(row.acknowledged_at).isoformat(),
        "revokedAt": as_utc(row.revoked_at).isoformat() if row.revoked_at else None,
        "childProfilesAvailable": False,
    }


def audit(session: AsyncSession, principal: AdultPrincipal, event: str, target: UUID | None = None):
    session.add(
        AdultAudit(
            tenant_id=principal.tenant_id,
            actor_id=principal.id,
            event=event,
            target_id=target,
        )
    )


router = APIRouter(prefix="/api/v1/adults", tags=["adult-workspace"])


@router.post("/login", operation_id="adult_login", response_model=SessionView)
async def login(data: LoginInput, request: Request, response: Response, session: AdultSession):
    check_environment(request)
    origin = request.headers.get("origin")
    if origin and origin not in request.app.state.settings.allowed_origins:
        raise forbidden()
    # Protect password work by client address and account locator; never trust X-Forwarded-For.
    host = request.client.host if request.client else "unknown"
    await request.app.state.limiter.check("adult-login-ip:" + hash_token(host))
    await request.app.state.limiter.check("adult-login-account:" + email_locator(data.email))
    account = await session.scalar(
        select(AdultAccount).where(AdultAccount.email_hash == email_locator(data.email))
    )
    # A fixed valid dummy record keeps unknown-account password work equivalent.
    dummy = "scrypt:" + "00" * 16 + ":" + "00" * 64
    # At most two memory-hard password jobs (~64 MiB total) per application process.
    # Fail fast instead of accumulating a queue behind the threadpool's larger default limit.
    slots = getattr(request.app.state, "adult_password_slots", None)
    if slots is None:
        slots = request.app.state.adult_password_slots = asyncio.Semaphore(2)
    if slots.locked():
        raise DomainError(503, "AUTH_BUSY", "Adult sign-in is busy. Please try again shortly.")
    async with slots:
        valid = await run_in_threadpool(
            password_matches,
            data.password.get_secret_value(),
            account.password_hash if account else dummy,
        )
    if not valid or account is None or not account.active or not account.adult_attested:
        raise DomainError(401, "UNAUTHENTICATED", "Adult sign-in could not be completed.")
    token = new_token()
    stored = AdultAuthSession(
        token_hash=hash_token(token), account_id=account.id, expires_at=now() + timedelta(hours=8)
    )
    session.add(stored)
    if session.bind.dialect.name == "postgresql":
        await session.execute(
            text("SELECT set_config('app.tenant_id', :tenant, true)"),
            {"tenant": str(account.tenant_id)},
        )
    principal = AdultPrincipal(
        account.id, account.tenant_id, account.role, stored.token_hash, csrf_for_token(token)
    )
    audit(session, principal, "adult.session.created")
    await session.flush()
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=SESSION_HOURS * 3600,
        httponly=True,
        secure=request.app.state.settings.environment not in {"development", "test"},
        samesite="strict",
        path="/",
    )
    return session_info(principal)


@router.get("/session", operation_id="adult_session", response_model=SessionView)
async def get_session(principal: Adult):
    return session_info(principal)


@router.post("/logout", operation_id="adult_logout", response_model=LogoutView)
async def logout(principal: Adult, session: AdultSession, response: Response):
    stored = await session.get(AdultAuthSession, principal.session_hash)
    stored.revoked_at = now()
    audit(session, principal, "adult.session.revoked")
    response.delete_cookie(COOKIE_NAME, path="/", samesite="strict")
    return {"signedOut": True}


@router.get("/consents", operation_id="adult_list_consents", response_model=ConsentList)
async def consents(principal: Adult, session: AdultSession):
    require_role(principal, "guardian")
    rows = await session.scalars(
        select(AdultConsent)
        .where(
            AdultConsent.account_id == principal.id, AdultConsent.tenant_id == principal.tenant_id
        )
        .order_by(AdultConsent.acknowledged_at.desc())
        .limit(100)
    )
    return {"items": [consent_info(row) for row in rows]}


@router.post(
    "/consents",
    status_code=201,
    operation_id="adult_acknowledge_consent",
    response_model=ConsentView,
)
async def acknowledge(data: ConsentInput, principal: Adult, session: AdultSession):
    require_role(principal, "guardian")
    # Serialize acknowledgements without granting account UPDATE privileges to the API role.
    # Transaction-scoped locks release automatically after commit or rollback.
    if session.bind.dialect.name == "postgresql":
        await session.execute(
            text("SELECT pg_advisory_xact_lock(:lock_id)"),
            {"lock_id": int.from_bytes(principal.id.bytes[:8], signed=True)},
        )
    row = await session.scalar(
        select(AdultConsent).where(
            AdultConsent.account_id == principal.id,
            AdultConsent.tenant_id == principal.tenant_id,
            AdultConsent.status == "pending_verification",
        )
    )
    if row is None:
        row = AdultConsent(
            tenant_id=principal.tenant_id,
            account_id=principal.id,
            purpose=data.purpose,
            policy_version=data.policyVersion,
        )
        session.add(row)
        await session.flush()
        audit(session, principal, "consent.intent.acknowledged", row.id)
    return consent_info(row)


@router.delete(
    "/consents/{consent_id}", operation_id="adult_revoke_consent", response_model=ConsentView
)
async def revoke(consent_id: UUID, principal: Adult, session: AdultSession):
    require_role(principal, "guardian")
    row = await session.scalar(
        select(AdultConsent)
        .where(
            AdultConsent.id == consent_id,
            AdultConsent.tenant_id == principal.tenant_id,
            AdultConsent.account_id == principal.id,
        )
        .with_for_update()
    )
    if row is None:
        raise forbidden()
    if row.revoked_at is None:
        row.status, row.revoked_at = "revoked", now()
        audit(session, principal, "consent.intent.revoked", row.id)
    return consent_info(row)


@router.post("/child-profiles", status_code=503, operation_id="child_profiles_closed")
async def child_profiles(principal: Adult):
    raise DomainError(
        503,
        "CHILD_PROFILES_CLOSED",
        "Child profiles require legal, identity, consent, "
        "and security verification before activation.",
    )
