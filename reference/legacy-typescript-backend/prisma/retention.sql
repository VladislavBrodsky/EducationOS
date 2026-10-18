-- Run daily as a restricted maintenance role, with statement timeout and job metrics.
-- No learner text is returned to job logs. Record affected-row COUNTS only.
-- Expired evidence is inaccessible immediately, even before this cleanup runs.
BEGIN;
SET LOCAL statement_timeout = '30s';
DELETE FROM evidence WHERE retention_until <= CURRENT_TIMESTAMP;
DELETE FROM sessions WHERE expires_at <= CURRENT_TIMESTAMP OR revoked_at IS NOT NULL;
DELETE FROM rate_limit_buckets WHERE expires_at <= CURRENT_TIMESTAMP;
COMMIT;
-- Audit/account/consent retention and complete account erasure need an approved policy
-- and a separately tested worker before real accounts are enabled.
