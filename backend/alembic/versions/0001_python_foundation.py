"""Frozen PostgreSQL schema for the Python synthetic foundation."""

from alembic import op

revision = "0001_python_foundation"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute(
        "CREATE TABLE async_jobs (\n\tid UUID NOT NULL, \n\tkind VARCHAR(40) NOT NULL, \n\tstatus VARCHAR(20) NOT NULL, \n\tcreated_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\tcompleted_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tCHECK (kind IN ('purge_expired_evidence','index_curated_curriculum')), \n\tCHECK (status IN ('pending','complete','failed'))\n)"
    )
    op.execute("CREATE INDEX jobs_pending ON async_jobs (status, created_at)")
    op.execute(
        "CREATE TABLE curated_chunks (\n\tid UUID NOT NULL, \n\tsource_uri VARCHAR(300) NOT NULL, \n\tsource_digest VARCHAR(64) NOT NULL, \n\tordinal INTEGER NOT NULL, \n\tcontent VARCHAR(1600) NOT NULL, \n\tembedding_model VARCHAR(100), \n\tembedding VECTOR(384), \n\tPRIMARY KEY (id), \n\tUNIQUE (source_uri, source_digest, ordinal)\n)"
    )
    op.execute(
        "CREATE TABLE mission_versions (\n\tid UUID NOT NULL, \n\tmission_id UUID NOT NULL, \n\tversion INTEGER NOT NULL, \n\tcontent_digest VARCHAR(64) NOT NULL, \n\tcontent JSON NOT NULL, \n\tPRIMARY KEY (id), \n\tUNIQUE (mission_id, version)\n)"
    )
    op.execute(
        "CREATE TABLE tenants (\n\tid UUID NOT NULL, \n\tsynthetic BOOLEAN NOT NULL, \n\tPRIMARY KEY (id), \n\tCONSTRAINT tenant_synthetic_only CHECK (synthetic = true)\n)"
    )
    op.execute(
        "CREATE TABLE auth_sessions (\n\ttoken_hash VARCHAR(64) NOT NULL, \n\ttenant_id UUID NOT NULL, \n\tprincipal_kind VARCHAR(12) NOT NULL, \n\tsubject_id UUID NOT NULL, \n\texpires_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\trevoked_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (token_hash), \n\tCHECK (principal_kind IN ('adult','learner')), \n\tFOREIGN KEY(tenant_id) REFERENCES tenants (id)\n)"
    )
    op.execute("CREATE INDEX ix_auth_sessions_tenant_id ON auth_sessions (tenant_id)")
    op.execute(
        "CREATE TABLE learners (\n\tid UUID NOT NULL, \n\ttenant_id UUID NOT NULL, \n\tage_band VARCHAR(8) NOT NULL, \n\tsynthetic BOOLEAN NOT NULL, \n\tPRIMARY KEY (id), \n\tUNIQUE (tenant_id, id), \n\tCONSTRAINT learner_synthetic_only CHECK (synthetic = true), \n\tFOREIGN KEY(tenant_id) REFERENCES tenants (id)\n)"
    )
    op.execute("CREATE INDEX ix_learners_tenant_id ON learners (tenant_id)")
    op.execute(
        "CREATE TABLE attempts (\n\tid UUID NOT NULL, \n\ttenant_id UUID NOT NULL, \n\tlearner_id UUID NOT NULL, \n\tmission_version_id UUID NOT NULL, \n\tstatus VARCHAR(12) NOT NULL, \n\tcreated_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\tPRIMARY KEY (id), \n\tCHECK (status IN ('active','complete')), \n\tUNIQUE (tenant_id, learner_id, id), \n\tFOREIGN KEY(tenant_id, learner_id) REFERENCES learners (tenant_id, id), \n\tFOREIGN KEY(tenant_id) REFERENCES tenants (id), \n\tFOREIGN KEY(learner_id) REFERENCES learners (id), \n\tFOREIGN KEY(mission_version_id) REFERENCES mission_versions (id)\n)"
    )
    op.execute("CREATE INDEX ix_attempts_learner_id ON attempts (learner_id)")
    op.execute("CREATE INDEX ix_attempts_tenant_id ON attempts (tenant_id)")
    op.execute(
        "CREATE TABLE consents (\n\tid UUID NOT NULL, \n\ttenant_id UUID NOT NULL, \n\tlearner_id UUID NOT NULL, \n\tpurpose VARCHAR(40) NOT NULL, \n\tpolicy_version VARCHAR(40) NOT NULL, \n\tgranted_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\texpires_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\trevoked_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(tenant_id, learner_id) REFERENCES learners (tenant_id, id), \n\tFOREIGN KEY(tenant_id) REFERENCES tenants (id), \n\tFOREIGN KEY(learner_id) REFERENCES learners (id)\n)"
    )
    op.execute("CREATE INDEX ix_consents_tenant_id ON consents (tenant_id)")
    op.execute(
        "CREATE TABLE guardian_grants (\n\tid UUID NOT NULL, \n\ttenant_id UUID NOT NULL, \n\taccount_id UUID NOT NULL, \n\tlearner_id UUID NOT NULL, \n\trevoked_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tUNIQUE (tenant_id, account_id, learner_id), \n\tFOREIGN KEY(tenant_id, learner_id) REFERENCES learners (tenant_id, id), \n\tFOREIGN KEY(tenant_id) REFERENCES tenants (id), \n\tFOREIGN KEY(learner_id) REFERENCES learners (id)\n)"
    )
    op.execute("CREATE INDEX ix_guardian_grants_tenant_id ON guardian_grants (tenant_id)")
    op.execute(
        "CREATE TABLE evidence (\n\tid UUID NOT NULL, \n\ttenant_id UUID NOT NULL, \n\tlearner_id UUID NOT NULL, \n\tattempt_id UUID NOT NULL, \n\tstep VARCHAR(20) NOT NULL, \n\tpayload JSON NOT NULL, \n\tcreated_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\tretention_until TIMESTAMP WITH TIME ZONE NOT NULL, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(tenant_id, learner_id, attempt_id) REFERENCES attempts (tenant_id, learner_id, id) ON DELETE CASCADE, \n\tFOREIGN KEY(tenant_id) REFERENCES tenants (id), \n\tFOREIGN KEY(learner_id) REFERENCES learners (id), \n\tFOREIGN KEY(attempt_id) REFERENCES attempts (id) ON DELETE CASCADE\n)"
    )
    op.execute("CREATE INDEX ix_evidence_tenant_id ON evidence (tenant_id)")
    op.execute("CREATE INDEX ix_evidence_learner_id ON evidence (learner_id)")
    op.execute("CREATE INDEX ix_evidence_retention_until ON evidence (retention_until)")
    op.execute("ALTER TABLE learners ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE learners FORCE ROW LEVEL SECURITY")
    op.execute(
        "CREATE POLICY tenant_boundary ON learners USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)"
    )
    op.execute("ALTER TABLE guardian_grants ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE guardian_grants FORCE ROW LEVEL SECURITY")
    op.execute(
        "CREATE POLICY tenant_boundary ON guardian_grants USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)"
    )
    op.execute("ALTER TABLE consents ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE consents FORCE ROW LEVEL SECURITY")
    op.execute(
        "CREATE POLICY tenant_boundary ON consents USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)"
    )
    op.execute("ALTER TABLE attempts ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE attempts FORCE ROW LEVEL SECURITY")
    op.execute(
        "CREATE POLICY tenant_boundary ON attempts USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)"
    )
    op.execute("ALTER TABLE evidence ENABLE ROW LEVEL SECURITY")
    op.execute("ALTER TABLE evidence FORCE ROW LEVEL SECURITY")
    op.execute(
        "CREATE POLICY tenant_boundary ON evidence USING (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid) WITH CHECK (tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)"
    )
    op.execute(
        "CREATE FUNCTION reject_mission_version_change() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Publish a new mission version instead'; END $$"
    )
    op.execute(
        "CREATE TRIGGER immutable_mission_versions BEFORE UPDATE OR DELETE ON mission_versions FOR EACH ROW EXECUTE FUNCTION reject_mission_version_change()"
    )
    op.execute(
        "DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'educationos_app') THEN GRANT SELECT ON tenants, auth_sessions, mission_versions, alembic_version TO educationos_app; GRANT SELECT ON learners, guardian_grants, consents TO educationos_app; GRANT SELECT, INSERT, UPDATE, DELETE ON attempts, evidence TO educationos_app; END IF; END $$"
    )

    op.execute(
        "CREATE POLICY worker_expiry_read ON evidence FOR SELECT TO PUBLIC USING (current_user = 'educationos_worker' AND retention_until <= CURRENT_TIMESTAMP)"
    )
    op.execute(
        "CREATE POLICY worker_expiry_delete ON evidence FOR DELETE TO PUBLIC USING (current_user = 'educationos_worker' AND retention_until <= CURRENT_TIMESTAMP)"
    )
    op.execute(
        "DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'educationos_worker') THEN GRANT SELECT, INSERT, UPDATE ON async_jobs TO educationos_worker; GRANT SELECT, INSERT ON curated_chunks TO educationos_worker; GRANT SELECT (retention_until), DELETE ON evidence TO educationos_worker; END IF; END $$"
    )


def downgrade():
    op.execute("DROP TABLE evidence CASCADE")
    op.execute("DROP TABLE guardian_grants CASCADE")
    op.execute("DROP TABLE consents CASCADE")
    op.execute("DROP TABLE attempts CASCADE")
    op.execute("DROP TABLE learners CASCADE")
    op.execute("DROP TABLE auth_sessions CASCADE")
    op.execute("DROP TABLE tenants CASCADE")
    op.execute("DROP TABLE mission_versions CASCADE")
    op.execute("DROP TABLE curated_chunks CASCADE")
    op.execute("DROP TABLE async_jobs CASCADE")
    op.execute("DROP FUNCTION reject_mission_version_change()")
