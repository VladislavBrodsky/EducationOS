-- Local synthetic development only. Hosted roles use generated managed secrets.
CREATE ROLE educationos_app LOGIN PASSWORD 'educationos-app-local-only'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
GRANT CONNECT ON DATABASE educationos TO educationos_app;
GRANT USAGE ON SCHEMA public TO educationos_app;
-- Alembic grants specific table permissions after creating the schema.

CREATE ROLE educationos_worker LOGIN PASSWORD 'educationos-worker-local-only'
  NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
GRANT CONNECT ON DATABASE educationos TO educationos_worker;
GRANT USAGE ON SCHEMA public TO educationos_worker;
