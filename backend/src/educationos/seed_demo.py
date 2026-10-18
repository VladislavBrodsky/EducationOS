"""Explicit development-only synthetic provisioning; never an HTTP enrollment path."""

import asyncio
import json
from datetime import timedelta
from uuid import UUID

from educationos.auth import hash_token, new_token, now
from educationos.config import Settings
from educationos.curriculum import Curriculum
from educationos.database import Database
from educationos.models import AuthSession, Consent, GuardianGrant, Learner, MissionVersion, Tenant

TENANT_ID = UUID("e0600000-0000-4000-8000-000000000001")
LEARNER_ID = UUID("e0600000-0000-4000-8000-000000000002")
ACCOUNT_ID = UUID("e0600000-0000-4000-8000-000000000003")


async def provision(session, curriculum: Curriculum):
    for mission in curriculum.missions:
        stored = await session.get(MissionVersion, mission.id)
        digest = curriculum.version_digest(mission)
        if stored is None:
            session.add(
                MissionVersion(
                    id=mission.id,
                    mission_id=mission.mission_id,
                    version=mission.version,
                    content_digest=digest,
                    content=mission.model_dump(mode="json", by_alias=True),
                )
            )
        elif stored.content_digest != digest:
            raise RuntimeError(
                "Published mission cannot be changed in place; publish a new version"
            )
    if await session.get(Tenant, TENANT_ID) is None:
        session.add(Tenant(id=TENANT_ID, synthetic=True))
        await session.flush()
        session.add(Learner(id=LEARNER_ID, tenant_id=TENANT_ID, age_band="10-12", synthetic=True))
        await session.flush()
        session.add(
            GuardianGrant(tenant_id=TENANT_ID, account_id=ACCOUNT_ID, learner_id=LEARNER_ID)
        )
    # Renew only this explicit synthetic fixture. There is no real consent workflow.
    session.add(
        Consent(
            tenant_id=TENANT_ID,
            learner_id=LEARNER_ID,
            purpose="synthetic_learning",
            policy_version="synthetic-v1",
            granted_at=now(),
            expires_at=now() + timedelta(hours=1),
        )
    )
    token = new_token()
    session.add(
        AuthSession(
            token_hash=hash_token(token),
            tenant_id=TENANT_ID,
            principal_kind="adult",
            subject_id=ACCOUNT_ID,
            expires_at=now() + timedelta(hours=1),
        )
    )
    await session.flush()
    return token


async def main():
    settings = Settings()
    if settings.environment == "production":
        raise SystemExit("Synthetic fixture provisioning is disabled in production")
    database = Database(settings)
    try:
        async for session in database.session():
            token = await provision(session, Curriculum(settings.curriculum_path))
        # Intended secret output for local operator use only. Do not commit or paste into logs.
        print(
            json.dumps(
                {
                    "synthetic": True,
                    "expiresInSeconds": 3600,
                    "learnerId": str(LEARNER_ID),
                    "token": token,
                }
            )
        )
    finally:
        await database.close()


if __name__ == "__main__":
    asyncio.run(main())
