-- Run as deployment administrator; choose a separate secret at deployment time.
-- Never use the schema owner, a superuser, or a BYPASSRLS role for application queries.
CREATE ROLE educationos_app NOLOGIN NOSUPERUSER NOBYPASSRLS;
GRANT USAGE ON SCHEMA educationos TO educationos_app;
GRANT SELECT ON educationos.learners, educationos.adult_accounts, educationos.learner_grants,
  educationos.consent_records, educationos.mission_versions, educationos.attempts, educationos.evidence TO educationos_app;
GRANT INSERT ON educationos.attempts, educationos.evidence TO educationos_app;
GRANT UPDATE (status,completed_at) ON educationos.attempts TO educationos_app;
GRANT EXECUTE ON FUNCTION educationos.has_learner_scope(uuid,uuid,boolean), educationos.has_learning_access(uuid,uuid,boolean),
  educationos.protect_attempt(), educationos.protect_evidence(), educationos.validate_mission_version() TO educationos_app;
-- Grant this group role to the server connection role. Identity/session issuance,
-- mission publishing, consent management and retention maintenance use distinct roles.
