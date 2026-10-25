import logging
import time
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis.asyncio import Redis
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from educationos import __version__
from educationos.auth import Principal, authenticate
from educationos.cache import PublicCatalogCache
from educationos.config import Settings
from educationos.contracts import (
    AgeBand,
    Attempt,
    CreateEvidence,
    DeleteResult,
    ErrorResponse,
    Evidence,
    EvidenceList,
    Health,
    MissionList,
    PublishedMission,
    SessionInfo,
    StartAttempt,
)
from educationos.curriculum import Curriculum
from educationos.database import Database
from educationos.errors import DomainError, not_found, unavailable
from educationos.learning import LearningService
from educationos.limits import RedisRateLimiter
from educationos.observability import configure_observability

MAX_BODY_BYTES = 16_384
bearer = HTTPBearer(auto_error=False)


def error_response(status: int, code: str, message: str):
    headers = {"WWW-Authenticate": "Bearer"} if status == 401 else {}
    return JSONResponse(
        status_code=status, content={"error": {"code": code, "message": message}}, headers=headers
    )


async def session_dependency(request: Request) -> AsyncIterator[AsyncSession]:
    async for session in request.app.state.database.session():
        yield session


Session = Annotated[AsyncSession, Depends(session_dependency, scope="function")]


async def principal_dependency(
    request: Request,
    session: Session,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> Principal:
    if request.app.state.settings.environment in {"staging", "production"}:
        raise unavailable()
    principal = await authenticate(session, credentials.credentials if credentials else None)
    if session.bind.dialect.name == "postgresql":
        # PostgreSQL transaction-local value; never trust tenant IDs from request input.
        await session.execute(
            text("SELECT set_config('app.tenant_id', :tenant, true)"),
            {"tenant": str(principal.tenant_id)},
        )
    await request.app.state.limiter.check(principal.token_hash)
    return principal


Authenticated = Annotated[Principal, Depends(principal_dependency)]


def service(request: Request, session: Session) -> LearningService:
    return LearningService(session, request.app.state.curriculum, request.app.state.settings)


Learning = Annotated[LearningService, Depends(service)]


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings()
    database = Database(settings)
    redis = Redis.from_url(settings.redis_url, socket_timeout=2, socket_connect_timeout=2)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield
        await database.close()
        await redis.aclose()

    app = FastAPI(
        title="EducationOS Python API",
        version=__version__,
        lifespan=lifespan,
        description=(
            "Versioned curriculum and synthetic learning API. "
            "Real enrollment and live AI are closed."
        ),
        responses={
            status: {"model": ErrorResponse} for status in (401, 403, 404, 413, 422, 429, 503)
        },
    )
    app.state.settings = settings
    app.state.database = database
    app.state.redis = redis
    app.state.public_cache = PublicCatalogCache(redis)
    app.state.limiter = RedisRateLimiter(redis, settings.rate_limit_per_minute)
    app.state.curriculum = Curriculum(settings.curriculum_path)
    configure_observability(app, settings)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["Authorization", "Content-Type"],
    )

    async def safe_dispatch(request, call_next):
        try:
            return await call_next(request)
        except Exception:
            # No repr, SQL parameters, request body, token, or learner IDs reach logs.
            logging.getLogger("educationos").error("http.unexpected_failure")
            return error_response(500, "INTERNAL_ERROR", "Request could not be completed.")

    @app.middleware("http")
    async def request_boundary(request: Request, call_next):
        started = time.monotonic()
        request_id = str(uuid4())
        # Stream into a bounded buffer before parsing; Content-Length is untrusted.
        if request.method in {"POST", "PUT", "PATCH"}:
            body = bytearray()
            async for chunk in request.stream():
                if len(body) + len(chunk) > MAX_BODY_BYTES:
                    return error_response(413, "TOO_LARGE", "Request body is too large.")
                body.extend(chunk)
            request._body = bytes(body)
            if body and request.headers.get("content-type", "").split(";")[0] != "application/json":
                return error_response(415, "UNSUPPORTED_MEDIA_TYPE", "Use application/json.")
        tracer = getattr(app.state, "tracer", None)
        if tracer:
            with tracer.start_as_current_span("http.request") as span:
                response = await safe_dispatch(request, call_next)
                route = request.scope.get("route")
                span.set_attribute("http.route", getattr(route, "path", "unmatched"))
                span.set_attribute("http.response.status_code", response.status_code)
        else:
            response = await safe_dispatch(request, call_next)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Cache-Control"] = "no-store"
        route = request.scope.get("route")
        logging.getLogger("educationos").info(
            "http.request",
            extra={
                "safe_fields": {
                    "request_id": request_id,
                    "method": request.method,
                    "route": getattr(route, "path", "unmatched"),
                    "status": response.status_code,
                    "duration_ms": round((time.monotonic() - started) * 1000),
                }
            },
        )
        return response

    @app.exception_handler(DomainError)
    async def domain_error(request: Request, exc: DomainError):
        return error_response(exc.status, exc.code, exc.message)

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError):
        # Pydantic errors may contain learner text or request inputs. Never echo them.
        return error_response(422, "INVALID_INPUT", "Request does not match the typed contract.")

    @app.exception_handler(SQLAlchemyError)
    async def persistence_error(request: Request, exc: SQLAlchemyError):
        return error_response(503, "UNAVAILABLE", "Persistence is unavailable.")

    @app.get("/health/live", response_model=Health, operation_id="health_live", tags=["health"])
    async def live():
        return Health(status="ok")

    @app.get("/health/ready", response_model=Health, operation_id="health_ready", tags=["health"])
    async def ready(session: Session):
        try:
            await session.execute(text("SELECT 1"))
            if session.bind.dialect.name == "postgresql":
                revision = await session.scalar(text("SELECT version_num FROM alembic_version"))
                if revision != "0001_python_foundation":
                    raise unavailable()
            await redis.ping()
        except Exception:
            raise DomainError(
                503, "UNAVAILABLE", "Required infrastructure is unavailable."
            ) from None
        return Health(status="ok")

    @app.get(
        "/api/v1/missions",
        response_model=MissionList,
        operation_id="list_missions",
        tags=["curriculum"],
    )
    async def missions(age_band: AgeBand | None = None):
        items = [m.model_dump(mode="json", by_alias=True) for m in app.state.curriculum.missions]
        cached = await app.state.public_cache.catalog(app.state.curriculum.digest, items)
        result = MissionList.model_validate({"items": cached})
        if age_band is not None:
            result.items = [m for m in result.items if m.age_band == age_band]
        return result

    @app.get(
        "/api/v1/missions/{version_id}",
        response_model=PublishedMission,
        operation_id="get_mission",
        tags=["curriculum"],
    )
    async def mission(version_id: UUID):
        result = app.state.curriculum.get(version_id)
        if result is None:
            raise not_found()
        return result

    @app.get(
        "/api/v1/auth/session",
        response_model=SessionInfo,
        operation_id="get_session",
        tags=["identity"],
    )
    async def get_session(principal: Authenticated):
        return SessionInfo(
            principal_kind=principal.kind,
            tenant_id=principal.tenant_id,
            subject_id=principal.subject_id,
        )

    @app.post(
        "/api/v1/auth/register",
        response_model=ErrorResponse,
        status_code=503,
        operation_id="register_closed",
        tags=["identity"],
    )
    async def register():
        raise unavailable()

    @app.post(
        "/api/v1/ai/respond",
        response_model=ErrorResponse,
        status_code=503,
        operation_id="live_ai_closed",
        tags=["ai"],
    )
    async def ai_respond():
        raise unavailable()

    @app.post(
        "/api/v1/attempts",
        response_model=Attempt,
        status_code=201,
        operation_id="start_attempt",
        tags=["learning"],
    )
    async def start_attempt(data: StartAttempt, principal: Authenticated, learning: Learning):
        return await learning.start(principal, data)

    @app.get(
        "/api/v1/attempts/{attempt_id}",
        response_model=Attempt,
        operation_id="get_attempt",
        tags=["learning"],
    )
    async def get_attempt(attempt_id: UUID, principal: Authenticated, learning: Learning):
        return Attempt.model_validate(await learning.get_attempt(principal, attempt_id))

    @app.post(
        "/api/v1/attempts/{attempt_id}/complete",
        response_model=Attempt,
        operation_id="complete_attempt",
        tags=["learning"],
    )
    async def complete(attempt_id: UUID, principal: Authenticated, learning: Learning):
        return await learning.complete(principal, attempt_id)

    @app.post(
        "/api/v1/evidence",
        response_model=Evidence,
        status_code=201,
        operation_id="create_evidence",
        tags=["learning"],
    )
    async def evidence(data: CreateEvidence, principal: Authenticated, learning: Learning):
        return await learning.add_evidence(principal, data)

    @app.get(
        "/api/v1/learners/{learner_id}/evidence",
        response_model=EvidenceList,
        operation_id="list_evidence",
        tags=["learning"],
    )
    async def list_evidence(learner_id: UUID, principal: Authenticated, learning: Learning):
        return EvidenceList(items=await learning.evidence(principal, learner_id))

    @app.delete(
        "/api/v1/evidence/{evidence_id}",
        response_model=DeleteResult,
        operation_id="delete_evidence",
        tags=["learning"],
    )
    async def delete_evidence(evidence_id: UUID, principal: Authenticated, learning: Learning):
        await learning.delete_evidence(principal, evidence_id)
        return DeleteResult()

    return app


app = create_app()
