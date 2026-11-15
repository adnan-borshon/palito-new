import type { UserRecord } from 'firebase-admin/auth';
import type { PrismaClient } from '../generated/prisma/client.js';
export async function bootstrapFirstAdministrator(prisma: PrismaClient, candidate: UserRecord, execute: boolean) {
  if(candidate.disabled || !candidate.emailVerified || !candidate.email || !candidate.providerData.some(p=>p.providerId==='password') || !candidate.multiFactor?.enrolledFactors.some(f=>f.factorId==='phone')) throw new Error('First administrator requires verified email/password and enrolled SMS MFA');
  if(!execute)return {ready:true,changed:false};
  return prisma.$transaction(async tx=>{
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(728314003)`;
    if(await tx.membership.findFirst({where:{role:'ADMIN'}}))throw new Error('First administrator has already been provisioned');
    const existing=await tx.user.findUnique({where:{firebaseUid:candidate.uid}});
    if(existing && existing.status!=='ACTIVE')throw new Error('Candidate is not active');
    const user=existing??await tx.user.create({data:{firebaseUid:candidate.uid,displayName:'Platform administrator',emailNormalized:candidate.email!.toLowerCase(),status:'ACTIVE'}});
    const organization=await tx.organization.create({data:{kind:'PLATFORM',name:'Palito administration',status:'ACTIVE'}});
    await tx.membership.create({data:{userId:user.id,organizationId:organization.id,organizationKind:'PLATFORM',role:'ADMIN',status:'ACTIVE'}});
    await tx.identityAudit.create({data:{actorId:user.id,subjectId:user.id,organizationId:organization.id,action:'INITIAL_ADMIN_PROVISIONED'}});
    return {ready:true,changed:true};
  });
}
