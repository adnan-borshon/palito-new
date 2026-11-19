BEGIN;

ALTER TABLE palito.ledger_transactions
  DROP CONSTRAINT ledger_transactions_reference_kind_check,
  ADD CONSTRAINT ledger_transactions_reference_kind_check
    CHECK (reference_kind IN ('LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'CARE_FEE', 'POLICY_PREMIUM', 'CLAIM_SETTLEMENT', 'ORDER_PAYMENT', 'ORDER_REFUND', 'REVERSAL', 'SANDBOX_TOPUP'));

ALTER TABLE palito.payment_intents
  DROP CONSTRAINT payment_intents_kind_check,
  ADD CONSTRAINT payment_intents_kind_check
    CHECK (kind IN ('LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'CARE_FEE', 'POLICY_PREMIUM', 'CLAIM_PAYOUT', 'ORDER_PAYMENT', 'ORDER_REFUND'));

CREATE TABLE palito.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number VARCHAR(80) NOT NULL,
  secret_hash CHAR(64) NOT NULL,
  firmware_version VARCHAR(40) NOT NULL DEFAULT 'iot-sandbox-v1',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (length(btrim(serial_number)) > 0 AND secret_hash ~ '^[a-f0-9]{64}$'),
  CHECK (status IN ('ACTIVE', 'RETIRED'))
);
CREATE UNIQUE INDEX devices_serial_number_key ON palito.devices(serial_number);
CREATE TRIGGER devices_no_delete BEFORE DELETE ON palito.devices FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.device_bindings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  session_epoch INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  last_sequence INTEGER NOT NULL DEFAULT 0,
  last_observed_at TIMESTAMPTZ(3),
  last_battery_pct INTEGER,
  bound_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  unbound_at TIMESTAMPTZ(3),
  version INTEGER NOT NULL DEFAULT 1,
  CHECK (session_epoch >= 1 AND last_sequence >= 0 AND version > 0),
  CHECK (last_battery_pct IS NULL OR (last_battery_pct BETWEEN 0 AND 100)),
  CHECK (status IN ('ACTIVE', 'UNBOUND')),
  CONSTRAINT device_bindings_device_id_fkey FOREIGN KEY (device_id) REFERENCES palito.devices(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT device_bindings_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT device_bindings_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX device_bindings_animal_id_status_idx ON palito.device_bindings(animal_id, status);
CREATE INDEX device_bindings_farmer_id_status_idx ON palito.device_bindings(farmer_id, status);
CREATE UNIQUE INDEX one_active_binding_per_device ON palito.device_bindings(device_id) WHERE (status = 'ACTIVE');
CREATE UNIQUE INDEX one_active_binding_per_animal ON palito.device_bindings(animal_id) WHERE (status = 'ACTIVE');
CREATE TRIGGER device_bindings_no_delete BEFORE DELETE ON palito.device_bindings FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.telemetry_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  binding_id UUID NOT NULL,
  device_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  session_epoch INTEGER NOT NULL,
  sequence_number INTEGER NOT NULL,
  temperature_c DECIMAL(4, 2) NOT NULL,
  heart_rate_bpm INTEGER NOT NULL,
  activity_index INTEGER NOT NULL,
  battery_pct INTEGER NOT NULL,
  observed_at TIMESTAMPTZ(3) NOT NULL,
  received_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (session_epoch >= 1 AND sequence_number >= 1),
  CHECK (temperature_c BETWEEN 25.00 AND 48.00 AND heart_rate_bpm BETWEEN 10 AND 300),
  CHECK (activity_index BETWEEN 0 AND 100 AND battery_pct BETWEEN 0 AND 100),
  CONSTRAINT telemetry_readings_binding_id_fkey FOREIGN KEY (binding_id) REFERENCES palito.device_bindings(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT telemetry_readings_device_id_fkey FOREIGN KEY (device_id) REFERENCES palito.devices(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT telemetry_readings_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX telemetry_readings_animal_id_observed_at_id_idx ON palito.telemetry_readings(animal_id, observed_at, id);
CREATE UNIQUE INDEX telemetry_readings_binding_id_session_epoch_sequence_number_key ON palito.telemetry_readings(binding_id, session_epoch, sequence_number);
CREATE TRIGGER immutable_telemetry_readings BEFORE UPDATE OR DELETE ON palito.telemetry_readings FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.device_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  binding_id UUID NOT NULL,
  reading_id UUID NOT NULL,
  rule_version VARCHAR(32) NOT NULL DEFAULT 'alert-sandbox-v1',
  kind VARCHAR(40) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(160) NOT NULL,
  summary VARCHAR(1000) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'OPEN',
  acknowledged_by_id UUID,
  acknowledged_at TIMESTAMPTZ(3),
  escalated_at TIMESTAMPTZ(3),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
  CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'ESCALATED') AND version > 0),
  CONSTRAINT device_alerts_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT device_alerts_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT device_alerts_binding_id_fkey FOREIGN KEY (binding_id) REFERENCES palito.device_bindings(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT device_alerts_reading_id_fkey FOREIGN KEY (reading_id) REFERENCES palito.telemetry_readings(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT device_alerts_acknowledged_by_id_fkey FOREIGN KEY (acknowledged_by_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX device_alerts_farmer_id_status_created_at_idx ON palito.device_alerts(farmer_id, status, created_at);
CREATE INDEX device_alerts_animal_id_created_at_idx ON palito.device_alerts(animal_id, created_at);
CREATE TRIGGER device_alerts_no_delete BEFORE DELETE ON palito.device_alerts FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.ai_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  modality VARCHAR(16) NOT NULL,
  prompt_text VARCHAR(2000) NOT NULL,
  transcript_text VARCHAR(2000),
  transcript_confirmed BOOLEAN NOT NULL DEFAULT false,
  media_file_id UUID,
  prompt_version VARCHAR(32) NOT NULL DEFAULT 'ai-sandbox-v1',
  model_id VARCHAR(60) NOT NULL DEFAULT 'sandbox-vet-triage-v1',
  locale VARCHAR(4) NOT NULL DEFAULT 'bn',
  status VARCHAR(24) NOT NULL,
  guidance_text VARCHAR(2000) NOT NULL,
  uncertainty_note VARCHAR(500) NOT NULL,
  suggest_vet_handoff BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (modality IN ('TEXT', 'VOICE', 'PHOTO') AND locale IN ('bn', 'en')),
  CHECK (status IN ('COMPLETED', 'PROVIDER_OUTAGE_FALLBACK') AND length(btrim(prompt_text)) > 0),
  CONSTRAINT ai_requests_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT ai_requests_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT ai_requests_media_file_id_fkey FOREIGN KEY (media_file_id) REFERENCES palito.private_files(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX ai_requests_farmer_id_created_at_id_idx ON palito.ai_requests(farmer_id, created_at, id);
CREATE INDEX ai_requests_animal_id_created_at_idx ON palito.ai_requests(animal_id, created_at);
CREATE TRIGGER immutable_ai_requests BEFORE UPDATE OR DELETE ON palito.ai_requests FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.consultation_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  vet_id UUID NOT NULL,
  issued_to_user_id UUID NOT NULL,
  room_name VARCHAR(120) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  provider VARCHAR(32) NOT NULL DEFAULT 'SANDBOX_WEBRTC',
  expires_at TIMESTAMPTZ(3) NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (expires_at > created_at AND token_hash ~ '^[a-f0-9]{64}$'),
  CONSTRAINT consultation_call_sessions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES palito.appointments(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT consultation_call_sessions_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT consultation_call_sessions_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT consultation_call_sessions_vet_id_fkey FOREIGN KEY (vet_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT consultation_call_sessions_issued_to_user_id_fkey FOREIGN KEY (issued_to_user_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX consultation_call_sessions_appointment_id_created_at_idx ON palito.consultation_call_sessions(appointment_id, created_at);
CREATE TRIGGER consultation_call_sessions_no_delete BEFORE DELETE ON palito.consultation_call_sessions FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  alert_id UUID,
  appointment_id UUID,
  assigned_vet_id UUID,
  symptoms VARCHAR(2000) NOT NULL,
  coverage_status VARCHAR(40) NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'OPEN',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (length(btrim(symptoms)) > 0 AND status IN ('OPEN', 'DISPATCHED', 'NO_COVERAGE_FALLBACK', 'CLOSED') AND version > 0),
  CONSTRAINT emergency_requests_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT emergency_requests_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT emergency_requests_alert_id_fkey FOREIGN KEY (alert_id) REFERENCES palito.device_alerts(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT emergency_requests_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES palito.appointments(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT emergency_requests_assigned_vet_id_fkey FOREIGN KEY (assigned_vet_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX emergency_requests_farmer_id_created_at_id_idx ON palito.emergency_requests(farmer_id, created_at, id);
CREATE INDEX emergency_requests_status_created_at_idx ON palito.emergency_requests(status, created_at);
CREATE TRIGGER emergency_requests_no_delete BEFORE DELETE ON palito.emergency_requests FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(60) NOT NULL,
  name_bn VARCHAR(160) NOT NULL,
  name_en VARCHAR(160) NOT NULL,
  category VARCHAR(40) NOT NULL,
  requires_prescription BOOLEAN NOT NULL DEFAULT false,
  matched_medicine_name VARCHAR(200),
  max_per_prescription_qty INTEGER NOT NULL DEFAULT 10,
  unit_price_minor BIGINT NOT NULL,
  stock_quantity INTEGER NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (unit_price_minor > 0 AND stock_quantity >= 0 AND max_per_prescription_qty >= 1 AND version > 0),
  CHECK (currency = 'BDT' AND category IN ('MEDICINE', 'SUPPLEMENT', 'FEED', 'EQUIPMENT') AND status IN ('ACTIVE', 'ARCHIVED'))
);
CREATE UNIQUE INDEX products_sku_key ON palito.products(sku);
CREATE INDEX products_category_status_created_at_idx ON palito.products(category, status, created_at);
CREATE TRIGGER products_no_delete BEFORE DELETE ON palito.products FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL,
  product_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  prescription_id UUID,
  updated_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (quantity >= 1),
  CONSTRAINT cart_items_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES palito.products(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT cart_items_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES palito.prescriptions(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX cart_items_farmer_id_product_id_key ON palito.cart_items(farmer_id, product_id);

CREATE TABLE palito.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL,
  total_minor BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  status VARCHAR(24) NOT NULL DEFAULT 'PAYMENT_PENDING',
  shipping_address VARCHAR(500) NOT NULL,
  payment_intent_id UUID,
  refund_intent_id UUID,
  cancel_reason VARCHAR(500),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (total_minor > 0 AND currency = 'BDT' AND version > 0),
  CHECK (status IN ('PAYMENT_PENDING', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  CONSTRAINT orders_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT orders_payment_intent_id_fkey FOREIGN KEY (payment_intent_id) REFERENCES palito.payment_intents(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT orders_refund_intent_id_fkey FOREIGN KEY (refund_intent_id) REFERENCES palito.payment_intents(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX orders_payment_intent_id_key ON palito.orders(payment_intent_id);
CREATE UNIQUE INDEX orders_refund_intent_id_key ON palito.orders(refund_intent_id);
CREATE INDEX orders_farmer_id_created_at_id_idx ON palito.orders(farmer_id, created_at, id);
CREATE TRIGGER orders_no_delete BEFORE DELETE ON palito.orders FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  product_id UUID NOT NULL,
  prescription_id UUID,
  quantity INTEGER NOT NULL,
  unit_price_minor BIGINT NOT NULL,
  line_total_minor BIGINT NOT NULL,
  reserved_status VARCHAR(20) NOT NULL DEFAULT 'RESERVED',
  CHECK (quantity >= 1 AND unit_price_minor > 0 AND line_total_minor = unit_price_minor * quantity),
  CHECK (reserved_status IN ('RESERVED', 'COMMITTED', 'RELEASED')),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES palito.orders(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES palito.products(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT order_items_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES palito.prescriptions(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX order_items_order_id_idx ON palito.order_items(order_id);
CREATE INDEX order_items_prescription_id_product_id_idx ON palito.order_items(prescription_id, product_id);
CREATE TRIGGER order_items_no_delete BEFORE DELETE ON palito.order_items FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.fulfillment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  status VARCHAR(24) NOT NULL,
  note VARCHAR(500) NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('PACKED', 'SHIPPED', 'DELIVERED') AND length(btrim(note)) > 0),
  CONSTRAINT fulfillment_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES palito.orders(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT fulfillment_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX fulfillment_events_order_id_created_at_idx ON palito.fulfillment_events(order_id, created_at);
CREATE TRIGGER immutable_fulfillment_events BEFORE UPDATE OR DELETE ON palito.fulfillment_events FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.educational_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL,
  title_bn VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL,
  body_bn VARCHAR(8000) NOT NULL,
  body_en VARCHAR(8000) NOT NULL,
  category VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  author_id UUID NOT NULL,
  published_by_id UUID,
  published_at TIMESTAMPTZ(3),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED') AND version > 0),
  CHECK (category IN ('HEALTH', 'NUTRITION', 'FINANCE', 'INSURANCE', 'IOT')),
  CONSTRAINT educational_contents_author_id_fkey FOREIGN KEY (author_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT educational_contents_published_by_id_fkey FOREIGN KEY (published_by_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX educational_contents_slug_key ON palito.educational_contents(slug);
CREATE INDEX educational_contents_status_created_at_id_idx ON palito.educational_contents(status, created_at, id);
CREATE TRIGGER educational_contents_no_delete BEFORE DELETE ON palito.educational_contents FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  report_kind VARCHAR(40) NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  payload_json JSONB NOT NULL,
  sha256 CHAR(64) NOT NULL,
  expires_at TIMESTAMPTZ(3) NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (report_kind IN ('SUMMARY', 'LEDGER_AUDIT', 'CLINICAL_COUNTS') AND expires_at > created_at AND sha256 ~ '^[a-f0-9]{64}$'),
  CONSTRAINT export_jobs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX export_jobs_actor_id_created_at_idx ON palito.export_jobs(actor_id, created_at);
CREATE TRIGGER immutable_export_jobs BEFORE UPDATE OR DELETE ON palito.export_jobs FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.extension_commands (
  actor_id UUID NOT NULL,
  key VARCHAR(100) NOT NULL,
  operation VARCHAR(160) NOT NULL,
  payload_hash CHAR(64) NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT extension_commands_pkey PRIMARY KEY (actor_id, key),
  CHECK (key ~ '^[A-Za-z0-9_-]{8,100}$' AND payload_hash ~ '^[a-f0-9]{64}$' AND jsonb_typeof(result) = 'object'),
  CONSTRAINT extension_commands_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE TRIGGER immutable_extension_commands BEFORE UPDATE OR DELETE ON palito.extension_commands FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

GRANT SELECT, INSERT ON palito.telemetry_readings, palito.ai_requests, palito.fulfillment_events, palito.export_jobs, palito.extension_commands TO palito_runtime;
GRANT SELECT, INSERT, UPDATE ON palito.devices, palito.device_bindings, palito.device_alerts, palito.consultation_call_sessions, palito.emergency_requests, palito.products, palito.orders, palito.order_items, palito.educational_contents TO palito_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON palito.cart_items TO palito_runtime;

COMMIT;
