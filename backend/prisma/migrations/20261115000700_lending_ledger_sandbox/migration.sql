BEGIN;

ALTER TABLE palito.valuations
  ADD COLUMN organization_id UUID,
  ADD COLUMN notes VARCHAR(1000) NOT NULL DEFAULT '',
  ADD CONSTRAINT valuations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES palito.organizations(id) ON DELETE RESTRICT ON UPDATE NO ACTION;

CREATE TABLE palito.ledger_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_kind VARCHAR(30) NOT NULL,
  owner_user_id UUID,
  organization_id UUID,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (account_kind IN ('USER_WALLET', 'BANK_POOL', 'BANK_RECEIVABLE', 'PLATFORM_ESCROW', 'PROVIDER_CLEARING')),
  CHECK (currency = 'BDT'),
  CONSTRAINT ledger_accounts_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT ledger_accounts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES palito.organizations(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX ledger_accounts_user_wallet_uniq ON palito.ledger_accounts(account_kind, owner_user_id, currency) WHERE (owner_user_id IS NOT NULL);
CREATE UNIQUE INDEX ledger_accounts_org_uniq ON palito.ledger_accounts(account_kind, organization_id, currency) WHERE (organization_id IS NOT NULL);
CREATE UNIQUE INDEX ledger_accounts_system_uniq ON palito.ledger_accounts(account_kind, currency) WHERE (owner_user_id IS NULL AND organization_id IS NULL);
CREATE TRIGGER immutable_ledger_accounts BEFORE UPDATE OR DELETE ON palito.ledger_accounts FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.ledger_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_kind VARCHAR(40) NOT NULL,
  reference_id UUID NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  description VARCHAR(300) NOT NULL,
  reverses_tx_id UUID,
  idempotency_key VARCHAR(180) NOT NULL,
  posted_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (reference_kind IN ('LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'CARE_FEE', 'CLAIM_SETTLEMENT', 'REVERSAL', 'SANDBOX_TOPUP')),
  CHECK (currency = 'BDT' AND length(btrim(description)) > 0 AND length(btrim(idempotency_key)) > 0),
  CONSTRAINT ledger_transactions_reverses_tx_id_fkey FOREIGN KEY (reverses_tx_id) REFERENCES palito.ledger_transactions(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX ledger_transactions_reverses_tx_id_key ON palito.ledger_transactions(reverses_tx_id);
CREATE UNIQUE INDEX ledger_transactions_idempotency_key_key ON palito.ledger_transactions(idempotency_key);
CREATE INDEX ledger_transactions_reference_kind_reference_id_idx ON palito.ledger_transactions(reference_kind, reference_id);
CREATE TRIGGER immutable_ledger_transactions BEFORE UPDATE OR DELETE ON palito.ledger_transactions FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  account_id UUID NOT NULL,
  direction VARCHAR(10) NOT NULL,
  amount_minor BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (direction IN ('DEBIT', 'CREDIT') AND amount_minor > 0 AND currency = 'BDT'),
  CONSTRAINT ledger_entries_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES palito.ledger_transactions(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT ledger_entries_account_id_fkey FOREIGN KEY (account_id) REFERENCES palito.ledger_accounts(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX ledger_entries_account_id_created_at_id_idx ON palito.ledger_entries(account_id, created_at, id);
CREATE INDEX ledger_entries_transaction_id_idx ON palito.ledger_entries(transaction_id);
CREATE TRIGGER immutable_ledger_entries BEFORE UPDATE OR DELETE ON palito.ledger_entries FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE FUNCTION palito.verify_balanced_ledger_transaction() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  net_minor BIGINT;
  leg_count INTEGER;
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN direction = 'DEBIT' THEN amount_minor ELSE -amount_minor END), 0),
    COUNT(*)
  INTO net_minor, leg_count
  FROM palito.ledger_entries
  WHERE transaction_id = NEW.transaction_id;
  IF leg_count < 2 OR net_minor <> 0 THEN
    RAISE EXCEPTION 'Ledger transaction must contain balanced debit and credit legs' USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END;
$$;
CREATE CONSTRAINT TRIGGER balanced_ledger_transaction AFTER INSERT ON palito.ledger_entries DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION palito.verify_balanced_ledger_transaction();

CREATE TABLE palito.payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  kind VARCHAR(30) NOT NULL,
  target_kind VARCHAR(30) NOT NULL,
  target_id UUID NOT NULL,
  provider VARCHAR(30) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  amount_minor BIGINT NOT NULL,
  status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
  provider_ref VARCHAR(120),
  idempotency_key VARCHAR(180) NOT NULL,
  ledger_tx_id UUID,
  failure_reason VARCHAR(300),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at TIMESTAMPTZ(3),
  CHECK (kind IN ('LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'CARE_FEE', 'POLICY_PREMIUM', 'CLAIM_PAYOUT')),
  CHECK (provider IN ('SANDBOX_SIMULATOR', 'MOBILE_MONEY_PENDING', 'WALLET')),
  CHECK (currency = 'BDT' AND amount_minor > 0 AND version > 0),
  CHECK (status IN ('PENDING', 'PROVIDER_ACCEPTED', 'CONFIRMED', 'FAILED', 'CANCELLED')),
  CONSTRAINT payment_intents_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT payment_intents_ledger_tx_id_fkey FOREIGN KEY (ledger_tx_id) REFERENCES palito.ledger_transactions(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX payment_intents_provider_ref_key ON palito.payment_intents(provider_ref);
CREATE UNIQUE INDEX payment_intents_ledger_tx_id_key ON palito.payment_intents(ledger_tx_id);
CREATE UNIQUE INDEX payment_intents_actor_id_kind_idempotency_key_key ON palito.payment_intents(actor_id, kind, idempotency_key);
CREATE INDEX payment_intents_target_kind_target_id_created_at_idx ON palito.payment_intents(target_kind, target_id, created_at);
CREATE TRIGGER payment_intents_no_delete BEFORE DELETE ON palito.payment_intents FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.provider_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(30) NOT NULL,
  external_event_id VARCHAR(160) NOT NULL,
  payment_intent_id UUID,
  event_type VARCHAR(40) NOT NULL,
  amount_minor BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  payload JSONB NOT NULL,
  signature_verified BOOLEAN NOT NULL,
  processed_at TIMESTAMPTZ(3),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (amount_minor >= 0 AND currency = 'BDT' AND jsonb_typeof(payload) = 'object'),
  CONSTRAINT provider_events_payment_intent_id_fkey FOREIGN KEY (payment_intent_id) REFERENCES palito.payment_intents(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX provider_events_provider_external_event_id_key ON palito.provider_events(provider, external_event_id);
CREATE INDEX provider_events_payment_intent_id_idx ON palito.provider_events(payment_intent_id);
CREATE TRIGGER provider_events_no_delete BEFORE DELETE ON palito.provider_events FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.loan_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  valuation_id UUID NOT NULL,
  valuation_version INTEGER NOT NULL,
  bank_organization_id UUID NOT NULL,
  term_version VARCHAR(32) NOT NULL DEFAULT 'sandbox-v1',
  approved_value_minor BIGINT NOT NULL,
  max_principal_minor BIGINT NOT NULL,
  requested_principal_minor BIGINT NOT NULL,
  annual_rate_bps INTEGER NOT NULL,
  fee_minor BIGINT NOT NULL DEFAULT 0,
  term_months INTEGER NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  expires_at TIMESTAMPTZ(3) NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (valuation_version > 0 AND approved_value_minor > 0 AND max_principal_minor > 0),
  CHECK (max_principal_minor <= (approved_value_minor / 10) * 7 + ((approved_value_minor % 10) * 7) / 10),
  CHECK (requested_principal_minor > 0 AND requested_principal_minor <= max_principal_minor),
  CHECK (annual_rate_bps BETWEEN 0 AND 5000 AND fee_minor >= 0 AND term_months BETWEEN 1 AND 36),
  CHECK (currency = 'BDT' AND status IN ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED') AND expires_at > created_at),
  CONSTRAINT loan_quotes_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT loan_quotes_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT loan_quotes_valuation_id_fkey FOREIGN KEY (valuation_id) REFERENCES palito.valuations(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT loan_quotes_bank_organization_id_fkey FOREIGN KEY (bank_organization_id) REFERENCES palito.organizations(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX loan_quotes_animal_id_created_at_idx ON palito.loan_quotes(animal_id, created_at);
CREATE INDEX loan_quotes_farmer_id_status_idx ON palito.loan_quotes(farmer_id, status);
CREATE TRIGGER loan_quotes_no_delete BEFORE DELETE ON palito.loan_quotes FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  bank_organization_id UUID NOT NULL,
  assigned_officer_id UUID,
  purpose VARCHAR(500) NOT NULL,
  repayment_source VARCHAR(500) NOT NULL,
  term_version VARCHAR(32) NOT NULL,
  principal_minor BIGINT NOT NULL,
  total_payable_minor BIGINT NOT NULL,
  outstanding_minor BIGINT NOT NULL,
  term_months INTEGER NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  status VARCHAR(24) NOT NULL DEFAULT 'SUBMITTED',
  decision_note VARCHAR(1000) NOT NULL DEFAULT '',
  decided_by_id UUID,
  decided_at TIMESTAMPTZ(3),
  disbursed_at TIMESTAMPTZ(3),
  accepted_terms_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (length(btrim(purpose)) > 0 AND length(btrim(repayment_source)) > 0 AND length(btrim(term_version)) > 0),
  CHECK (principal_minor > 0 AND total_payable_minor >= principal_minor AND outstanding_minor >= 0 AND outstanding_minor <= total_payable_minor),
  CHECK (term_months BETWEEN 1 AND 36 AND currency = 'BDT' AND version > 0),
  CHECK (status IN ('SUBMITTED', 'APPROVED', 'REJECTED', 'DISBURSING', 'ACTIVE', 'PAID', 'SETTLED', 'CANCELLED')),
  CONSTRAINT loans_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES palito.loan_quotes(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT loans_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT loans_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT loans_bank_organization_id_fkey FOREIGN KEY (bank_organization_id) REFERENCES palito.organizations(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT loans_assigned_officer_id_fkey FOREIGN KEY (assigned_officer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT loans_decided_by_id_fkey FOREIGN KEY (decided_by_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX loans_quote_id_key ON palito.loans(quote_id);
CREATE INDEX loans_farmer_id_created_at_id_idx ON palito.loans(farmer_id, created_at, id);
CREATE INDEX loans_bank_organization_id_status_created_at_idx ON palito.loans(bank_organization_id, status, created_at);
CREATE TRIGGER loans_no_delete BEFORE DELETE ON palito.loans FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.collateral_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL,
  loan_id UUID,
  quote_id UUID,
  farmer_id UUID NOT NULL,
  bank_organization_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'HELD',
  expires_at TIMESTAMPTZ(3) NOT NULL,
  released_at TIMESTAMPTZ(3),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('HELD', 'ACTIVE', 'RELEASED', 'EXPIRED')),
  CONSTRAINT collateral_reservations_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT collateral_reservations_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES palito.loans(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT collateral_reservations_quote_id_fkey FOREIGN KEY (quote_id) REFERENCES palito.loan_quotes(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT collateral_reservations_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT collateral_reservations_bank_organization_id_fkey FOREIGN KEY (bank_organization_id) REFERENCES palito.organizations(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX collateral_reservations_loan_id_key ON palito.collateral_reservations(loan_id);
CREATE UNIQUE INDEX collateral_reservations_quote_id_key ON palito.collateral_reservations(quote_id);
CREATE INDEX collateral_reservations_animal_id_status_idx ON palito.collateral_reservations(animal_id, status);
CREATE UNIQUE INDEX one_live_collateral_per_animal ON palito.collateral_reservations(animal_id) WHERE (status IN ('HELD', 'ACTIVE'));
CREATE TRIGGER collateral_reservations_no_delete BEFORE DELETE ON palito.collateral_reservations FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.loan_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL,
  installment_number INTEGER NOT NULL,
  due_at TIMESTAMPTZ(3) NOT NULL,
  principal_minor BIGINT NOT NULL,
  fee_minor BIGINT NOT NULL DEFAULT 0,
  paid_minor BIGINT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'DUE',
  grace_reason VARCHAR(500),
  grace_until TIMESTAMPTZ(3),
  version INTEGER NOT NULL DEFAULT 1,
  CHECK (installment_number >= 1 AND principal_minor >= 0 AND fee_minor >= 0),
  CHECK (paid_minor >= 0 AND paid_minor <= principal_minor + fee_minor AND version > 0),
  CHECK (status IN ('DUE', 'PARTIAL', 'PAID', 'GRACE')),
  CONSTRAINT loan_installments_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES palito.loans(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX loan_installments_loan_id_installment_number_key ON palito.loan_installments(loan_id, installment_number);
CREATE TRIGGER loan_installments_no_delete BEFORE DELETE ON palito.loan_installments FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.repayment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id UUID NOT NULL,
  loan_id UUID NOT NULL,
  installment_id UUID NOT NULL,
  amount_minor BIGINT NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (amount_minor > 0),
  CONSTRAINT repayment_allocations_payment_intent_id_fkey FOREIGN KEY (payment_intent_id) REFERENCES palito.payment_intents(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT repayment_allocations_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES palito.loans(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT repayment_allocations_installment_id_fkey FOREIGN KEY (installment_id) REFERENCES palito.loan_installments(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX repayment_allocations_loan_id_created_at_idx ON palito.repayment_allocations(loan_id, created_at);
CREATE INDEX repayment_allocations_payment_intent_id_idx ON palito.repayment_allocations(payment_intent_id);
CREATE TRIGGER immutable_repayment_allocations BEFORE UPDATE OR DELETE ON palito.repayment_allocations FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.finance_commands (
  actor_id UUID NOT NULL,
  key VARCHAR(100) NOT NULL,
  operation VARCHAR(160) NOT NULL,
  payload_hash CHAR(64) NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT finance_commands_pkey PRIMARY KEY (actor_id, key),
  CHECK (key ~ '^[A-Za-z0-9_-]{8,100}$'),
  CHECK (payload_hash ~ '^[a-f0-9]{64}$'),
  CHECK (jsonb_typeof(result) = 'object'),
  CONSTRAINT finance_commands_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE TRIGGER immutable_finance_commands BEFORE UPDATE OR DELETE ON palito.finance_commands FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

GRANT SELECT, INSERT ON palito.ledger_accounts, palito.ledger_transactions, palito.ledger_entries, palito.repayment_allocations, palito.finance_commands TO palito_runtime;
GRANT SELECT, INSERT, UPDATE ON palito.payment_intents, palito.provider_events, palito.loan_quotes, palito.loans, palito.collateral_reservations, palito.loan_installments TO palito_runtime;

COMMIT;
