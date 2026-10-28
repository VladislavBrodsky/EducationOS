"""Frozen adult-only studio schema; no child enrollment or identity verification."""

from alembic import op

revision = "0002_adult_studio"
down_revision = "0001_python_foundation"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("\nCREATE TABLE adult_accounts (\n\tid UUID NOT NULL, \n\ttenant_id UUID NOT NULL, \n\temail_hash VARCHAR(64) NOT NULL, \n\tpassword_hash VARCHAR(256) NOT NULL, \n\trole VARCHAR(16) NOT NULL, \n\tadult_attested BOOLEAN NOT NULL, \n\tidentity_verified BOOLEAN NOT NULL, \n\tactive BOOLEAN NOT NULL, \n\tcreated_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\tPRIMARY KEY (id), \n\tUNIQUE (tenant_id, id), \n\tCONSTRAINT adult_role CHECK (role IN ('educator','reviewer','guardian')), \n\tCONSTRAINT adult_attestation_required CHECK (adult_attested = true), \n\tCONSTRAINT identity_verification_closed CHECK (identity_verified = false), \n\tUNIQUE (email_hash)\n)\n\n")
    op.execute('CREATE INDEX ix_adult_accounts_tenant_id ON adult_accounts (tenant_id)')
    op.execute('\nCREATE TABLE adult_audit (\n\tid UUID NOT NULL, \n\ttenant_id UUID NOT NULL, \n\tactor_id UUID NOT NULL, \n\tevent VARCHAR(60) NOT NULL, \n\ttarget_id UUID, \n\toccurred_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(tenant_id, actor_id) REFERENCES adult_accounts (tenant_id, id), \n\tFOREIGN KEY(actor_id) REFERENCES adult_accounts (id)\n)\n\n')
    op.execute('CREATE INDEX ix_adult_audit_tenant_id ON adult_audit (tenant_id)')
    op.execute('\nCREATE TABLE adult_auth_sessions (\n\ttoken_hash VARCHAR(64) NOT NULL, \n\taccount_id UUID NOT NULL, \n\texpires_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\trevoked_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (token_hash), \n\tFOREIGN KEY(account_id) REFERENCES adult_accounts (id)\n)\n\n')
    op.execute('CREATE INDEX ix_adult_auth_sessions_account_id ON adult_auth_sessions (account_id)')
    op.execute("\nCREATE TABLE adult_consents (\n\tid UUID NOT NULL, \n\ttenant_id UUID NOT NULL, \n\taccount_id UUID NOT NULL, \n\tpurpose VARCHAR(40) NOT NULL, \n\tpolicy_version VARCHAR(40) NOT NULL, \n\tstatus VARCHAR(30) NOT NULL, \n\tacknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\trevoked_at TIMESTAMP WITH TIME ZONE, \n\tPRIMARY KEY (id), \n\tFOREIGN KEY(tenant_id, account_id) REFERENCES adult_accounts (tenant_id, id), \n\tCONSTRAINT adult_consent_purpose CHECK (purpose = 'child_learning'), \n\tCONSTRAINT adult_consent_policy CHECK (policy_version = 'scaffold-v1'), \n\tCONSTRAINT adult_consent_never_verified CHECK (status IN ('pending_verification','revoked')), \n\tFOREIGN KEY(account_id) REFERENCES adult_accounts (id)\n)\n\n")
    op.execute('CREATE INDEX ix_adult_consents_account_id ON adult_consents (account_id)')
    op.execute('CREATE INDEX ix_adult_consents_tenant_id ON adult_consents (tenant_id)')
    op.execute("\nCREATE TABLE studio_missions (\n\tid UUID NOT NULL, \n\ttenant_id UUID NOT NULL, \n\tauthor_id UUID NOT NULL, \n\tcontent JSON NOT NULL, \n\tstatus VARCHAR(12) NOT NULL, \n\tversion INTEGER NOT NULL, \n\tpublished_version INTEGER, \n\tcreated_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\tupdated_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\tPRIMARY KEY (id), \n\tCONSTRAINT studio_status CHECK (status IN ('draft','review','published')), \n\tCONSTRAINT studio_version_positive CHECK (version >= 1), \n\tCONSTRAINT studio_published_version CHECK (published_version IS NULL OR (published_version >= 1 AND published_version <= version)), \n\tUNIQUE (tenant_id, id), \n\tFOREIGN KEY(tenant_id, author_id) REFERENCES adult_accounts (tenant_id, id), \n\tFOREIGN KEY(author_id) REFERENCES adult_accounts (id)\n)\n\n")
    op.execute('CREATE INDEX ix_studio_missions_tenant_id ON studio_missions (tenant_id)')
    op.execute("\nCREATE TABLE studio_audit (\n\tid UUID NOT NULL, \n\tmission_id UUID NOT NULL, \n\tactor_id UUID NOT NULL, \n\taction VARCHAR(20) NOT NULL, \n\tversion INTEGER NOT NULL, \n\tnote VARCHAR(600), \n\tmoderation_flags JSON NOT NULL, \n\tcreated_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\tPRIMARY KEY (id), \n\tCHECK (action IN ('created','edited','submitted','approved','rejected')), \n\tFOREIGN KEY(mission_id) REFERENCES studio_missions (id), \n\tFOREIGN KEY(actor_id) REFERENCES adult_accounts (id)\n)\n\n")
    op.execute('CREATE INDEX studio_audit_mission_version ON studio_audit (mission_id, version)')
    op.execute("\nCREATE TABLE studio_revisions (\n\tid UUID NOT NULL, \n\tmission_id UUID NOT NULL, \n\tversion INTEGER NOT NULL, \n\tstatus VARCHAR(12) NOT NULL, \n\tcontent JSON NOT NULL, \n\tcreated_at TIMESTAMP WITH TIME ZONE NOT NULL, \n\tPRIMARY KEY (id), \n\tUNIQUE (mission_id, version), \n\tCONSTRAINT studio_revision_status CHECK (status IN ('draft','review','published')), \n\tCONSTRAINT studio_revision_version_positive CHECK (version >= 1), \n\tFOREIGN KEY(mission_id) REFERENCES studio_missions (id)\n)\n\n")
    op.execute("CREATE FUNCTION reject_studio_history_change() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'History is append only'; END $$")
    op.execute('CREATE TRIGGER immutable_studio_revisions BEFORE UPDATE OR DELETE ON studio_revisions FOR EACH ROW EXECUTE FUNCTION reject_studio_history_change()')
    op.execute('CREATE TRIGGER immutable_studio_audit BEFORE UPDATE OR DELETE ON studio_audit FOR EACH ROW EXECUTE FUNCTION reject_studio_history_change()')
    op.execute('CREATE TRIGGER immutable_adult_audit BEFORE UPDATE OR DELETE ON adult_audit FOR EACH ROW EXECUTE FUNCTION reject_studio_history_change()')
    op.execute("DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'educationos_app') THEN GRANT SELECT ON adult_accounts TO educationos_app; GRANT SELECT, INSERT ON adult_auth_sessions, adult_consents, adult_audit, studio_missions, studio_revisions, studio_audit TO educationos_app; GRANT UPDATE (revoked_at) ON adult_auth_sessions TO educationos_app; GRANT UPDATE (status, revoked_at) ON adult_consents TO educationos_app; GRANT UPDATE (content, status, version, published_version, updated_at) ON studio_missions TO educationos_app; END IF; END $$")


def downgrade():
    op.execute("DROP TABLE studio_revisions")
    op.execute("DROP TABLE studio_audit")
    op.execute("DROP TABLE studio_missions")
    op.execute("DROP TABLE adult_consents")
    op.execute("DROP TABLE adult_auth_sessions")
    op.execute("DROP TABLE adult_audit")
    op.execute("DROP TABLE adult_accounts")
    op.execute("DROP FUNCTION reject_studio_history_change()")
