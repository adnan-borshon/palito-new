import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken, type Auth } from 'firebase-admin/auth';
import { APP_CONFIG, type AppConfig } from '../platform/config.js';

export function validateIdentity(token: DecodedIdToken, project: string, now = Date.now() / 1000): DecodedIdToken {
  if (token.aud !== project || token.iss !== `https://securetoken.google.com/${project}` || !token.uid || token.sub !== token.uid || token.uid.length > 128 || !Number.isFinite(token.exp) || !Number.isFinite(token.iat) || token.exp <= now || token.iat > now + 30 || !Number.isFinite(token.auth_time) || token.auth_time > now + 30) throw new UnauthorizedException();
  return token;
}
export function recent(token: DecodedIdToken): void {
  if (Date.now() / 1000 - token.auth_time > 300) throw new UnauthorizedException();
}
@Injectable()
export class FirebaseIdentity {
  private readonly auth?: Auth;
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    if (config.AUTH_MODE === 'disabled') return;
    const name = `palito-${config.FIREBASE_PROJECT_ID}`;
    const app = getApps().find(app => app.name === name) ?? initializeApp({ projectId: config.FIREBASE_PROJECT_ID, ...(config.AUTH_MODE === 'firebase' ? { credential: applicationDefault() } : {}) }, name);
    this.auth = getAuth(app);
  }
  private enabled(): Auth { if (!this.auth) throw new UnauthorizedException(); return this.auth; }
  async verify(token: string, session = false): Promise<DecodedIdToken> {
    if (token.length > 12000) throw new UnauthorizedException();
    try {
      const auth = this.enabled();
      const decoded = session ? await auth.verifySessionCookie(token, true) : await auth.verifyIdToken(token, true);
      // Firebase session cookies use a different issuer; Admin SDK checks their signature/audience.
      if (session) {
        if (decoded.aud !== this.config.FIREBASE_PROJECT_ID || decoded.iss !== `https://session.firebase.google.com/${this.config.FIREBASE_PROJECT_ID}`) throw new UnauthorizedException();
        return validateIdentity({ ...decoded, iss: `https://securetoken.google.com/${this.config.FIREBASE_PROJECT_ID}` }, this.config.FIREBASE_PROJECT_ID);
      }
      return validateIdentity(decoded, this.config.FIREBASE_PROJECT_ID);
    } catch { throw new UnauthorizedException(); }
  }
  async cookie(token: string): Promise<string> { return this.enabled().createSessionCookie(token, { expiresIn: 8 * 60 * 60 * 1000 }); }
  async revoke(uid: string): Promise<void> { await this.enabled().revokeRefreshTokens(uid); }
}
