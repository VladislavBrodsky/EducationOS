-- Tenant-scoped, consent-gated storage. No public child-account provisioning.
CREATE TABLE tenants (
  id UUID PRIMARY KEY, slug VARCHAR(80) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE adult_accounts (
  id UUID PRIMARY KEY, tenant_id UUID NOT NULL REFERENCES tenants(id),
  provider_subject VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id, tenant_id)
);
CREATE TABLE learners (
  id UUID PRIMARY KEY, tenant_id UUID NOT NULL REFERENCES tenants(id),
  alias VARCHAR(40) NOT NULL, age_band VARCHAR(5) NOT NULL CHECK (age_band IN ('5-6','7-9','10-12','13-15','16-17')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id, tenant_id)
);
CREATE TABLE guardian_grants (
  id UUID PRIMARY KEY, tenant_id UUID NOT NULL, guardian_id UUID NOT NULL, learner_id UUID NOT NULL,
  can_read BOOLEAN NOT NULL DEFAULT TRUE, can_contribute BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  UNIQUE (guardian_id, learner_id),
  FOREIGN KEY (guardian_id, tenant_id) REFERENCES adult_accounts(id, tenant_id),
  FOREIGN KEY (learner_id, tenant_id) REFERENCES learners(id, tenant_id)
);
CREATE TABLE consent_records (
  id UUID PRIMARY KEY, tenant_id UUID NOT NULL, guardian_id UUID NOT NULL, learner_id UUID NOT NULL,
  purpose VARCHAR(40) NOT NULL CHECK (purpose = 'core_learning'), policy_version VARCHAR(80) NOT NULL,
  verification_provider VARCHAR(80) NOT NULL CHECK (length(verification_provider) > 0),
  proof_reference VARCHAR(255) NOT NULL CHECK (length(proof_reference) > 0),
  verified_at TIMESTAMPTZ NOT NULL, expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ,
  CHECK (expires_at > verified_at),
  FOREIGN KEY (guardian_id, tenant_id) REFERENCES adult_accounts(id, tenant_id),
  FOREIGN KEY (learner_id, tenant_id) REFERENCES learners(id, tenant_id)
);
CREATE INDEX consent_records_learner_idx ON consent_records(learner_id, tenant_id);
CREATE TABLE sessions (
  id UUID PRIMARY KEY, tenant_id UUID NOT NULL REFERENCES tenants(id), token_hash CHAR(64) UNIQUE NOT NULL CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  kind VARCHAR(10) NOT NULL, account_id UUID, learner_id UUID,
  expires_at TIMESTAMPTZ NOT NULL, revoked_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ((kind = 'adult' AND account_id IS NOT NULL AND learner_id IS NULL) OR (kind = 'learner' AND learner_id IS NOT NULL AND account_id IS NULL)),
  FOREIGN KEY (account_id, tenant_id) REFERENCES adult_accounts(id, tenant_id),
  FOREIGN KEY (learner_id, tenant_id) REFERENCES learners(id, tenant_id)
);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE missions (id UUID PRIMARY KEY, slug VARCHAR(100) UNIQUE NOT NULL);
CREATE TABLE mission_versions (
  id UUID PRIMARY KEY, mission_id UUID NOT NULL REFERENCES missions(id), version INTEGER NOT NULL CHECK (version > 0),
  title VARCHAR(120) NOT NULL, age_band VARCHAR(5) NOT NULL CHECK (age_band IN ('5-6','7-9','10-12','13-15','16-17')),
  world VARCHAR(40) NOT NULL CHECK (world IN ('curiosity-grove','builder-harbor','orbit-lab','future-city','frontier-studio')),
  content JSONB NOT NULL CHECK (jsonb_typeof(content) = 'object'), published_at TIMESTAMPTZ,
  UNIQUE (mission_id, version, age_band)
);
CREATE FUNCTION protect_published_mission() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.published_at IS NOT NULL THEN RAISE EXCEPTION 'Published mission versions are immutable'; END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER immutable_published_mission BEFORE UPDATE OR DELETE ON mission_versions FOR EACH ROW EXECUTE FUNCTION protect_published_mission();
CREATE TABLE attempts (
  id UUID PRIMARY KEY, tenant_id UUID NOT NULL, learner_id UUID NOT NULL,
  mission_version_id UUID NOT NULL REFERENCES mission_versions(id),
  status VARCHAR(10) NOT NULL DEFAULT 'active' CHECK (status IN ('active','complete')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (id, learner_id, tenant_id),
  FOREIGN KEY (learner_id, tenant_id) REFERENCES learners(id, tenant_id)
);
CREATE INDEX attempts_learner_idx ON attempts(learner_id, tenant_id, created_at);
CREATE TABLE evidence (
  id UUID PRIMARY KEY, tenant_id UUID NOT NULL, learner_id UUID NOT NULL, attempt_id UUID NOT NULL,
  step VARCHAR(20) NOT NULL CHECK (step IN ('notice','contradiction','imagine','hypothesis','experiment','reflect','transfer')),
  payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, retention_until TIMESTAMPTZ NOT NULL,
  CHECK (retention_until > created_at),
  FOREIGN KEY (attempt_id, learner_id, tenant_id) REFERENCES attempts(id, learner_id, tenant_id)
);
CREATE INDEX evidence_learner_idx ON evidence(learner_id, tenant_id, created_at);
CREATE INDEX evidence_retention_idx ON evidence(retention_until);
CREATE TABLE audit_events (
  id UUID PRIMARY KEY, tenant_id UUID NOT NULL REFERENCES tenants(id),
  actor_kind VARCHAR(10) NOT NULL CHECK (actor_kind IN ('adult','learner')), actor_id UUID NOT NULL,
  action VARCHAR(80) NOT NULL, subject_id UUID NOT NULL, request_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX audit_events_tenant_idx ON audit_events(tenant_id, created_at);
CREATE TABLE rate_limit_buckets (
  key CHAR(64) PRIMARY KEY, count INTEGER NOT NULL CHECK (count > 0), expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX rate_limit_expiry_idx ON rate_limit_buckets(expires_at);
