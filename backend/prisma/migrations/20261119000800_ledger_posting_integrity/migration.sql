BEGIN;
-- Sandbox postings currently use one debit and one credit per transaction.
-- Prevent later inserts from changing a previously posted transaction.
CREATE UNIQUE INDEX ledger_entries_transaction_id_direction_key ON palito.ledger_entries(transaction_id, direction);

CREATE FUNCTION palito.verify_ledger_header() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE debit_account uuid; credit_account uuid;
BEGIN
  SELECT account_id INTO debit_account FROM palito.ledger_entries
    WHERE transaction_id = NEW.id AND direction = 'DEBIT';
  SELECT account_id INTO credit_account FROM palito.ledger_entries
    WHERE transaction_id = NEW.id AND direction = 'CREDIT';
  IF debit_account IS NULL OR credit_account IS NULL OR debit_account = credit_account THEN
    RAISE EXCEPTION 'Ledger posting requires a debit and credit in different accounts' USING ERRCODE = '23514';
  END IF;
  RETURN NULL;
END;
$$;
CREATE CONSTRAINT TRIGGER complete_ledger_posting AFTER INSERT ON palito.ledger_transactions
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION palito.verify_ledger_header();
COMMIT;
