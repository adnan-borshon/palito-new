BEGIN;
ALTER TABLE palito.users ADD COLUMN tokens_revoked_after TIMESTAMPTZ(3);
CREATE TABLE palito.staff_invitations (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), token_hash CHAR(64) NOT NULL UNIQUE CHECK(token_hash ~ '^[a-f0-9]{64}$'),
 email VARCHAR(254) NOT NULL CHECK(email=lower(btrim(email)) AND email LIKE '%@%'),
 organization_id UUID NOT NULL, role palito."StaffRole" NOT NULL, created_by_id UUID NOT NULL,
 expires_at TIMESTAMPTZ(3) NOT NULL, accepted_at TIMESTAMPTZ(3), revoked_at TIMESTAMPTZ(3), created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(expires_at>created_at), CHECK(NOT(accepted_at IS NOT NULL AND revoked_at IS NOT NULL))
);
CREATE INDEX staff_invitations_organization_id_created_at_idx ON palito.staff_invitations(organization_id,created_at);
CREATE TABLE palito.identity_audit (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor_id UUID, subject_id UUID, action VARCHAR(80) NOT NULL,
 organization_id UUID, created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX identity_audit_subject_id_created_at_idx ON palito.identity_audit(subject_id,created_at);
CREATE TRIGGER identity_audit_immutable BEFORE UPDATE OR DELETE ON palito.identity_audit FOR EACH ROW EXECUTE FUNCTION palito.reject_history_change();
CREATE TABLE palito.recovery_requests (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL, kind VARCHAR(20) NOT NULL CHECK(kind IN ('PHONE_CHANGE','LOST_FACTOR')),
 status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED')), reviewed_by_id UUID,
 created_at TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, reviewed_at TIMESTAMPTZ(3),
 CHECK((status='PENDING' AND reviewed_at IS NULL AND reviewed_by_id IS NULL) OR (status<>'PENDING' AND reviewed_at IS NOT NULL AND reviewed_by_id IS NOT NULL AND reviewed_by_id<>user_id))
);
CREATE INDEX recovery_requests_user_id_status_idx ON palito.recovery_requests(user_id,status);
CREATE UNIQUE INDEX recovery_one_pending ON palito.recovery_requests(user_id) WHERE status='PENDING';
GRANT SELECT,INSERT,UPDATE ON palito.staff_invitations,palito.recovery_requests TO palito_runtime;
GRANT SELECT,INSERT ON palito.identity_audit TO palito_runtime;
ALTER TABLE palito.staff_invitations ADD CONSTRAINT staff_invitations_organization_id_fkey FOREIGN KEY(organization_id) REFERENCES palito.organizations(id) ON DELETE RESTRICT;
ALTER TABLE palito.staff_invitations ADD CONSTRAINT staff_invitations_created_by_id_fkey FOREIGN KEY(created_by_id) REFERENCES palito.users(id) ON DELETE RESTRICT;
ALTER TABLE palito.identity_audit ADD CONSTRAINT identity_audit_actor_id_fkey FOREIGN KEY(actor_id) REFERENCES palito.users(id) ON DELETE RESTRICT;
ALTER TABLE palito.identity_audit ADD CONSTRAINT identity_audit_subject_id_fkey FOREIGN KEY(subject_id) REFERENCES palito.users(id) ON DELETE RESTRICT;
ALTER TABLE palito.identity_audit ADD CONSTRAINT identity_audit_organization_id_fkey FOREIGN KEY(organization_id) REFERENCES palito.organizations(id) ON DELETE RESTRICT;
ALTER TABLE palito.recovery_requests ADD CONSTRAINT recovery_requests_user_id_fkey FOREIGN KEY(user_id) REFERENCES palito.users(id) ON DELETE RESTRICT;
ALTER TABLE palito.recovery_requests ADD CONSTRAINT recovery_requests_reviewed_by_id_fkey FOREIGN KEY(reviewed_by_id) REFERENCES palito.users(id) ON DELETE RESTRICT;
COMMIT;
