import { Body, Controller, Delete, Get, Post, Req, Res, ForbiddenException } from '@nestjs/common';
import { IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import type { Request, Response } from 'express';
import { Public, type AuthRequest } from '../platform/auth.js';
import { FirebaseIdentity, recent } from './firebase.js';
import { Accounts } from './accounts.js';
import { DatabaseService } from '../platform/database.js';
import { Sessions } from './sessions.js';
class TokenDto { @IsString() @MinLength(1) @MaxLength(12000) idToken!: string; }
class OnboardDto extends TokenDto {
  @IsString() @MinLength(1) @MaxLength(120) @Matches(/\S/) displayName!: string;
  @IsIn(['bn', 'en']) locale!: 'bn' | 'en';
}
@Controller()
export class IdentityController {
  constructor(private readonly firebase: FirebaseIdentity, private readonly accounts: Accounts, private readonly sessions: Sessions, private readonly db: DatabaseService) {}
  @Public() @Get('sessions/csrf') csrf(@Req() request: Request, @Res({ passthrough: true }) response: Response) { return this.sessions.csrf(request, response); }
  @Public() @Post('sessions') async exchange(@Body() body: TokenDto, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.sessions.checkCsrf(request);
    const identity = await this.firebase.verify(body.idToken); recent(identity);
    const principal = await this.accounts.principal(identity);
    await this.sessions.clear(request, response);
    await this.sessions.save(await this.firebase.cookie(body.idToken), identity.uid, response);
    const { firebaseUid: _uid, ...safe } = principal; void _uid;
    return safe;
  }
  @Public() @Delete('sessions/current') async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    this.sessions.checkCsrf(request); await this.sessions.clear(request, response); return { signedOut: true };
  }
  @Post('sessions/revoke-all') async revoke(@Req() request: AuthRequest, @Body() body: TokenDto) {
    const identity = await this.firebase.verify(body.idToken); recent(identity);
    if(identity.uid!==request.principal.firebaseUid) throw new ForbiddenException();
    await this.accounts.stepUp(identity);
    await this.db.prisma.$transaction(async tx=>{
      await tx.user.update({where:{id:request.principal.userId},data:{tokensRevokedAfter:new Date()}});
      await tx.webSession.updateMany({where:{firebaseUid:identity.uid,revokedAt:null},data:{revokedAt:new Date()}});
      await tx.identityAudit.create({data:{actorId:request.principal.userId,subjectId:request.principal.userId,action:'ALL_SESSIONS_REVOKED'}});
    });
    await this.firebase.revoke(identity.uid); return { signedOut: true };
  }
  @Public() @Post('onboarding') async onboard(@Body() body: OnboardDto) {
    const identity = await this.firebase.verify(body.idToken); recent(identity);
    return this.accounts.onboard(identity, body.displayName.trim(), body.locale);
  }
  @Get('me') me(@Req() request: AuthRequest) { const { firebaseUid: _uid, ...safe } = request.principal; void _uid; return safe; }
  @Get('me/memberships') memberships(@Req() request: AuthRequest) { return { items: request.principal.memberships, nextCursor: null }; }
}
