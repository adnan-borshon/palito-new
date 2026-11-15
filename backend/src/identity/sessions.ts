import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { ForbiddenException, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { DatabaseService } from '../platform/database.js';
import { APP_CONFIG, type AppConfig } from '../platform/config.js';
export const SESSION_COOKIE = '__Host-palito-session';
const CSRF_COOKIE = '__Host-palito-csrf';
export const fingerprint = (token: string) => createHash('sha256').update(token).digest('hex');
export function cookieValue(request: Request, name: string): string | undefined {
  const matches = (request.headers.cookie ?? '').split(';').map(s => s.trim()).filter(s => s.startsWith(`${name}=`));
  return matches.length === 1 ? matches[0]!.slice(name.length + 1) : undefined;
}
@Injectable()
export class Sessions {
  constructor(private readonly db: DatabaseService, @Inject(APP_CONFIG) private readonly config: AppConfig) {}
  csrf(request: Request, response: Response) {
    if (request.headers.origin && request.headers.origin !== this.config.WEB_ORIGIN) throw new ForbiddenException();
    const csrfToken = randomBytes(32).toString('hex');
    response.cookie(CSRF_COOKIE, csrfToken, this.options());
    return { csrfToken };
  }
  checkCsrf(request: Request) {
    const cookie = cookieValue(request, CSRF_COOKIE);
    const header = request.headers['x-csrf-token'];
    if (request.headers.origin !== this.config.WEB_ORIGIN || typeof header !== 'string' || !cookie || !/^[a-f0-9]{64}$/.test(cookie) || header.length !== cookie.length || !timingSafeEqual(Buffer.from(header), Buffer.from(cookie))) throw new ForbiddenException();
  }
  options() { return { httpOnly: true, secure: true, sameSite: 'strict' as const, path: '/' }; }
  async save(firebaseCookie: string, uid: string, response: Response) {
    // Firebase can mint identical JWTs in one second. A per-exchange nonce makes
    // current-session revocation independent and prevents cookie reuse on login.
    const cookie = `${firebaseCookie}~${randomBytes(32).toString('hex')}`;
    await this.db.prisma.webSession.create({ data: { tokenHash: fingerprint(cookie), firebaseUid: uid, expiresAt: new Date(Date.now() + 8 * 3600000) } });
    response.cookie(SESSION_COOKIE, cookie, { ...this.options(), maxAge: 8 * 3600000 });
  }
  async check(cookie: string, uid: string) {
    const record = await this.db.prisma.webSession.findUnique({ where: { tokenHash: fingerprint(cookie) } });
    if (!record || record.firebaseUid !== uid || record.revokedAt || record.expiresAt.getTime() <= Date.now()) throw new UnauthorizedException();
  }
  async clear(request: Request, response: Response) {
    const cookie = cookieValue(request, SESSION_COOKIE);
    if (cookie) await this.db.prisma.webSession.updateMany({ where: { tokenHash: fingerprint(cookie), revokedAt: null }, data: { revokedAt: new Date() } });
    response.clearCookie(SESSION_COOKIE, this.options());
    response.clearCookie(CSRF_COOKIE, this.options());
  }
}
