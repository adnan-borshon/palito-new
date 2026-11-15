-- Hand-reviewed constraints/triggers/grants are authoritative alongside schema.prisma.
-- New local foundation only; production rollout/locking needs its own M10 review.
BEGIN;

ALTER TABLE palito.users ADD CONSTRAINT user_fields CHECK (
  length(btrim(firebase_uid)) > 0 AND length(btrim(display_name)) > 0
  AND locale IN ('bn','en')
  AND (phone_e164 IS NULL OR phone_e164 ~ '^\+[1-9][0-9]{7,14}$')
  AND (email_normalized IS NULL OR (email_normalized=lower(btrim(email_normalized)) AND position('@' IN email_normalized)>1))
);
ALTER TABLE palito.organizations ADD CONSTRAINT organization_name CHECK (length(btrim(name))>0);
ALTER TABLE palito.memberships ADD CONSTRAINT membership_kind_role CHECK (
  (organization_kind='PLATFORM' AND role='ADMIN') OR
  (organization_kind='BANK' AND role='BANK_STAFF') OR
  (organization_kind='INSURER' AND role='INSURER_STAFF') OR
  (organization_kind='CLINIC' AND role='VET')
);
ALTER TABLE palito.vet_credentials ADD CONSTRAINT vet_review CHECK (
  length(btrim(registration_number))>0 AND
  (status NOT IN ('VERIFIED','REJECTED') OR (reviewed_by_id IS NOT NULL AND reviewed_at IS NOT NULL AND reviewed_by_id<>user_id))
);
ALTER TABLE palito.farms ADD CONSTRAINT farm_fields CHECK (
  length(btrim(name))>0 AND length(btrim(district))>0 AND length(btrim(address))>0
  AND area_acres>0 AND area_acres<>'NaN'::numeric
);
ALTER TABLE palito.farm_memberships ADD CONSTRAINT farm_member_role CHECK (role IN ('MANAGER','CARETAKER','VIEWER'));
ALTER TABLE palito.animals ADD CONSTRAINT animal_fields CHECK (
  length(btrim(tag))>0 AND tag=upper(btrim(tag)) AND length(btrim(name))>0
  AND length(btrim(species))>0 AND length(btrim(breed))>0 AND sex IN ('female','male','unknown')
  AND birth_date>=DATE '0001-01-01' AND birth_date<=CURRENT_DATE
  AND weight_kg>0 AND weight_kg<>'NaN'::numeric
  AND estimate_minor>=0 AND currency='BDT' AND version>0
);
ALTER TABLE palito.ownership_history ADD CONSTRAINT ownership_event_fields CHECK (
  (from_owner_id IS NULL OR from_owner_id<>to_owner_id) AND length(btrim(reason))>0
);
ALTER TABLE palito.valuations ADD CONSTRAINT valuation_fields CHECK (
  version>0 AND amount_minor>=0 AND currency='BDT' AND expires_at>assessed_at AND
  ((status='DRAFT' AND approved_by_id IS NULL AND approved_at IS NULL) OR
   (status='APPROVED' AND approved_by_id IS NOT NULL AND approved_at IS NOT NULL
    AND approved_by_id<>owner_at_assessment_id AND assessor_id<>owner_at_assessment_id
    AND approved_at>=assessed_at AND approved_at<expires_at))
);
ALTER TABLE palito.appointments ADD CONSTRAINT appointment_fields CHECK (
  ends_at>starts_at AND mode IN ('video','visit') AND length(btrim(reason))>0 AND version>0
);
ALTER TABLE palito.appointments ADD CONSTRAINT vet_slot_no_overlap EXCLUDE USING gist (
  vet_id public.gist_uuid_ops WITH =,
  tstzrange(starts_at,ends_at,'[)') WITH &&
) WHERE (status IN ('REQUESTED','ACCEPTED','IN_PROGRESS'));
ALTER TABLE palito.health_records ADD CONSTRAINT health_record_fields CHECK (
  length(btrim(note))>0 AND kind IN ('observation','checkup','vaccination','treatment','death')
  AND (amends_id IS NULL OR amends_id<>id)
  AND ((source='VET' AND vet_id=author_id AND vet_id IS NOT NULL AND signed_at IS NOT NULL)
    OR (source='FARMER' AND vet_id IS NULL AND signed_at IS NULL AND appointment_id IS NULL AND kind='observation'))
);
ALTER TABLE palito.prescriptions ADD CONSTRAINT prescription_advice CHECK (length(btrim(advice))>0);
ALTER TABLE palito.prescription_items ADD CONSTRAINT prescription_item_fields CHECK (
  days>0 AND length(btrim(medicine_name))>0 AND length(btrim(dose))>0 AND length(btrim(frequency))>0
);

CREATE FUNCTION palito.reject_history_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'History must be amended with a new record' USING ERRCODE='23514';
END;
$$;
CREATE TRIGGER immutable_health_records BEFORE UPDATE OR DELETE ON palito.health_records
  FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();
