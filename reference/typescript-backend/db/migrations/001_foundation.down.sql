BEGIN;
-- Destructive rollback for disposable development databases. Back up first.
DROP SCHEMA educationos CASCADE;
COMMIT;
