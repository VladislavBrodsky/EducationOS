"""Operator-only adult provisioning; no public signup or default passwords.

Run from the backend directory after migrations:
  uv run python -m educationos.seed_adults --role educator --tenant UUID --adult-attested
An educator and separate reviewer must share a tenant. Never use real identities in a demo.
"""

import argparse
import asyncio
from getpass import getpass
from uuid import UUID

from sqlalchemy import select

from educationos.adult import ROLES, AdultAccount, LoginInput, email_locator, password_digest
from educationos.config import Settings
from educationos.database import Database


async def provision(role: str, tenant_id: UUID, email: str, password: str) -> UUID:
    data = LoginInput(email=email, password=password)
    settings = Settings()
    if settings.environment == "production":
        raise SystemExit("Adult provisioning remains closed in production")
    database = Database(settings)
    try:
        async for session in database.session():
            existing = await session.scalar(
                select(AdultAccount).where(AdultAccount.email_hash == email_locator(data.email))
            )
            if existing:
                raise SystemExit("Account already exists; role changes require operator review")
            account = AdultAccount(
                tenant_id=tenant_id,
                email_hash=email_locator(data.email),
                password_hash=password_digest(data.password.get_secret_value()),
                role=role,
                adult_attested=True,
                identity_verified=False,
            )
            session.add(account)
            await session.flush()
            account_id = account.id
        return account_id
    finally:
        await database.close()


def main():
    parser = argparse.ArgumentParser(
        description="Provision an attested adult for local/staging review"
    )
    parser.add_argument("--role", choices=ROLES, required=True)
    parser.add_argument("--tenant", type=UUID, required=True)
    parser.add_argument("--adult-attested", action="store_true", required=True)
    args = parser.parse_args()
    email = input("Adult login email (stored as a hash): ").strip()
    password = getpass("Password (12–128 characters): ")
    if password != getpass("Confirm password: "):
        raise SystemExit("Passwords do not match")
    account_id = asyncio.run(provision(args.role, args.tenant, email, password))
    print(f"Provisioned {args.role} account {account_id}; identity verification remains pending")


if __name__ == "__main__":
    main()
