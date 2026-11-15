import { randomBytes } from 'node:crypto';
import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { DatabaseService } from '../platform/database.js';
import { fingerprint } from './sessions.js';
import type { AccountPrincipal } from './accounts.js';
import { recent } from './firebase.js';

export function staffIdentity(identity: DecodedIdToken) {
  recent(identity);
  if (!identity.email_verified || !identity.email || identity.firebase.sign_in_provider !== 'password' || identity.firebase.sign_in_second_factor !== 'phone') throw new ForbiddenException();
}
export function administrator(principal: AccountPrincipal) {
  if (!principal.memberships.some(m => m.role === 'ADMIN')) throw new ForbiddenException();
}
const kinds = { ADMIN: 'PLATFORM', VET: 'CLINIC', BANK_STAFF: 'BANK', INSURER_STAFF: 'INSURER' } as const;
export type InviteRole = keyof typeof kinds;
@Injectable()
export class Staff {
  constructor(private readonly db: DatabaseService) {}
  async invite(actor: AccountPrincipal, organizationId: string, email: string, role: InviteRole) {
    administrator(actor);
    const secret = randomBytes(32).toString('hex');
    const invitation = await this.db.prisma.$transaction(async tx => {
      // A transaction rechecks the administrator; stale authorization cannot approve an invitation.
      const admin = await tx.membership.findFirst({ where: { userId: actor.userId, role: 'ADMIN', status: 'ACTIVE', user: { status: 'ACTIVE' }, organization: { status: 'ACTIVE', kind: 'PLATFORM' } } });
      const org = await tx.organization.findFirst({ where: { id: organizationId, status: 'ACTIVE', kind: kinds[role] } });
      if (!admin || !org) throw new ForbiddenException();
      const row = await tx.staffInvitation.create({ data: { tokenHash: fingerprint(secret), organizationId, email: email.toLowerCase(), role, createdById: actor.userId, expiresAt: new Date(Date.now()+48*3600000) } });
      await tx.identityAudit.create({ data: { actorId: actor.userId, action: 'INVITATION_CREATED', organizationId } });
      return row;
    });
    // Return once to the administrator; no automated email or token logs.
    return { id: invitation.id, invitationToken: secret, expiresAt: invitation.expiresAt };
  }
  async accept(identity: DecodedIdToken, secret: string, displayName: string, registrationNumber?: string) {
    staffIdentity(identity);
    return this.db.prisma.$transaction(async tx => {
      const invitation = await tx.staffInvitation.findUnique({ where: { tokenHash: fingerprint(secret) } });
      if (!invitation || invitation.email !== identity.email!.toLowerCase() || invitation.acceptedAt || invitation.revokedAt || invitation.expiresAt.getTime() <= Date.now()) throw new ForbiddenException();
      const org = await tx.organization.findFirst({ where: { id: invitation.organizationId, status: 'ACTIVE', kind: kinds[invitation.role] } });
      const issuer = await tx.membership.findFirst({ where: { userId: invitation.createdById, role: 'ADMIN', status: 'ACTIVE', user: { status: 'ACTIVE' }, organization: { kind: 'PLATFORM', status: 'ACTIVE' } } });
      if (!org || !issuer) throw new ForbiddenException();
      let user = await tx.user.findUnique({ where: { firebaseUid: identity.uid } });
      if(user?.tokensRevokedAfter && identity.auth_time*1000<=user.tokensRevokedAfter.getTime())throw new ForbiddenException();
      if (user && user.status !== 'ACTIVE') throw new ForbiddenException();
      if (!user) user = await tx.user.create({ data: { firebaseUid: identity.uid, emailNormalized: identity.email!.toLowerCase(), displayName, status: 'ACTIVE' } });
      if (user.emailNormalized!==identity.email!.toLowerCase()) user=await tx.user.update({where:{id:user.id},data:{emailNormalized:identity.email!.toLowerCase()}});
      if (user.id === invitation.createdById) throw new ForbiddenException();
      const consumed = await tx.staffInvitation.updateMany({ where: { id: invitation.id, acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() } }, data: { acceptedAt: new Date() } });
      if (consumed.count !== 1) throw new ConflictException();
      await tx.membership.upsert({ where: { organizationId_userId: { organizationId: org.id, userId: user.id } }, create: { organizationId: org.id, organizationKind: org.kind, userId: user.id, role: invitation.role, status: 'ACTIVE' }, update: { status: 'ACTIVE' } });
      if (invitation.role === 'VET') {
        if (!registrationNumber) throw new ConflictException();
        await tx.vetCredential.upsert({ where: { userId: user.id }, create: { userId: user.id, registrationNumber, status: 'PENDING' }, update: {} });
      }
      await tx.identityAudit.create({ data: { actorId: user.id, subjectId: user.id, organizationId: org.id, action: 'INVITATION_ACCEPTED' } });
      return { userId: user.id, role: invitation.role, credentialReviewRequired: invitation.role === 'VET' };
    });
  }
  async revokeInvitation(actor: AccountPrincipal, id: string) {
    administrator(actor);
    return this.db.prisma.$transaction(async tx => {
      const result = await tx.staffInvitation.updateMany({ where: { id, acceptedAt: null, revokedAt: null }, data: { revokedAt: new Date() } });
      if (!result.count) throw new NotFoundException();
      await tx.identityAudit.create({ data: { actorId: actor.userId, action: 'INVITATION_REVOKED' } });
      return { revoked: true };
    });
  }
  async membership(actor: AccountPrincipal, id: string, status: 'SUSPENDED'|'REVOKED') {
    administrator(actor);
    return this.db.prisma.$transaction(async tx => {
      const row = await tx.membership.findUnique({ where: { id } });
      if (!row) throw new NotFoundException();
      if (row.userId === actor.userId || row.role === 'ADMIN') throw new ForbiddenException();
      await tx.membership.update({ where: { id }, data: { status } });
      await tx.identityAudit.create({ data: { actorId: actor.userId, subjectId: row.userId, organizationId: row.organizationId, action: `MEMBERSHIP_${status}` } });
      return { status };
    });
  }
}
