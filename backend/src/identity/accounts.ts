import { Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { staffIdentity } from './staff.js';
import { recent } from './firebase.js';
import { DatabaseService } from '../platform/database.js';

@Injectable()
export class Accounts {
  constructor(private readonly db: DatabaseService) {}
  async principal(identity: DecodedIdToken) {
    const user = await this.db.prisma.user.findUnique({ where: { firebaseUid: identity.uid }, include: { memberships: { where: { status: 'ACTIVE', organization: { status: 'ACTIVE' } }, orderBy: { id: 'asc' }, take: 100 }, vetCredential: true } });
    if (!user || user.status !== 'ACTIVE') throw new ForbiddenException();
    if(user.tokensRevokedAfter && identity.auth_time*1000<=user.tokensRevokedAfter.getTime())throw new UnauthorizedException();
    // Memberships are read from PostgreSQL every time; custom claims never grant a role.
    const privileged = identity.firebase.sign_in_provider === 'password' && identity.email_verified === true && identity.firebase.sign_in_second_factor === 'phone' && Date.now() / 1000 - identity.auth_time <= 300;
    const memberships = privileged ? user.memberships.filter(m => m.role !== 'VET' || user.vetCredential?.status === 'VERIFIED').map(m => ({ id: m.id, organizationId: m.organizationId, role: m.role })) : [];
    return { userId: user.id, displayName: user.displayName, locale: user.locale, status: user.status, memberships, capabilities: ['profile:read',...(memberships.some(m=>m.role==='ADMIN')?['identity:admin']:[])], firebaseUid: identity.uid };
  }
  async stepUp(identity: DecodedIdToken) {
    recent(identity);
    const user=await this.db.prisma.user.findUnique({where:{firebaseUid:identity.uid},include:{memberships:{where:{status:'ACTIVE'}}}});
    if(!user || user.status!=='ACTIVE')throw new ForbiddenException();
    if(user.memberships.length)staffIdentity(identity);
  }
  async onboard(identity: DecodedIdToken, displayName: string, locale: 'bn' | 'en') {
    const phone = identity.firebase.sign_in_provider === 'phone' ? identity.phone_number : undefined;
    if (!phone || !/^\+8801[3-9]\d{8}$/.test(phone)) throw new ForbiddenException();
    // UID is the only linking key. Never link by editable phone/email or import demo identities.
    const existing = await this.db.prisma.user.findUnique({ where: { firebaseUid: identity.uid } });
    if (existing) {
      if(existing.tokensRevokedAfter && identity.auth_time*1000<=existing.tokensRevokedAfter.getTime())throw new UnauthorizedException();
      if (existing.status !== 'ACTIVE') throw new ForbiddenException();
      return { id: existing.id, status: existing.status };
    }
    const user = await this.db.prisma.user.create({ data: { firebaseUid: identity.uid, displayName, locale, phoneE164: phone, status: 'ACTIVE' } });
    return { id: user.id, status: user.status };
  }
}
export type AccountPrincipal = Awaited<ReturnType<Accounts['principal']>>;
