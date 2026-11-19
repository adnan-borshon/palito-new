BEGIN;

ALTER TABLE palito.ledger_accounts
  DROP CONSTRAINT ledger_accounts_account_kind_check,
  ADD CONSTRAINT ledger_accounts_account_kind_check
    CHECK (account_kind IN ('USER_WALLET', 'BANK_POOL', 'BANK_RECEIVABLE', 'INSURER_POOL', 'PLATFORM_ESCROW', 'PROVIDER_CLEARING'));

ALTER TABLE palito.ledger_transactions
  DROP CONSTRAINT ledger_transactions_reference_kind_check,
  ADD CONSTRAINT ledger_transactions_reference_kind_check
    CHECK (reference_kind IN ('LOAN_DISBURSEMENT', 'LOAN_REPAYMENT', 'CARE_FEE', 'POLICY_PREMIUM', 'CLAIM_SETTLEMENT', 'REVERSAL', 'SANDBOX_TOPUP'));

CREATE TABLE palito.insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  insurer_organization_id UUID NOT NULL,
  evidence_file_id UUID,
  renewed_from_policy_id UUID,
  policy_version INTEGER NOT NULL DEFAULT 1,
  term_version VARCHAR(32) NOT NULL DEFAULT 'ins-sandbox-v1',
  consent_version VARCHAR(32) NOT NULL DEFAULT 'ins-sandbox-v1',
  coverage_minor BIGINT NOT NULL,
  premium_minor BIGINT NOT NULL,
  term_months INTEGER NOT NULL,
  waiting_days INTEGER NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
  decision_note VARCHAR(1000) NOT NULL DEFAULT '',
  decided_by_id UUID,
  decided_at TIMESTAMPTZ(3),
  premium_payment_intent_id UUID,
  premium_confirmed_at TIMESTAMPTZ(3),
  starts_at TIMESTAMPTZ(3),
  ends_at TIMESTAMPTZ(3),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (policy_version > 0 AND version > 0),
  CHECK (term_version = 'ins-sandbox-v1' AND consent_version = 'ins-sandbox-v1'),
  CHECK (coverage_minor > 0 AND premium_minor > 0 AND premium_minor <= coverage_minor),
  CHECK (term_months BETWEEN 1 AND 24 AND waiting_days BETWEEN 0 AND 90 AND currency = 'BDT'),
  CHECK (status IN ('SUBMITTED', 'APPROVED_AWAITING_PREMIUM', 'REJECTED', 'ACTIVE', 'EXPIRED', 'CLAIMED', 'CANCELLED')),
  CHECK (
    (status IN ('SUBMITTED', 'APPROVED_AWAITING_PREMIUM', 'REJECTED', 'CANCELLED') AND premium_confirmed_at IS NULL)
    OR (status IN ('ACTIVE', 'EXPIRED', 'CLAIMED') AND premium_confirmed_at IS NOT NULL AND starts_at IS NOT NULL AND ends_at IS NOT NULL AND ends_at > starts_at)
  ),
  CONSTRAINT insurance_policies_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT insurance_policies_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT insurance_policies_insurer_organization_id_fkey FOREIGN KEY (insurer_organization_id) REFERENCES palito.organizations(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT insurance_policies_evidence_file_id_fkey FOREIGN KEY (evidence_file_id) REFERENCES palito.private_files(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT insurance_policies_renewed_from_policy_id_fkey FOREIGN KEY (renewed_from_policy_id) REFERENCES palito.insurance_policies(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT insurance_policies_decided_by_id_fkey FOREIGN KEY (decided_by_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT insurance_policies_premium_payment_intent_id_fkey FOREIGN KEY (premium_payment_intent_id) REFERENCES palito.payment_intents(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX insurance_policies_renewed_from_policy_id_key ON palito.insurance_policies(renewed_from_policy_id);
CREATE UNIQUE INDEX insurance_policies_premium_payment_intent_id_key ON palito.insurance_policies(premium_payment_intent_id);
CREATE INDEX insurance_policies_farmer_id_created_at_id_idx ON palito.insurance_policies(farmer_id, created_at, id);
CREATE INDEX insurance_policies_insurer_organization_id_status_created_a_idx ON palito.insurance_policies(insurer_organization_id, status, created_at);
CREATE INDEX insurance_policies_animal_id_status_idx ON palito.insurance_policies(animal_id, status);
CREATE UNIQUE INDEX one_live_policy_per_animal ON palito.insurance_policies(animal_id) WHERE (status IN ('SUBMITTED', 'APPROVED_AWAITING_PREMIUM', 'ACTIVE'));
CREATE TRIGGER insurance_policies_no_delete BEFORE DELETE ON palito.insurance_policies FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  insurer_organization_id UUID NOT NULL,
  incident_kind VARCHAR(32) NOT NULL,
  incident_at TIMESTAMPTZ(3) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  claimed_amount_minor BIGINT NOT NULL,
  approved_amount_minor BIGINT,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
  review_target_at TIMESTAMPTZ(3) NOT NULL,
  decision_note VARCHAR(1000) NOT NULL DEFAULT '',
  decided_by_id UUID,
  decided_at TIMESTAMPTZ(3),
  settled_at TIMESTAMPTZ(3),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (incident_kind IN ('DEATH')),
  CHECK (length(btrim(description)) > 0 AND claimed_amount_minor > 0 AND currency = 'BDT' AND version > 0),
  CHECK (approved_amount_minor IS NULL OR (approved_amount_minor > 0 AND approved_amount_minor <= claimed_amount_minor)),
  CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'REFERRED_TO_VET', 'VET_REVIEWED', 'APPROVED', 'REJECTED', 'SETTLING', 'SETTLED')),
  CHECK (review_target_at > created_at),
  CONSTRAINT insurance_claims_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES palito.insurance_policies(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT insurance_claims_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT insurance_claims_farmer_id_fkey FOREIGN KEY (farmer_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT insurance_claims_insurer_organization_id_fkey FOREIGN KEY (insurer_organization_id) REFERENCES palito.organizations(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT insurance_claims_decided_by_id_fkey FOREIGN KEY (decided_by_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX insurance_claims_farmer_id_created_at_id_idx ON palito.insurance_claims(farmer_id, created_at, id);
CREATE INDEX insurance_claims_insurer_organization_id_status_created_at_idx ON palito.insurance_claims(insurer_organization_id, status, created_at);
CREATE INDEX insurance_claims_policy_id_status_idx ON palito.insurance_claims(policy_id, status);
CREATE UNIQUE INDEX one_live_claim_per_policy ON palito.insurance_claims(policy_id) WHERE (status IN ('SUBMITTED', 'UNDER_REVIEW', 'REFERRED_TO_VET', 'VET_REVIEWED', 'APPROVED', 'SETTLING', 'SETTLED'));
CREATE TRIGGER insurance_claims_no_delete BEFORE DELETE ON palito.insurance_claims FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.claim_evidence_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL,
  file_id UUID NOT NULL,
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT claim_evidence_links_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES palito.insurance_claims(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT claim_evidence_links_file_id_fkey FOREIGN KEY (file_id) REFERENCES palito.private_files(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX claim_evidence_links_file_id_idx ON palito.claim_evidence_links(file_id);
CREATE UNIQUE INDEX claim_evidence_links_claim_id_file_id_key ON palito.claim_evidence_links(claim_id, file_id);
CREATE TRIGGER immutable_claim_evidence_links BEFORE UPDATE OR DELETE ON palito.claim_evidence_links FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.claim_referral_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  vet_id UUID NOT NULL,
  referred_by_id UUID NOT NULL,
  note VARCHAR(1000) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  expires_at TIMESTAMPTZ(3) NOT NULL,
  completed_at TIMESTAMPTZ(3),
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (length(btrim(note)) > 0 AND status IN ('ACTIVE', 'COMPLETED', 'REVOKED', 'EXPIRED') AND expires_at > created_at),
  CONSTRAINT claim_referral_grants_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES palito.insurance_claims(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT claim_referral_grants_animal_id_fkey FOREIGN KEY (animal_id) REFERENCES palito.animals(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT claim_referral_grants_vet_id_fkey FOREIGN KEY (vet_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT claim_referral_grants_referred_by_id_fkey FOREIGN KEY (referred_by_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX claim_referral_grants_claim_id_vet_id_status_idx ON palito.claim_referral_grants(claim_id, vet_id, status);
CREATE INDEX claim_referral_grants_vet_id_status_expires_at_idx ON palito.claim_referral_grants(vet_id, status, expires_at);
CREATE TRIGGER claim_referral_grants_no_delete BEFORE DELETE ON palito.claim_referral_grants FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.claim_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL,
  author_id UUID NOT NULL,
  author_role VARCHAR(24) NOT NULL,
  kind VARCHAR(32) NOT NULL,
  recommendation VARCHAR(32) NOT NULL,
  notes VARCHAR(2000) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (author_role IN ('INSURER_STAFF', 'VET')),
  CHECK (kind IN ('ADVISORY_CHECK', 'VET_OPINION', 'DECISION_REVIEW')),
  CHECK (recommendation IN ('PROCEED_TO_REVIEW', 'REFER_TO_VET', 'CONFIRM_MORTALITY', 'INCONCLUSIVE', 'REJECT_EVIDENCE', 'APPROVE', 'REJECT')),
  CHECK (length(btrim(notes)) > 0 AND jsonb_typeof(metadata) = 'object'),
  CONSTRAINT claim_reviews_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES palito.insurance_claims(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT claim_reviews_author_id_fkey FOREIGN KEY (author_id) REFERENCES palito.users(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE INDEX claim_reviews_claim_id_created_at_idx ON palito.claim_reviews(claim_id, created_at);
CREATE TRIGGER immutable_claim_reviews BEFORE UPDATE OR DELETE ON palito.claim_reviews FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

CREATE TABLE palito.claim_settlement_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL,
  payment_intent_id UUID NOT NULL,
  ledger_tx_id UUID NOT NULL,
  loan_id UUID,
  bank_organization_id UUID,
  debt_allocated_minor BIGINT NOT NULL,
  farmer_allocated_minor BIGINT NOT NULL,
  total_settled_minor BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'BDT',
  created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (debt_allocated_minor >= 0 AND farmer_allocated_minor >= 0 AND total_settled_minor > 0),
  CHECK (debt_allocated_minor + farmer_allocated_minor = total_settled_minor AND currency = 'BDT'),
  CONSTRAINT claim_settlement_allocations_claim_id_fkey FOREIGN KEY (claim_id) REFERENCES palito.insurance_claims(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT claim_settlement_allocations_payment_intent_id_fkey FOREIGN KEY (payment_intent_id) REFERENCES palito.payment_intents(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT claim_settlement_allocations_ledger_tx_id_fkey FOREIGN KEY (ledger_tx_id) REFERENCES palito.ledger_transactions(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT claim_settlement_allocations_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES palito.loans(id) ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT claim_settlement_allocations_bank_organization_id_fkey FOREIGN KEY (bank_organization_id) REFERENCES palito.organizations(id) ON DELETE RESTRICT ON UPDATE NO ACTION
);
CREATE UNIQUE INDEX claim_settlement_allocations_claim_id_key ON palito.claim_settlement_allocations(claim_id);
CREATE UNIQUE INDEX claim_settlement_allocations_payment_intent_id_key ON palito.claim_settlement_allocations(payment_intent_id);
CREATE UNIQUE INDEX claim_settlement_allocations_ledger_tx_id_key ON palito.claim_settlement_allocations(ledger_tx_id);
CREATE INDEX claim_settlement_allocations_loan_id_idx ON palito.claim_settlement_allocations(loan_id);
CREATE TRIGGER immutable_claim_settlement_allocations BEFORE UPDATE OR DELETE ON palito.claim_settlement_allocations FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();

GRANT SELECT, INSERT ON palito.claim_evidence_links, palito.claim_reviews, palito.claim_settlement_allocations TO palito_runtime;
GRANT SELECT, INSERT, UPDATE ON palito.insurance_policies, palito.insurance_claims, palito.claim_referral_grants TO palito_runtime;

COMMIT;
