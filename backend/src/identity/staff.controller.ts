import { Body, Controller, Post, Get, Param, Req, ParseUUIDPipe, ForbiddenException, ConflictException } from '@nestjs/common';
import { IsEmail, IsIn, IsString, IsUUID, Length, MaxLength, IsOptional, Matches } from 'class-validator';
import { Public, type AuthRequest } from '../platform/auth.js';
import { Accounts } from './accounts.js';
import { Staff, administrator, type InviteRole } from './staff.js';
import { FirebaseIdentity, recent } from './firebase.js';
import { DatabaseService } from '../platform/database.js';
class OrganizationDto { @IsString() @Length(1,160) @Matches(/\S/) name!: string; @IsIn(['BANK','INSURER','CLINIC']) kind!: 'BANK'|'INSURER'|'CLINIC'; }
class InviteDto { @IsUUID() organizationId!: string; @IsEmail() @MaxLength(254) email!: string; @IsIn(['ADMIN','VET','BANK_STAFF','INSURER_STAFF']) role!: InviteRole; }
class AcceptDto {
  @IsString() @Length(1,12000) idToken!: string;
  @IsString() @Matches(/^[a-f0-9]{64}$/) invitationToken!: string;
  @IsString() @Length(1,120) @Matches(/\S/) displayName!: string;
  @IsOptional() @IsString() @Length(1,80) registrationNumber?: string;
}
class MembershipDto { @IsIn(['SUSPENDED','REVOKED']) status!: 'SUSPENDED'|'REVOKED'; }
class StatusDto { @IsIn(['ACTIVE','SUSPENDED']) status!: 'ACTIVE'|'SUSPENDED'; }
class ContactDto { @IsString() @Length(1,12000) idToken!: string; }
class PublicRecoveryDto { @IsEmail() @MaxLength(254) email!: string; }
class CredentialDto { @IsIn(['VERIFIED','REJECTED','REVOKED']) status!: 'VERIFIED'|'REJECTED'|'REVOKED'; }
class RecoveryDto { @IsIn(['PHONE_CHANGE','LOST_FACTOR']) kind!: 'PHONE_CHANGE'|'LOST_FACTOR'; }
class ReviewDto { @IsIn(['APPROVED','REJECTED']) decision!: 'APPROVED'|'REJECTED'; }
@Controller()
export class StaffController {
  constructor(private readonly staff: Staff, private readonly firebase: FirebaseIdentity, private readonly db: DatabaseService, private readonly accounts:Accounts) {}
  @Get('staff/organizations') organizations(@Req() req:AuthRequest) { administrator(req.principal);return this.db.prisma.organization.findMany({where:{status:'ACTIVE'},select:{id:true,name:true,kind:true},orderBy:{id:'asc'},take:100}); }
  @Post('staff/organizations') organization(@Req() req:AuthRequest,@Body() body:OrganizationDto) {
    administrator(req.principal);return this.db.prisma.$transaction(async tx=>{const row=await tx.organization.create({data:{name:body.name.trim(),kind:body.kind,status:'ACTIVE'}});await tx.identityAudit.create({data:{actorId:req.principal.userId,organizationId:row.id,action:'ORGANIZATION_APPROVED'}});return row;});
  }
  @Get('staff/organizations/:id/memberships') members(@Req() req:AuthRequest,@Param('id',ParseUUIDPipe) id:string) { administrator(req.principal);return this.db.prisma.membership.findMany({where:{organizationId:id},select:{id:true,role:true,status:true,user:{select:{id:true,displayName:true,status:true,vetCredential:{select:{status:true,registrationNumber:true}}}}},orderBy:{id:'asc'},take:100}); }
  @Get('staff/recovery-requests') queue(@Req() req:AuthRequest) { administrator(req.principal);return this.db.prisma.recoveryRequest.findMany({where:{status:'PENDING'},include:{user:{select:{displayName:true,emailNormalized:true}}},orderBy:{createdAt:'asc'},take:100}); }
  @Post('staff/invitations') invite(@Req() req: AuthRequest, @Body() body: InviteDto) { return this.staff.invite(req.principal,body.organizationId,body.email,body.role); }
  @Public() @Post('staff/invitations/accept') async accept(@Body() body: AcceptDto) { return this.staff.accept(await this.firebase.verify(body.idToken),body.invitationToken,body.displayName.trim(),body.registrationNumber); }
  @Post('staff/invitations/:id/revoke') revoke(@Req() req: AuthRequest,@Param('id',ParseUUIDPipe) id:string) { return this.staff.revokeInvitation(req.principal,id); }
  @Post('staff/memberships/:id/status') membership(@Req() req: AuthRequest,@Param('id',ParseUUIDPipe) id:string,@Body() body:MembershipDto) { return this.staff.membership(req.principal,id,body.status); }
  @Get('staff/audit') audit(@Req() req: AuthRequest) { administrator(req.principal); return this.db.prisma.identityAudit.findMany({orderBy:[{createdAt:'desc'},{id:'desc'}],take:100}); }
  @Post('staff/users/:id/status') async status(@Req() req:AuthRequest,@Param('id',ParseUUIDPipe) id:string,@Body() body:StatusDto) {
    administrator(req.principal);
    if(id===req.principal.userId) throw new ForbiddenException();
    await this.db.prisma.$transaction(async tx=>{
      await tx.user.update({where:{id},data:{status:body.status,tokensRevokedAfter:new Date()}});
      await tx.webSession.updateMany({where:{user:{id},revokedAt:null},data:{revokedAt:new Date()}});
      await tx.identityAudit.create({data:{actorId:req.principal.userId,subjectId:id,action:`ACCOUNT_${body.status}`}});
    });
    return {status:body.status};
  }
  @Post('staff/vets/:id/credential') async credential(@Req() req:AuthRequest,@Param('id',ParseUUIDPipe) id:string,@Body() body:CredentialDto) {
    administrator(req.principal); if(id===req.principal.userId) throw new ForbiddenException();
    return this.db.prisma.$transaction(async tx=>{
      await tx.vetCredential.update({where:{userId:id},data:{status:body.status,reviewedById:req.principal.userId,reviewedAt:new Date()}});
      await tx.identityAudit.create({data:{actorId:req.principal.userId,subjectId:id,action:`VET_${body.status}`}});
      return {status:body.status};
    });
  }
  @Public() @Post('recovery-requests') async publicRecovery(@Body() body:PublicRecoveryDto) {
    const user=await this.db.prisma.user.findUnique({where:{emailNormalized:body.email.toLowerCase()}});
    if(user) {
      try { await this.db.prisma.recoveryRequest.create({data:{userId:user.id,kind:'LOST_FACTOR'}}); }
      catch(error) {if((error as {code?:string}).code!=='P2002') throw error;}
    }
    // No account existence, reset credential or automatic factor removal is disclosed.
    return {accepted:true};
  }
  @Post('me/recovery-requests') async recovery(@Req() req:AuthRequest,@Body() body:RecoveryDto) {
    return this.db.prisma.$transaction(async tx=>{
      const row=await tx.recoveryRequest.create({data:{userId:req.principal.userId,kind:body.kind}});
      await tx.identityAudit.create({data:{actorId:req.principal.userId,subjectId:req.principal.userId,action:'RECOVERY_REQUESTED'}});
      return {id:row.id,status:row.status};
    });
  }
  @Post('staff/recovery-requests/:id/decision') async review(@Req() req:AuthRequest,@Param('id',ParseUUIDPipe) id:string,@Body() body:ReviewDto) {
    administrator(req.principal);
    return this.db.prisma.$transaction(async tx=>{
      const row=await tx.recoveryRequest.findUniqueOrThrow({where:{id}});
      if(row.userId===req.principal.userId) throw new ForbiddenException();
      const result=await tx.recoveryRequest.updateMany({where:{id,status:'PENDING'},data:{status:body.decision,reviewedById:req.principal.userId,reviewedAt:new Date()}});
      if(result.count!==1) throw new ConflictException();
      await tx.identityAudit.create({data:{actorId:req.principal.userId,subjectId:row.userId,action:`RECOVERY_${body.decision}`}});
      return {status:body.decision};
    });
  }
  @Post('me/verified-contact') async contact(@Req() req:AuthRequest,@Body() body:ContactDto) {
    const identity=await this.firebase.verify(body.idToken);recent(identity);
    if(identity.uid!==req.principal.firebaseUid || !identity.phone_number || !/^\+8801[3-9]\d{8}$/.test(identity.phone_number)) throw new ForbiddenException();
    await this.accounts.stepUp(identity);
    await this.db.prisma.$transaction(async tx=>{
      await tx.user.update({where:{id:req.principal.userId},data:{phoneE164:identity.phone_number!,tokensRevokedAfter:new Date()}});
      await tx.webSession.updateMany({where:{firebaseUid:identity.uid,revokedAt:null},data:{revokedAt:new Date()}});
      await tx.identityAudit.create({data:{actorId:req.principal.userId,subjectId:req.principal.userId,action:'VERIFIED_CONTACT_CHANGED'}});
    });
    await this.firebase.revoke(identity.uid);
    return {reauthenticationRequired:true};
  }
}
