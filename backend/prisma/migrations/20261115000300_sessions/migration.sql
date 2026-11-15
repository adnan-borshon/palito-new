BEGIN;
CREATE TABLE "palito"."web_sessions" (
 "token_hash" CHAR(64) PRIMARY KEY CHECK (token_hash ~ '^[a-f0-9]{64}$'),
 "firebase_uid" VARCHAR(128) NOT NULL REFERENCES palito.users(firebase_uid) ON DELETE RESTRICT,
 "expires_at" TIMESTAMPTZ(3) NOT NULL,
 "revoked_at" TIMESTAMPTZ(3),
 "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK (expires_at > created_at)
);
CREATE INDEX "web_sessions_firebase_uid_expires_at_idx" ON palito.web_sessions(firebase_uid, expires_at);
GRANT SELECT, INSERT, UPDATE ON palito.web_sessions TO palito_runtime;
COMMIT;
