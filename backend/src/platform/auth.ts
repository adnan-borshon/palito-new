import { Inject, Injectable, SetMetadata, UnauthorizedException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

export const PUBLIC_ROUTE = Symbol('PUBLIC_ROUTE');
export const Public = () => SetMetadata(PUBLIC_ROUTE, true);
export interface Principal { userId: string; }
export interface IdentityVerifier { verifyIdToken(token: string): Promise<Principal | null>; }
export const IDENTITY_VERIFIER = Symbol('IDENTITY_VERIFIER');

// No token is accepted before Firebase and server-owned memberships are implemented in M3.
@Injectable()
export class DisabledIdentityVerifier implements IdentityVerifier {
  async verifyIdToken(): Promise<null> { return null; }
}

@Injectable()
export class IdentityGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, @Inject(IDENTITY_VERIFIER) private readonly verifier: IdentityVerifier) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [context.getHandler(), context.getClass()])) return true;
    const request = context.switchToHttp().getRequest<Request & { principal?: Principal }>();
    const match = /^Bearer ([^\s]+)$/.exec(request.headers.authorization ?? '');
    const principal = match ? await this.verifier.verifyIdToken(match[1]!) : null;
    if (!principal) throw new UnauthorizedException();
    request.principal = principal;
    return true;
  }
}
