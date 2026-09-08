ALTER TABLE enquiries ADD COLUMN idempotency_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_enquiries_idempotency_key
  ON enquiries(idempotency_key)
  WHERE idempotency_key IS NOT NULL;
