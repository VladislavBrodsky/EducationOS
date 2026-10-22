BEGIN;
CREATE SCHEMA educationos;

CREATE TABLE educationos.tenants (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE educationos.adult_accounts (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES educationos.tenants(id),
  identity_subject text NOT NULL CHECK (length(identity_subject) BETWEEN 1 AND 255),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, identity_subject)
);
CREATE TABLE educationos.learners (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES educationos.tenants(id),
  age_band text NOT NULL CHECK (age_band IN ('5-6','7-9','10-12','13-15','16-17')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);
CREATE TABLE educationos.learner_grants (
  tenant_id uuid NOT NULL,
  learner_id uuid NOT NULL,
  account_id uuid NOT NULL,
  relationship text NOT NULL CHECK (relationship IN ('guardian','educator')),
  can_read boolean NOT NULL DEFAULT true,
  can_contribute boolean NOT NULL DEFAULT false,
  revoked_at timestamptz,
  PRIMARY KEY (tenant_id, learner_id, account_id),
  FOREIGN KEY (tenant_id, learner_id) REFERENCES educationos.learners(tenant_id,id),
  FOREIGN KEY (tenant_id, account_id) REFERENCES educationos.adult_accounts(tenant_id,id),
  CHECK (NOT can_contribute OR can_read)
);
CREATE TABLE educationos.consent_records (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  learner_id uuid NOT NULL,
  guardian_account_id uuid NOT NULL,
  notice_version text NOT NULL CHECK (length(notice_version) BETWEEN 1 AND 80),
  purpose text NOT NULL CHECK (purpose = 'learning-evidence'),
  granted_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  FOREIGN KEY (tenant_id, learner_id) REFERENCES educationos.learners(tenant_id,id),
  FOREIGN KEY (tenant_id, guardian_account_id) REFERENCES educationos.adult_accounts(tenant_id,id),
  CHECK (expires_at > granted_at)
);
CREATE INDEX consent_access ON educationos.consent_records(tenant_id,learner_id,expires_at) WHERE revoked_at IS NULL;

CREATE TABLE educationos.missions (
  id uuid PRIMARY KEY,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE educationos.mission_versions (
  id uuid PRIMARY KEY,
  mission_id uuid NOT NULL REFERENCES educationos.missions(id),
  version integer NOT NULL CHECK (version > 0),
  status text NOT NULL CHECK (status IN ('draft','published')),
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
  age_band text NOT NULL CHECK (age_band IN ('5-6','7-9','10-12','13-15','16-17')),
  world text NOT NULL CHECK (world IN ('curiosity-grove','builder-harbor','orbit-lab','future-city','frontier-studio')),
  content jsonb NOT NULL CHECK (jsonb_typeof(content) = 'object' AND octet_length(content::text) <= 20000),
  published_at timestamptz,
  UNIQUE (mission_id,version),
  CHECK ((status = 'published' AND published_at IS NOT NULL) OR (status = 'draft' AND published_at IS NULL)),
  CHECK ((age_band,world) IN (('5-6','curiosity-grove'),('7-9','builder-harbor'),('10-12','orbit-lab'),('13-15','future-city'),('16-17','frontier-studio')))
);
CREATE FUNCTION educationos.validate_mission_version() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE expected text[] := ARRAY['notice','contradiction','imagine','hypothesis','experiment','reflect','transfer'];
DECLARE position integer;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'published' THEN RAISE EXCEPTION 'Published mission versions are immutable'; END IF;
    RETURN OLD;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'published' THEN RAISE EXCEPTION 'Published mission versions are immutable'; END IF;
  IF NEW.status = 'published' THEN
    IF jsonb_typeof(NEW.content->'steps') IS DISTINCT FROM 'array' OR jsonb_array_length(NEW.content->'steps') <> 7 THEN
      RAISE EXCEPTION 'Published missions require seven TRIZ steps';
    END IF;
    FOR position IN 1..7 LOOP
      IF NEW.content->'steps'->(position-1)->>'kind' IS DISTINCT FROM expected[position] THEN
        RAISE EXCEPTION 'TRIZ steps must be ordered and unique';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER mission_version_contract BEFORE INSERT OR UPDATE OR DELETE ON educationos.mission_versions
  FOR EACH ROW EXECUTE FUNCTION educationos.validate_mission_version();

CREATE TABLE educationos.attempts (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  learner_id uuid NOT NULL,
  mission_version_id uuid NOT NULL REFERENCES educationos.mission_versions(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','complete')),
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (tenant_id,learner_id,id),
  FOREIGN KEY (tenant_id,learner_id) REFERENCES educationos.learners(tenant_id,id),
  CHECK ((status = 'active' AND completed_at IS NULL) OR (status = 'complete' AND completed_at IS NOT NULL))
);
CREATE TABLE educationos.evidence (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  learner_id uuid NOT NULL,
  attempt_id uuid NOT NULL,
  step text NOT NULL CHECK (step IN ('notice','contradiction','imagine','hypothesis','experiment','reflect','transfer')),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object' AND octet_length(payload::text) <= 6000),
  created_at timestamptz NOT NULL DEFAULT now(),
  retention_until timestamptz NOT NULL DEFAULT now() + interval '30 days',
  FOREIGN KEY (tenant_id,learner_id,attempt_id) REFERENCES educationos.attempts(tenant_id,learner_id,id),
  CHECK (retention_until > created_at AND retention_until <= created_at + interval '30 days')
);
CREATE INDEX evidence_learner ON educationos.evidence(tenant_id,learner_id,created_at DESC);
CREATE INDEX evidence_retention ON educationos.evidence(retention_until);
CREATE FUNCTION educationos.protect_attempt() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE version_age text;
DECLARE learner_age text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF (NEW.id,NEW.tenant_id,NEW.learner_id,NEW.mission_version_id,NEW.created_at) IS DISTINCT FROM
       (OLD.id,OLD.tenant_id,OLD.learner_id,OLD.mission_version_id,OLD.created_at) THEN RAISE EXCEPTION 'Attempts are pinned to their original version and learner'; END IF;
    IF OLD.status = 'complete' THEN RAISE EXCEPTION 'Completed attempts are immutable'; END IF;
    IF NEW.status = 'complete' AND (SELECT count(DISTINCT step) FROM educationos.evidence WHERE attempt_id = NEW.id AND tenant_id = NEW.tenant_id AND learner_id = NEW.learner_id) <> 7 THEN
      RAISE EXCEPTION 'Completion requires evidence for seven steps';
    END IF;
  ELSE
    IF NEW.status <> 'active' THEN RAISE EXCEPTION 'Attempts must begin active'; END IF;
    SELECT age_band INTO version_age FROM educationos.mission_versions WHERE id = NEW.mission_version_id AND status = 'published';
    SELECT age_band INTO learner_age FROM educationos.learners WHERE tenant_id = NEW.tenant_id AND id = NEW.learner_id;
    IF version_age IS NULL OR learner_age IS NULL OR version_age <> learner_age THEN RAISE EXCEPTION 'Published mission must match learner age band'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER attempt_contract BEFORE INSERT OR UPDATE ON educationos.attempts FOR EACH ROW EXECUTE FUNCTION educationos.protect_attempt();
CREATE FUNCTION educationos.protect_evidence() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE attempt_status text;
DECLARE evidence_kind text;
BEGIN
  IF TG_OP = 'UPDATE' THEN RAISE EXCEPTION 'Evidence is append only'; END IF;
  SELECT status INTO attempt_status FROM educationos.attempts WHERE tenant_id = NEW.tenant_id AND learner_id = NEW.learner_id AND id = NEW.attempt_id FOR UPDATE;
  IF attempt_status IS DISTINCT FROM 'active' THEN RAISE EXCEPTION 'Evidence requires an active scoped attempt'; END IF;
  evidence_kind := NEW.payload->>'kind';
  IF evidence_kind IN ('idea','observation','reflection') THEN
    IF jsonb_typeof(NEW.payload->'text') IS DISTINCT FROM 'string' OR length(btrim(NEW.payload->>'text')) NOT BETWEEN 1 AND 1200 OR (NEW.payload - 'kind' - 'text') <> '{}'::jsonb THEN RAISE EXCEPTION 'Invalid text evidence'; END IF;
  ELSIF evidence_kind = 'measurement' THEN
    IF jsonb_typeof(NEW.payload->'value') IS DISTINCT FROM 'number' OR (NEW.payload->>'value')::numeric NOT BETWEEN 0 AND 10000
       OR jsonb_typeof(NEW.payload->'label') IS DISTINCT FROM 'string' OR length(btrim(NEW.payload->>'label')) NOT BETWEEN 1 AND 80
      OR jsonb_typeof(NEW.payload->'unit') IS DISTINCT FROM 'string' OR NEW.payload->>'unit' NOT IN ('coins','grams','centimeters','seconds')
       OR NOT (NEW.payload ? 'unit') OR (NEW.payload - 'kind' - 'label' - 'value' - 'unit') <> '{}'::jsonb THEN RAISE EXCEPTION 'Invalid measurement evidence'; END IF;
  ELSE RAISE EXCEPTION 'Invalid evidence kind'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER evidence_contract BEFORE INSERT OR UPDATE ON educationos.evidence FOR EACH ROW EXECUTE FUNCTION educationos.protect_evidence();

CREATE TABLE educationos.sessions (
  token_hash text PRIMARY KEY CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  tenant_id uuid NOT NULL REFERENCES educationos.tenants(id),
  actor_kind text NOT NULL CHECK (actor_kind IN ('adult','learner')),
  account_id uuid,
  learner_id uuid,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  FOREIGN KEY (tenant_id,account_id) REFERENCES educationos.adult_accounts(tenant_id,id),
  FOREIGN KEY (tenant_id,learner_id) REFERENCES educationos.learners(tenant_id,id),
  CHECK ((actor_kind = 'adult' AND account_id IS NOT NULL AND learner_id IS NULL) OR (actor_kind = 'learner' AND account_id IS NULL AND learner_id IS NOT NULL))
);

-- These settings are supplied only by a trusted transaction-bound server adapter.
-- End users must never receive database credentials or arbitrary SQL access.
CREATE FUNCTION educationos.has_learner_scope(target_tenant uuid, target_learner uuid, writing boolean DEFAULT false)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT target_tenant::text = current_setting('educationos.tenant_id',true) AND (
    (current_setting('educationos.actor_kind',true) = 'learner' AND target_learner::text = current_setting('educationos.learner_id',true)) OR
    (current_setting('educationos.actor_kind',true) = 'adult' AND EXISTS (
      SELECT 1 FROM educationos.learner_grants g WHERE g.tenant_id = target_tenant AND g.learner_id = target_learner
      AND g.account_id::text = current_setting('educationos.account_id',true) AND g.revoked_at IS NULL
      AND CASE WHEN writing THEN g.can_contribute ELSE g.can_read END
    ))
  );
$$;
CREATE FUNCTION educationos.has_learning_access(target_tenant uuid, target_learner uuid, writing boolean DEFAULT false)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT educationos.has_learner_scope(target_tenant,target_learner,writing) AND EXISTS (
    SELECT 1 FROM educationos.consent_records c
    WHERE c.tenant_id=target_tenant AND c.learner_id=target_learner AND c.purpose='learning-evidence'
      AND c.revoked_at IS NULL AND c.granted_at <= statement_timestamp() AND c.expires_at > statement_timestamp()
  );
$$;
ALTER TABLE educationos.learners ENABLE ROW LEVEL SECURITY;
ALTER TABLE educationos.learners FORCE ROW LEVEL SECURITY;
CREATE POLICY learner_read ON educationos.learners FOR SELECT USING (educationos.has_learner_scope(tenant_id,id));
ALTER TABLE educationos.adult_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE educationos.adult_accounts FORCE ROW LEVEL SECURITY;
CREATE POLICY adult_self ON educationos.adult_accounts FOR SELECT USING (tenant_id::text=current_setting('educationos.tenant_id',true) AND id::text=current_setting('educationos.account_id',true) AND current_setting('educationos.actor_kind',true)='adult');
ALTER TABLE educationos.learner_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE educationos.learner_grants FORCE ROW LEVEL SECURITY;
-- Learners may see only the relationship facts needed for consent checks. No names or identity subjects are in this table.
CREATE POLICY grants_scope ON educationos.learner_grants FOR SELECT USING (tenant_id::text=current_setting('educationos.tenant_id',true) AND (
  (current_setting('educationos.actor_kind',true)='adult' AND account_id::text=current_setting('educationos.account_id',true)) OR
  (current_setting('educationos.actor_kind',true)='learner' AND learner_id::text=current_setting('educationos.learner_id',true))
));
ALTER TABLE educationos.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE educationos.consent_records FORCE ROW LEVEL SECURITY;
CREATE POLICY consent_scope ON educationos.consent_records FOR SELECT USING (educationos.has_learner_scope(tenant_id,learner_id));
ALTER TABLE educationos.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE educationos.attempts FORCE ROW LEVEL SECURITY;
CREATE POLICY attempt_read ON educationos.attempts FOR SELECT USING (educationos.has_learning_access(tenant_id,learner_id));
CREATE POLICY attempt_insert ON educationos.attempts FOR INSERT WITH CHECK (educationos.has_learning_access(tenant_id,learner_id,true));
CREATE POLICY attempt_update ON educationos.attempts FOR UPDATE USING (educationos.has_learning_access(tenant_id,learner_id,true)) WITH CHECK (educationos.has_learning_access(tenant_id,learner_id,true));
ALTER TABLE educationos.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE educationos.evidence FORCE ROW LEVEL SECURITY;
CREATE POLICY evidence_read ON educationos.evidence FOR SELECT USING (educationos.has_learning_access(tenant_id,learner_id) AND retention_until > statement_timestamp());
CREATE POLICY evidence_insert ON educationos.evidence FOR INSERT WITH CHECK (educationos.has_learning_access(tenant_id,learner_id,true));
ALTER TABLE educationos.mission_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE educationos.mission_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY published_missions ON educationos.mission_versions FOR SELECT USING (status='published');
ALTER TABLE educationos.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE educationos.sessions FORCE ROW LEVEL SECURITY;
-- No session policy: application role cannot read/write sessions. A separate,
-- narrowly scoped identity service role is an explicit deployment integration.
REVOKE ALL ON ALL TABLES IN SCHEMA educationos FROM PUBLIC;
REVOKE CREATE ON SCHEMA educationos FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA educationos FROM PUBLIC;
COMMIT;
