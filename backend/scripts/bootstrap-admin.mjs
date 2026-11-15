// Offline operator command. No public API, default credential or identity creation.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../dist/generated/prisma/client.js';
import { bootstrapFirstAdministrator } from '../dist/identity/bootstrap-admin.js';
import { loadConfig } from '../dist/platform/config.js';
let prisma;
try {
 const config=loadConfig(process.env);
 const uid=process.env.BOOTSTRAP_ADMIN_UID;
 if(!uid || config.AUTH_MODE==='disabled')throw new Error('Configure identity and candidate UID');
 const app=initializeApp({projectId:config.FIREBASE_PROJECT_ID,...(config.AUTH_MODE==='firebase'?{credential:applicationDefault()}:{})},'palito-admin-bootstrap');
 const candidate=await getAuth(app).getUser(uid);
 prisma=new PrismaClient({adapter:new PrismaPg({connectionString:config.DATABASE_URL},{schema:'palito'})});
 const result=await bootstrapFirstAdministrator(prisma,candidate,process.argv.includes('--execute'));
 process.stdout.write(result.changed?'First administrator provisioned and audited.\n':'Dry run passed. No data changed.\n');
} catch { process.stderr.write('Administrator bootstrap refused. Check prerequisites and the one-time operator runbook.\n');process.exitCode=1; }
finally {await prisma?.$disconnect();}
