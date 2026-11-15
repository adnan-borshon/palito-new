BEGIN;

ALTER TABLE palito.care_reminders
  ADD COLUMN dispatched_at TIMESTAMPTZ(3),
  ADD COLUMN escalated_at TIMESTAMPTZ(3);

CREATE TABLE palito.notification_preferences (
  user_id UUID PRIMARY KEY,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  sms_enabled BOOLEAN NOT NULL DEFAULT false,
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  consent_version VARCHAR(20) NOT NULL DEFAULT 'notify-v1',
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (consent_version = 'notify-v1'),
  CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);

CREATE TABLE palito.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  category VARCHAR(32) NOT NULL,
  title VARCHAR(160) NOT NULL,
  body VARCHAR(1000) NOT NULL,
  link_kind VARCHAR(40),
  link_id UUID,
  dedupe_key VARCHAR(160) NOT NULL,
  read_at TIMESTAMPTZ(3),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (length(btrim(category)) > 0 AND length(btrim(title)) > 0 AND length(btrim(body)) > 0 AND length(btrim(dedupe_key)) > 0),
  CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX notifications_recipient_id_dedupe_key_key ON palito.notifications(recipient_id, dedupe_key);
CREATE INDEX notifications_recipient_id_created_at_id_idx ON palito.notifications(recipient_id, created_at, id);
CREATE INDEX notifications_recipient_id_read_at_idx ON palito.notifications(recipient_id, read_at);

CREATE FUNCTION palito.check_notification_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF (NEW.id, NEW.recipient_id, NEW.category, NEW.title, NEW.body, NEW.link_kind, NEW.link_id, NEW.dedupe_key, NEW.created_at)
     IS DISTINCT FROM (OLD.id, OLD.recipient_id, OLD.category, OLD.title, OLD.body, OLD.link_kind, OLD.link_id, OLD.dedupe_key, OLD.created_at)
     OR (OLD.read_at IS NOT NULL AND NEW.read_at IS DISTINCT FROM OLD.read_at) THEN
    RAISE EXCEPTION 'Notification identity, content and read state are immutable once set' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER notification_integrity BEFORE UPDATE ON palito.notifications FOR EACH ROW EXECUTE FUNCTION palito.check_notification_change();
CREATE TRIGGER notification_no_delete BEFORE DELETE ON palito.notifications FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR(80) NOT NULL,
  dedupe_key VARCHAR(180) NOT NULL,
  aggregate_kind VARCHAR(40) NOT NULL,
  aggregate_id UUID NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  next_attempt_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  locked_until TIMESTAMPTZ(3),
  lock_owner VARCHAR(120),
  last_error_code VARCHAR(80),
  processed_at TIMESTAMPTZ(3),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (length(btrim(topic)) > 0 AND length(btrim(dedupe_key)) > 0 AND length(btrim(aggregate_kind)) > 0),
  CHECK (jsonb_typeof(payload) = 'object'),
  CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'DEAD_LETTER')),
  CHECK (attempts >= 0 AND max_attempts BETWEEN 1 AND 20)
);
CREATE UNIQUE INDEX outbox_events_dedupe_key_key ON palito.outbox_events(dedupe_key);
CREATE INDEX outbox_events_status_next_attempt_at_id_idx ON palito.outbox_events(status, next_attempt_at, id);
CREATE INDEX outbox_events_aggregate_kind_aggregate_id_idx ON palito.outbox_events(aggregate_kind, aggregate_id);
CREATE TRIGGER outbox_events_no_delete BEFORE DELETE ON palito.outbox_events FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.job_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outbox_event_id UUID NOT NULL,
  attempt_number INTEGER NOT NULL,
  worker_id VARCHAR(120) NOT NULL,
  outcome VARCHAR(20) NOT NULL DEFAULT 'STARTED',
  provider_ref VARCHAR(120),
  error_code VARCHAR(80),
  started_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMPTZ(3),
  CHECK (attempt_number > 0 AND length(btrim(worker_id)) > 0),
  CHECK (outcome IN ('STARTED', 'SUCCEEDED', 'FAILED', 'RECONCILED')),
  CONSTRAINT job_attempts_outbox_event_id_fkey FOREIGN KEY (outbox_event_id) REFERENCES palito.outbox_events(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX job_attempts_outbox_event_id_attempt_number_key ON palito.job_attempts(outbox_event_id, attempt_number);
CREATE TRIGGER job_attempts_no_delete BEFORE DELETE ON palito.job_attempts FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.reminder_adherence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  local_date DATE NOT NULL,
  status VARCHAR(12) NOT NULL,
  recorded_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('taken', 'skipped')),
  CONSTRAINT reminder_adherence_events_reminder_id_fkey FOREIGN KEY (reminder_id) REFERENCES palito.care_reminders(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT reminder_adherence_events_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX reminder_adherence_events_reminder_id_local_date_key ON palito.reminder_adherence_events(reminder_id, local_date);
CREATE INDEX reminder_adherence_events_owner_id_recorded_at_idx ON palito.reminder_adherence_events(owner_id, recorded_at);
CREATE TRIGGER immutable_adherence_events BEFORE UPDATE OR DELETE ON palito.reminder_adherence_events FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_kind VARCHAR(20) NOT NULL,
  action VARCHAR(80) NOT NULL,
  target_kind VARCHAR(40) NOT NULL,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (actor_kind IN ('USER', 'WORKER', 'PROVIDER', 'SYSTEM')),
  CHECK (length(btrim(action)) > 0 AND length(btrim(target_kind)) > 0),
  CHECK (jsonb_typeof(metadata) = 'object'),
  CONSTRAINT audit_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX audit_events_target_kind_target_id_created_at_idx ON palito.audit_events(target_kind, target_id, created_at);
CREATE INDEX audit_events_created_at_id_idx ON palito.audit_events(created_at, id);
CREATE TRIGGER immutable_audit_events BEFORE UPDATE OR DELETE ON palito.audit_events FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE FUNCTION palito.check_private_file_delete() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status = 'READY' OR OLD.expires_at >= CURRENT_TIMESTAMP THEN
    RAISE EXCEPTION 'Ready or unexpired private files cannot be deleted' USING ERRCODE = '23514';
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER private_file_delete_guard BEFORE DELETE ON palito.private_files FOR EACH ROW EXECUTE FUNCTION palito.check_private_file_delete();

GRANT SELECT, INSERT, UPDATE ON palito.notification_preferences, palito.notifications, palito.outbox_events, palito.job_attempts TO palito_runtime;
GRANT SELECT, INSERT ON palito.reminder_adherence_events, palito.audit_events TO palito_runtime;
GRANT DELETE ON palito.private_files TO palito_runtime;

COMMIT;
