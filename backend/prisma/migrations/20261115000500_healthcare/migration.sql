BEGIN;
ALTER TABLE palito.farms ADD COLUMN version INTEGER NOT NULL DEFAULT 1 CHECK(version>0);
ALTER TABLE palito.animals ADD COLUMN photo_file_id UUID;
ALTER TABLE palito.appointments ADD COLUMN slot_id UUID, ADD COLUMN decision_note VARCHAR(1000) NOT NULL DEFAULT '';
CREATE TABLE palito.vet_profiles (
 vet_id UUID PRIMARY KEY, district VARCHAR(120) NOT NULL,species VARCHAR(40)[] NOT NULL,bio VARCHAR(1000) NOT NULL,version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 CHECK(length(trim(district))>0),CHECK(cardinality(species) BETWEEN 1 AND 4),CHECK(species <@ ARRAY['cattle','goat','buffalo','sheep']::VARCHAR(40)[]),
 CONSTRAINT vet_profiles_vet_id_fkey FOREIGN KEY(vet_id) REFERENCES palito.vet_credentials(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE TABLE palito.vet_schedules (
 vet_id UUID PRIMARY KEY, version INTEGER NOT NULL DEFAULT 0 CHECK(version>=0),
 CONSTRAINT vet_schedules_vet_id_fkey FOREIGN KEY(vet_id) REFERENCES palito.vet_credentials(user_id) ON DELETE RESTRICT
);
CREATE TABLE palito.vet_slots (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),vet_id UUID NOT NULL,starts_at TIMESTAMPTZ(3) NOT NULL,ends_at TIMESTAMPTZ(3) NOT NULL,status VARCHAR(12) NOT NULL DEFAULT 'OPEN',
 CHECK(status IN ('OPEN','BOOKED','WITHDRAWN')),CHECK(ends_at=starts_at+INTERVAL '30 minutes'),
 CONSTRAINT vet_slots_vet_id_fkey FOREIGN KEY(vet_id) REFERENCES palito.vet_credentials(user_id) ON DELETE RESTRICT
);
CREATE UNIQUE INDEX vet_slots_vet_id_starts_at_ends_at_key ON palito.vet_slots(vet_id,starts_at,ends_at);
CREATE INDEX vet_slots_vet_id_status_starts_at_idx ON palito.vet_slots(vet_id,status,starts_at);
ALTER TABLE palito.vet_slots ADD CONSTRAINT availability_no_overlap EXCLUDE USING gist(vet_id public.gist_uuid_ops WITH =,tstzrange(starts_at,ends_at,'[)') WITH &&) WHERE(status IN ('OPEN','BOOKED'));
ALTER TABLE palito.appointments ADD CONSTRAINT appointments_slot_id_fkey FOREIGN KEY(slot_id) REFERENCES palito.vet_slots(id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX one_active_appointment_per_slot ON palito.appointments(slot_id) WHERE(status IN ('REQUESTED','ACCEPTED','IN_PROGRESS'));
CREATE TABLE palito.care_grants (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),appointment_id UUID NOT NULL,farmer_id UUID NOT NULL,consent_version VARCHAR(20) NOT NULL,
 expires_at TIMESTAMPTZ(3) NOT NULL,revoked_at TIMESTAMPTZ(3),granted_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(consent_version='care-v1'),CHECK(expires_at>granted_at),
 CONSTRAINT care_grants_appointment_id_fkey FOREIGN KEY(appointment_id) REFERENCES palito.appointments(id) ON DELETE RESTRICT,
 CONSTRAINT care_grants_farmer_id_fkey FOREIGN KEY(farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT
);
CREATE UNIQUE INDEX care_grants_appointment_id_key ON palito.care_grants(appointment_id);
CREATE TABLE palito.private_files (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),animal_id UUID NOT NULL,uploader_id UUID NOT NULL,owner_at_upload_id UUID NOT NULL,purpose VARCHAR(20) NOT NULL,
 content_type VARCHAR(20) NOT NULL,declared_bytes INTEGER NOT NULL,status VARCHAR(16) NOT NULL DEFAULT 'PENDING',sha256 CHAR(64),bytes BYTEA,
 expires_at TIMESTAMPTZ(3) NOT NULL,created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(purpose IN ('animal-photo','clinical-evidence')),CHECK(content_type IN ('image/png','image/jpeg')),CHECK(declared_bytes BETWEEN 1 AND 1048576),
 CHECK(status IN ('PENDING','QUARANTINED','READY')),CHECK((status='PENDING' AND bytes IS NULL AND sha256 IS NULL) OR (status IN ('QUARANTINED','READY') AND bytes IS NOT NULL AND octet_length(bytes)<=4194304 AND sha256 ~ '^[a-f0-9]{64}$')),
 CONSTRAINT private_files_animal_id_fkey FOREIGN KEY(animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT,
 CONSTRAINT private_files_uploader_id_fkey FOREIGN KEY(uploader_id) REFERENCES palito.users(id) ON DELETE RESTRICT,
 CONSTRAINT private_files_owner_at_upload_id_fkey FOREIGN KEY(owner_at_upload_id) REFERENCES palito.users(id) ON DELETE RESTRICT
);
CREATE INDEX private_files_animal_id_status_created_at_idx ON palito.private_files(animal_id,status,created_at);
ALTER TABLE palito.animals ADD CONSTRAINT animals_photo_file_id_fkey FOREIGN KEY(photo_file_id) REFERENCES palito.private_files(id) ON DELETE RESTRICT;
CREATE TABLE palito.care_reminders (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),animal_id UUID NOT NULL,owner_id UUID NOT NULL,record_id UUID NOT NULL,due_at TIMESTAMPTZ(3) NOT NULL,enabled BOOLEAN NOT NULL DEFAULT true,version INTEGER NOT NULL DEFAULT 1 CHECK(version>0),
 CONSTRAINT care_reminders_animal_id_fkey FOREIGN KEY(animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT,
 CONSTRAINT care_reminders_owner_id_fkey FOREIGN KEY(owner_id) REFERENCES palito.users(id) ON DELETE RESTRICT,
 CONSTRAINT care_reminders_record_id_animal_id_fkey FOREIGN KEY(record_id,animal_id) REFERENCES palito.health_records(id,animal_id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX care_reminders_record_id_animal_id_key ON palito.care_reminders(record_id,animal_id);
CREATE UNIQUE INDEX care_reminders_record_id_key ON palito.care_reminders(record_id);
CREATE INDEX care_reminders_owner_id_due_at_id_idx ON palito.care_reminders(owner_id,due_at,id);
CREATE TABLE palito.care_events (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),actor_id UUID NOT NULL,animal_id UUID NOT NULL,kind VARCHAR(40) NOT NULL,payload JSONB NOT NULL,created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(jsonb_typeof(payload)='object'),
 CONSTRAINT care_events_actor_id_fkey FOREIGN KEY(actor_id) REFERENCES palito.users(id) ON DELETE RESTRICT,
 CONSTRAINT care_events_animal_id_fkey FOREIGN KEY(animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT
);
CREATE INDEX care_events_created_at_id_idx ON palito.care_events(created_at,id);
CREATE TABLE palito.care_commands (
 actor_id UUID NOT NULL,key VARCHAR(100) NOT NULL,operation VARCHAR(160) NOT NULL,payload_hash CHAR(64) NOT NULL,result JSONB NOT NULL,created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT care_commands_pkey PRIMARY KEY(actor_id,key),CHECK(key ~ '^[A-Za-z0-9_-]{8,100}$'),CHECK(payload_hash ~ '^[a-f0-9]{64}$'),CHECK(jsonb_typeof(result)='object'),
 CONSTRAINT care_commands_actor_id_fkey FOREIGN KEY(actor_id) REFERENCES palito.users(id) ON DELETE RESTRICT
);
CREATE TRIGGER immutable_care_events BEFORE UPDATE OR DELETE ON palito.care_events FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();
CREATE TRIGGER immutable_care_commands BEFORE UPDATE OR DELETE ON palito.care_commands FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();
CREATE FUNCTION palito.check_care_grant() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE booking palito.appointments;
BEGIN
 SELECT * INTO booking FROM palito.appointments WHERE id=NEW.appointment_id FOR SHARE;
 IF booking.farmer_id IS DISTINCT FROM NEW.farmer_id OR NEW.expires_at>booking.ends_at+INTERVAL '72 hours' THEN RAISE EXCEPTION 'Consent must match the booking and permitted duration' USING ERRCODE='23514';END IF;
 IF TG_OP='UPDATE' THEN
  IF (NEW.appointment_id,NEW.farmer_id,NEW.consent_version,NEW.granted_at) IS DISTINCT FROM (OLD.appointment_id,OLD.farmer_id,OLD.consent_version,OLD.granted_at) OR (OLD.revoked_at IS NOT NULL AND NEW.revoked_at IS DISTINCT FROM OLD.revoked_at) THEN RAISE EXCEPTION 'Consent identity and withdrawal are immutable' USING ERRCODE='23514';END IF;
 END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER care_grant_integrity BEFORE INSERT OR UPDATE ON palito.care_grants FOR EACH ROW EXECUTE FUNCTION palito.check_care_grant();
CREATE FUNCTION palito.check_booking_slot() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE slot palito.vet_slots;
BEGIN
 IF NEW.slot_id IS NULL THEN RETURN NEW;END IF;
 SELECT * INTO slot FROM palito.vet_slots WHERE id=NEW.slot_id FOR SHARE;
 IF (NEW.vet_id,NEW.starts_at,NEW.ends_at) IS DISTINCT FROM (slot.vet_id,slot.starts_at,slot.ends_at) THEN RAISE EXCEPTION 'Appointment must match its slot' USING ERRCODE='23514';END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER booking_slot_integrity BEFORE INSERT OR UPDATE ON palito.appointments FOR EACH ROW EXECUTE FUNCTION palito.check_booking_slot();
CREATE FUNCTION palito.check_private_file_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF (NEW.animal_id,NEW.uploader_id,NEW.owner_at_upload_id,NEW.purpose,NEW.content_type,NEW.declared_bytes,NEW.expires_at,NEW.created_at) IS DISTINCT FROM (OLD.animal_id,OLD.uploader_id,OLD.owner_at_upload_id,OLD.purpose,OLD.content_type,OLD.declared_bytes,OLD.expires_at,OLD.created_at)
 OR NOT ((OLD.status='PENDING' AND NEW.status='QUARANTINED') OR (OLD.status='QUARANTINED' AND NEW.status='READY' AND NEW.bytes=OLD.bytes AND NEW.sha256=OLD.sha256)) THEN RAISE EXCEPTION 'Private file identity and finalized bytes are immutable' USING ERRCODE='23514';END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER private_file_integrity BEFORE UPDATE ON palito.private_files FOR EACH ROW EXECUTE FUNCTION palito.check_private_file_change();
CREATE FUNCTION palito.check_animal_photo() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.photo_file_id IS NOT NULL AND (TG_OP='INSERT' OR NEW.photo_file_id IS DISTINCT FROM OLD.photo_file_id) AND NOT EXISTS(SELECT 1 FROM palito.private_files f WHERE f.id=NEW.photo_file_id AND f.animal_id=NEW.id AND f.owner_at_upload_id=NEW.owner_id AND f.status='READY' AND f.purpose='animal-photo') THEN RAISE EXCEPTION 'Photo must be a ready file for this animal and owner' USING ERRCODE='23514';END IF;
 RETURN NEW;
END;
$$;
CREATE TRIGGER animal_photo_integrity BEFORE INSERT OR UPDATE ON palito.animals FOR EACH ROW EXECUTE FUNCTION palito.check_animal_photo();
GRANT SELECT,INSERT,UPDATE ON palito.vet_profiles,palito.vet_schedules,palito.vet_slots,palito.care_grants,palito.private_files,palito.care_reminders TO palito_runtime;
GRANT SELECT,INSERT ON palito.care_events,palito.care_commands TO palito_runtime;
COMMIT;
