from datetime import timedelta
from uuid import uuid4

import httpx
import pytest
from sqlalchemy import event

from educationos.auth import hash_token, now
from educationos.config import Settings
from educationos.main import create_app
from educationos.models import AuthSession, Base, Consent, GuardianGrant, Learner, Tenant
from educationos.seed_demo import LEARNER_ID, TENANT_ID, provision


class AllowLimiter:
    async def check(self, identity):
        pass


@pytest.fixture
async def fixture_app():
    app = create_app(Settings(environment="test", database_url="sqlite+aiosqlite:///:memory:"))
    app.state.limiter = AllowLimiter()

    @event.listens_for(app.state.database.engine.sync_engine, "connect")
    def foreign_keys(connection, record):
        connection.execute("PRAGMA foreign_keys=ON")

    async with app.state.database.engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    async for session in app.state.database.session():
        token = await provision(session, app.state.curriculum)
    app.state.test_token = token
    app.state.test_learner = LEARNER_ID
    app.state.test_tenant = TENANT_ID
    yield app
    await app.state.database.close()
    await app.state.redis.aclose()


@pytest.fixture
async def client(fixture_app):
    transport = httpx.ASGITransport(app=fixture_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
async def auth(fixture_app):
    return {"Authorization": f"Bearer {fixture_app.state.test_token}"}


async def add_other_tenant(app):
    tenant, learner, account = uuid4(), uuid4(), uuid4()
    token = "B" * 43
    async for session in app.state.database.session():
        session.add(Tenant(id=tenant, synthetic=True))
        await session.flush()
        session.add(Learner(id=learner, tenant_id=tenant, age_band="10-12", synthetic=True))
        await session.flush()
        session.add(GuardianGrant(tenant_id=tenant, account_id=account, learner_id=learner))
        session.add(
            Consent(
                tenant_id=tenant,
                learner_id=learner,
                granted_at=now(),
                expires_at=now() + timedelta(hours=1),
            )
        )
        session.add(
            AuthSession(
                token_hash=hash_token(token),
                tenant_id=tenant,
                principal_kind="adult",
                subject_id=account,
                expires_at=now() + timedelta(hours=1),
            )
        )
    return token, learner
