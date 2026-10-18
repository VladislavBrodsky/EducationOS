-- Run as database owner AFTER migrations against a dedicated database.
-- First create a non-owner, non-superuser LOGIN role named educationos_runtime
-- through your provider's secret manager; never put its password in this file.
-- Use that role's pooled URL as DATABASE_URL. DIRECT_URL uses a separate migrator.
-- These grants constrain operations; application authorization still enforces
-- tenant + guardian + consent scope. Database RLS is a pre-real-account launch gate.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'educationos_runtime' AND rolcanlogin AND NOT rolsuper AND NOT rolcreatedb AND NOT rolcreaterole AND NOT rolbypassrls) THEN
    RAISE EXCEPTION 'Create the restricted educationos_runtime role before applying grants';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tableowner = 'educationos_runtime') THEN
    RAISE EXCEPTION 'The runtime role must not own application tables';
  END IF;
END $$;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO educationos_runtime;
REVOKE ALL ON tenants,adult_accounts,learners,guardian_grants,consent_records,sessions,missions,mission_versions,attempts,evidence,audit_events,rate_limit_buckets FROM educationos_runtime;
GRANT SELECT ON adult_accounts,learners,guardian_grants,consent_records,sessions,missions,mission_versions,attempts,evidence,rate_limit_buckets TO educationos_runtime;
GRANT INSERT ON attempts,evidence,audit_events,rate_limit_buckets TO educationos_runtime;
GRANT UPDATE (status) ON attempts TO educationos_runtime;
GRANT UPDATE (count,expires_at) ON rate_limit_buckets TO educationos_runtime;
-- PostgreSQL row locking needs UPDATE privilege on at least one selected column.
-- Identity triggers prevent actual ID changes; no consent/grant/learner state writes.
GRANT UPDATE (id) ON learners,guardian_grants,consent_records TO educationos_runtime;
-- Runtime receives no account/learner/grant/consent/session provisioning or DELETE,
-- TRUNCATE, schema creation, mission editing, or audit read/change privileges.