CREATE TRIGGER immutable_ownership_history BEFORE UPDATE OR DELETE ON palito.ownership_history
  FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE FUNCTION palito.check_valuation() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE current_owner uuid;
BEGIN
  IF TG_OP<>'INSERT' AND OLD.status='APPROVED' THEN
    RAISE EXCEPTION 'Approved valuation versions are immutable' USING ERRCODE='23514';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  SELECT owner_id INTO current_owner FROM palito.animals WHERE id=NEW.animal_id FOR SHARE;
  IF current_owner IS DISTINCT FROM NEW.owner_at_assessment_id THEN
    RAISE EXCEPTION 'Valuation owner snapshot must match the current animal owner' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER valuation_integrity BEFORE INSERT OR UPDATE OR DELETE ON palito.valuations
  FOR EACH ROW EXECUTE FUNCTION palito.check_valuation();

CREATE FUNCTION palito.check_appointment_owner() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE current_owner uuid; current_farm uuid;
BEGIN
  IF TG_OP='UPDATE' THEN
    IF (NEW.animal_id,NEW.farm_id,NEW.farmer_id,NEW.vet_id) IS DISTINCT FROM (OLD.animal_id,OLD.farm_id,OLD.farmer_id,OLD.vet_id) THEN
      RAISE EXCEPTION 'Appointment participants are immutable' USING ERRCODE='23514';
    END IF;
  ELSE
    SELECT owner_id,farm_id INTO current_owner,current_farm FROM palito.animals WHERE id=NEW.animal_id FOR SHARE;
    IF current_owner IS DISTINCT FROM NEW.farmer_id OR current_farm IS DISTINCT FROM NEW.farm_id THEN
      RAISE EXCEPTION 'Appointment must reference the current animal owner and farm' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER appointment_owner BEFORE INSERT OR UPDATE ON palito.appointments
  FOR EACH ROW EXECUTE FUNCTION palito.check_appointment_owner();

CREATE FUNCTION palito.check_clinical_author() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE credential_status palito."CredentialStatus"; current_owner uuid;
BEGIN
  IF NEW.source='VET' THEN
    SELECT status INTO credential_status FROM palito.vet_credentials WHERE user_id=NEW.vet_id FOR SHARE;
    IF credential_status IS DISTINCT FROM 'VERIFIED'::palito."CredentialStatus" THEN
      RAISE EXCEPTION 'Clinical author must hold a verified credential' USING ERRCODE='23514';
    END IF;
  ELSE
    SELECT owner_id INTO current_owner FROM palito.animals WHERE id=NEW.animal_id FOR SHARE;
    IF current_owner IS DISTINCT FROM NEW.author_id THEN
      RAISE EXCEPTION 'Farmer observation must reference the animal owner' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER clinical_author BEFORE INSERT ON palito.health_records
  FOR EACH ROW EXECUTE FUNCTION palito.check_clinical_author();

CREATE FUNCTION palito.check_prescription_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.signed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Signed prescriptions are immutable' USING ERRCODE='23514';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER prescription_integrity BEFORE UPDATE OR DELETE ON palito.prescriptions
  FOR EACH ROW EXECUTE FUNCTION palito.check_prescription_change();

CREATE FUNCTION palito.check_prescription_item_change() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE parent_id uuid; parent_signed_at timestamptz;
BEGIN
  IF TG_OP='UPDATE' AND NEW.prescription_id<>OLD.prescription_id THEN
    RAISE EXCEPTION 'Prescription item parent is immutable' USING ERRCODE='23514';
  END IF;
  IF TG_OP='DELETE' THEN parent_id:=OLD.prescription_id; ELSE parent_id:=NEW.prescription_id; END IF;
  SELECT signed_at INTO parent_signed_at FROM palito.prescriptions WHERE id=parent_id FOR UPDATE;
  IF parent_signed_at IS NOT NULL THEN
    RAISE EXCEPTION 'Signed prescription items are immutable' USING ERRCODE='23514';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER prescription_item_integrity BEFORE INSERT OR UPDATE OR DELETE ON palito.prescription_items
  FOR EACH ROW EXECUTE FUNCTION palito.check_prescription_item_change();

-- Explicit grants: no blanket future-table privileges and no migration-history access.
GRANT SELECT,INSERT,UPDATE,DELETE ON palito.users,palito.organizations,palito.memberships,
  palito.vet_credentials,palito.farms,palito.farm_memberships,palito.animals,palito.appointments TO palito_runtime;
GRANT SELECT,INSERT ON palito.health_records,palito.ownership_history TO palito_runtime;
GRANT SELECT,INSERT,UPDATE ON palito.valuations,palito.prescriptions TO palito_runtime;
GRANT SELECT,INSERT,UPDATE,DELETE ON palito.prescription_items TO palito_runtime;
REVOKE ALL ON palito._prisma_migrations FROM palito_runtime;

COMMIT;
