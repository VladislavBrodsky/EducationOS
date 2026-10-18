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
  can_read BOOLEAN NOT NULL DEFAULT TRUE, can_contribute BOOLEAN NOT NULL DEFAULT FALSE CHECK (NOT can_contribute OR can_read),
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
-- Keep attempts pinned to the exact curriculum version used when the work began.
CREATE FUNCTION protect_attempt() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE mission_age VARCHAR(5); learner_age VARCHAR(5); publication TIMESTAMPTZ;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id OR NEW.learner_id IS DISTINCT FROM OLD.learner_id
       OR NEW.mission_version_id IS DISTINCT FROM OLD.mission_version_id OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Attempt identity and mission version are pinned';
    END IF;
    IF OLD.status = 'complete' AND NEW.status <> 'complete' THEN RAISE EXCEPTION 'A completed attempt cannot be reopened'; END IF;
    IF NEW.status = 'complete' AND OLD.status <> 'complete' AND (SELECT count(DISTINCT step) FROM evidence WHERE attempt_id = NEW.id AND tenant_id = NEW.tenant_id AND learner_id = NEW.learner_id AND retention_until > CURRENT_TIMESTAMP) <> 7 THEN
      RAISE EXCEPTION 'Completion requires evidence for all seven steps';
    END IF;
  ELSE
    SELECT age_band,published_at INTO mission_age,publication FROM mission_versions WHERE id = NEW.mission_version_id;
    SELECT age_band INTO learner_age FROM learners WHERE id = NEW.learner_id AND tenant_id = NEW.tenant_id;
    IF publication IS NULL OR publication > CURRENT_TIMESTAMP OR mission_age IS DISTINCT FROM learner_age THEN RAISE EXCEPTION 'An age-appropriate published mission is required'; END IF;
    IF NEW.status <> 'active' THEN RAISE EXCEPTION 'New attempts must be active'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER pinned_attempt BEFORE INSERT OR UPDATE ON attempts FOR EACH ROW EXECUTE FUNCTION protect_attempt();
CREATE FUNCTION protect_evidence() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN RAISE EXCEPTION 'Evidence is append only'; END IF;
  IF NEW.payload->>'kind' IN ('idea','observation','reflection') THEN
    IF jsonb_typeof(NEW.payload->'text') IS DISTINCT FROM 'string' OR length(btrim(NEW.payload->>'text')) NOT BETWEEN 1 AND 1200
       OR NEW.payload - ARRAY['kind','text']::text[] <> '{}'::jsonb THEN RAISE EXCEPTION 'Invalid text evidence payload'; END IF;
  ELSIF NEW.payload->>'kind' = 'measurement' THEN
    IF jsonb_typeof(NEW.payload->'label') IS DISTINCT FROM 'string' OR length(btrim(NEW.payload->>'label')) NOT BETWEEN 1 AND 80
       OR jsonb_typeof(NEW.payload->'value') IS DISTINCT FROM 'number' OR NEW.payload->>'unit' NOT IN ('coins','grams','centimeters','seconds')
       OR jsonb_typeof(NEW.payload->'unit') IS DISTINCT FROM 'string'
       OR NEW.payload - ARRAY['kind','label','value','unit']::text[] <> '{}'::jsonb THEN RAISE EXCEPTION 'Invalid measurement evidence payload'; END IF;
    IF (NEW.payload->>'value')::numeric NOT BETWEEN 0 AND 10000 THEN RAISE EXCEPTION 'Invalid measurement range'; END IF;
  ELSE RAISE EXCEPTION 'Unsupported evidence payload'; END IF;
  IF NOT EXISTS (SELECT 1 FROM attempts WHERE id = NEW.attempt_id AND learner_id = NEW.learner_id AND tenant_id = NEW.tenant_id AND status = 'active') THEN
    RAISE EXCEPTION 'Evidence requires an active scoped attempt';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER append_only_evidence BEFORE INSERT OR UPDATE ON evidence FOR EACH ROW EXECUTE FUNCTION protect_evidence();

CREATE FUNCTION protect_audit_event() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Audit events are append only'; END;
$$;
CREATE TRIGGER append_only_audit_event BEFORE UPDATE OR DELETE ON audit_events FOR EACH ROW EXECUTE FUNCTION protect_audit_event();
-- Column-limited UPDATE(id) supports row SHARE locks for the runtime role;
-- immutable scoped identity ensures this privilege cannot change a record ID.
CREATE FUNCTION protect_scoped_identity() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN RAISE EXCEPTION 'Scoped record identity is immutable'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER immutable_learner_identity BEFORE UPDATE ON learners FOR EACH ROW EXECUTE FUNCTION protect_scoped_identity();
CREATE TRIGGER immutable_grant_identity BEFORE UPDATE ON guardian_grants FOR EACH ROW EXECUTE FUNCTION protect_scoped_identity();
CREATE TRIGGER immutable_consent_identity BEFORE UPDATE ON consent_records FOR EACH ROW EXECUTE FUNCTION protect_scoped_identity();
