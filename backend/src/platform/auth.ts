import { Inject, Injectable, SetMetadata, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { FirebaseIdentity } from '../identity/firebase.js';
import { Accounts, type AccountPrincipal } from '../identity/accounts.js';
import { Sessions, SESSION_COOKIE, cookieValue } from '../identity/sessions.js';
export const PUBLIC_ROUTE = Symbol('PUBLIC_ROUTE');
export const Public = () => SetMetadata(PUBLIC_ROUTE, true);
export interface Principal { userId: string; }
export interface IdentityVerifier { verifyIdToken(token: string): Promise<Principal | null>; }
export const IDENTITY_VERIFIER = Symbol('IDENTITY_VERIFIER');
@Injectable()
export class DisabledIdentityVerifier implements IdentityVerifier { async verifyIdToken(): Promise<null> { return null; } }
@Injectable()
export class FirebaseVerifier implements IdentityVerifier {
  constructor(private readonly firebase: FirebaseIdentity, private readonly accounts: Accounts) {}
  async verifyIdToken(token: string) { return this.accounts.principal(await this.firebase.verify(token)); }
}
export type AuthRequest = Request & { principal: AccountPrincipal };
@Injectable()
export class IdentityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, @Inject(IDENTITY_VERIFIER) private readonly verifier: IdentityVerifier, private readonly firebase: FirebaseIdentity, private readonly accounts: Accounts, private readonly sessions: Sessions) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const cookie = cookieValue(request, SESSION_COOKIE);
    if (cookie && request.headers.authorization) throw new UnauthorizedException();
    if (cookie) {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) this.sessions.checkCsrf(request);
      const parts = cookie.split('~');
      if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[1]!)) throw new UnauthorizedException();
      const identity = await this.firebase.verify(parts[0]!, true);
      await this.sessions.check(cookie, identity.uid);
      request.principal = await this.accounts.principal(identity);
      return true;
    }
    const match = /^Bearer ([^\s]+)$/.exec(request.headers.authorization ?? '');
    const principal = match ? await this.verifier.verifyIdToken(match[1]!) : null;
    if (!principal) throw new UnauthorizedException();
    request.principal = principal as AccountPrincipal;
    return true;
  }
}
