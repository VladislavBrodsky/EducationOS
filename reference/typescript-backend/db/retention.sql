BEGIN;
-- Run only through a separately authorized maintenance role with DELETE access.
-- A deployment scheduler, monitored completion and backup expiry are not installed.
DELETE FROM educationos.evidence WHERE retention_until <= statement_timestamp();
COMMIT;
