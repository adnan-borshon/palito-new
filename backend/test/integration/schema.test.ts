import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../src/generated/prisma/client.js';
import { seedSynthetic, SYNTHETIC_IDS as ids } from '../../src/database/synthetic.js';

const backendDir = fileURLToPath(new URL('../../../', import.meta.url));
const cli = join(dirname(createRequire(import.meta.url).resolve('prisma/package.json')), 'build/index.js');
const adminUrl = process.env.TEST_DATABASE_URL;
assert.ok(adminUrl, 'TEST_DATABASE_URL must reference a disposable local PostgreSQL test administrator');
assert.ok(['127.0.0.1','localhost','[::1]'].includes(new URL(adminUrl).hostname),'Schema tests refuse nonlocal PostgreSQL targets');
const suffix = randomUUID().replaceAll('-','');
const databaseName = `palito_m2_${suffix}`;
const upgradeName = `palito_m2_upgrade_${suffix}`;
const names = [databaseName, upgradeName];
const admin = new pg.Client({ connectionString: adminUrl });
let runtime: pg.Client;
let migrator: pg.Client;
let prisma: PrismaClient;

function urls(name: string) {
  const control = new URL(adminUrl!); control.pathname = `/${name}`;
  function password(key: string, user: string, fallback: string) {
    const configured=process.env[key];
    if (!configured) return fallback;
    const url=new URL(configured);
    return url.host===control.host && url.username===user ? decodeURIComponent(url.password) : fallback;
  }
  const migration = new URL(control); migration.username='palito_migrator'; migration.password=password('MIGRATION_DATABASE_URL','palito_migrator','synthetic-m2-migration-only'); migration.searchParams.set('schema','palito');
  const api = new URL(control); api.username='palito_runtime'; api.password=password('DATABASE_URL','palito_runtime','synthetic-m2-runtime-only'); api.searchParams.set('schema','palito');
  return { DATABASE_ADMIN_URL: control.toString(), MIGRATION_DATABASE_URL: migration.toString(), DATABASE_URL: api.toString(), NODE_ENV: 'test', SEED_SYNTHETIC: 'true' };
}

function runPrisma(args: string[], env: NodeJS.ProcessEnv) {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd: backendDir, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 60000 });
  assert.equal(result.status, 0, result.stderr + result.stdout);
  return result.stdout;
}

function bootstrap(env: NodeJS.ProcessEnv) {
  const result=spawnSync(process.execPath,[join(backendDir,'scripts/bootstrap-db.mjs')],{ cwd:backendDir,env:{...process.env,...env},encoding:'utf8',timeout:30000 });
  assert.equal(result.status,0,result.stderr);
}

async function rejected(sql: string, values: unknown[], code: string, client=runtime) {
  await assert.rejects(client.query(sql, values), error => (error as {code?:string}).code === code);
}

before(async () => {
  await admin.connect();
  for (const name of names) await admin.query(`CREATE DATABASE ${pg.escapeIdentifier(name)}`);
  const env=urls(databaseName); bootstrap(env); runPrisma(['migrate','deploy'],env);
  runtime=new pg.Client({connectionString:env.DATABASE_URL}); migrator=new pg.Client({connectionString:env.MIGRATION_DATABASE_URL});
  await runtime.connect(); await migrator.connect();
  prisma=new PrismaClient({adapter:new PrismaPg({connectionString:env.DATABASE_URL},{schema:'palito'})});
  await seedSynthetic(prisma,env); await seedSynthetic(prisma,env);
});

after(async () => {
  await prisma?.$disconnect(); await runtime?.end(); await migrator?.end();
  for(const name of names) await admin.query(`DROP DATABASE IF EXISTS ${pg.escapeIdentifier(name)} WITH (FORCE)`);
  await admin.end();
});

test('clean official migrations and idempotent synthetic seed expose typed Prisma data with exact money/date values', async () => {
  const rows=await migrator.query('SELECT migration_name FROM palito._prisma_migrations ORDER BY migration_name');
  assert.equal(rows.rowCount,3); assert.equal(await prisma.user.count(),4);
  const animal=await prisma.animal.findUniqueOrThrow({where:{id:ids.animalA}});
  assert.equal(animal.estimateMinor,14000000n); assert.equal(animal.birthDate.toISOString(),'2020-01-01T00:00:00.000Z');
  assert.equal(animal.weightKg.toFixed(3),'450.000');
  assert.equal((await prisma.vetCredential.findUniqueOrThrow({where:{userId:ids.vet}})).status,'PENDING');
  const role=await runtime.query('SELECT current_user'); assert.equal(role.rows[0].current_user,'palito_runtime');
});

test('database rejects duplicate Firebase identities, organizations/memberships and invalid organization-role combinations', async () => {
  await rejected("INSERT INTO palito.users(firebase_uid,display_name) VALUES('synthetic-m2-farmer-a','Duplicate')",[],'23505');
  await rejected("INSERT INTO palito.memberships(organization_id,organization_kind,user_id,role) VALUES($1,'BANK',$2,'BANK_STAFF')",[ids.organization,ids.reviewer],'23505');
  await rejected("INSERT INTO palito.memberships(organization_id,organization_kind,user_id,role) VALUES($1,'BANK',$2,'ADMIN')",[ids.organization,ids.farmerA],'23514');
  await rejected("INSERT INTO palito.memberships(organization_id,organization_kind,user_id,role) VALUES($1,'INSURER',$2,'INSURER_STAFF')",[ids.organization,ids.farmerB],'23503');
  await rejected("INSERT INTO palito.users(firebase_uid,display_name,phone_e164) VALUES('bad-phone','Invalid','01712345678')",[],'23514');
});

test('database ownership/FK constraints reject foreign farms and orphan parents', async () => {
  await rejected('UPDATE palito.animals SET owner_id=$1 WHERE id=$2',[ids.farmerB,ids.animalA],'23503');
  await rejected('UPDATE palito.animals SET farm_id=$1 WHERE id=$2',[ids.farmB,ids.animalA],'23503');
  await rejected('UPDATE palito.animals SET farm_id=$1 WHERE id=$2',[randomUUID(),ids.animalA],'23503');
  await rejected('DELETE FROM palito.farms WHERE id=$1',[ids.farmA],'23001');
  await rejected('INSERT INTO palito.farm_memberships(farm_id,user_id,role) VALUES($1,$2,$3)',[ids.farmA,ids.farmerB,'OWNER'],'23514');
});

test('numeric/date constraints reject negative/NaN values, future births, unsupported currency and duplicate tags', async () => {
  for (const [assignment, code] of [["estimate_minor=-1",'23514'],["weight_kg='NaN'",'23514'],["weight_kg=0",'23514'],["currency='USD'",'23514'],["birth_date=CURRENT_DATE+1",'23514'],["version=0",'23514'],["tag='SYNTHETIC-M2-B'",'23505']] as const) await rejected(`UPDATE palito.animals SET ${assignment} WHERE id=$1`,[ids.animalA],code);
  await rejected('UPDATE palito.farms SET area_acres=0 WHERE id=$1',[ids.farmA],'23514');
  await rejected('UPDATE palito.animals SET estimate_minor=9223372036854775808 WHERE id=$1',[ids.animalA],'22003');
  await prisma.animal.update({where:{id:ids.animalA},data:{estimateMinor:9223372036854775807n}});
  assert.equal((await prisma.animal.findUniqueOrThrow({where:{id:ids.animalA}})).estimateMinor,9223372036854775807n);
  await prisma.animal.update({where:{id:ids.animalA},data:{estimateMinor:14000000n}});
});

test('pending vet cannot sign records; farmer observations cannot impersonate clinical or foreign ownership', async () => {
  await rejected("INSERT INTO palito.health_records(animal_id,author_id,vet_id,source,kind,note,signed_at) VALUES($1,$2,$2,'VET','checkup','Synthetic',now())",[ids.animalA,ids.vet],'23514');
  await rejected("INSERT INTO palito.health_records(animal_id,author_id,source,kind,note) VALUES($1,$2,'FARMER','observation','Synthetic')",[ids.animalA,ids.farmerB],'23514');
  await rejected("INSERT INTO palito.health_records(animal_id,author_id,source,kind,note,signed_at) VALUES($1,$2,'FARMER','treatment','Synthetic',now())",[ids.animalA,ids.farmerA],'23514');
  await prisma.vetCredential.update({where:{userId:ids.vet},data:{status:'VERIFIED',reviewedById:ids.reviewer,reviewedAt:new Date()}});
});

let appointmentId: string;
test('appointment owner/farm/time relationships and concurrent vet reservations are enforced in PostgreSQL', async () => {
  const start=new Date('2030-01-01T10:00:00Z'); const end=new Date('2030-01-01T11:00:00Z');
  await rejected("INSERT INTO palito.appointments(animal_id,farm_id,farmer_id,vet_id,starts_at,ends_at,mode,reason) VALUES($1,$2,$3,$4,$5,$6,'visit','Synthetic')",[ids.animalA,ids.farmB,ids.farmerA,ids.vet,start,end],'23514');
  await rejected("INSERT INTO palito.appointments(animal_id,farm_id,farmer_id,vet_id,starts_at,ends_at,mode,reason) VALUES($1,$2,$3,$4,$5,$6,'visit','Synthetic')",[ids.animalA,ids.farmA,ids.farmerB,ids.vet,start,end],'23514');
  const values=[ids.animalA,ids.farmA,ids.farmerA,ids.vet,start,end];
  const sql="INSERT INTO palito.appointments(animal_id,farm_id,farmer_id,vet_id,starts_at,ends_at,mode,reason) VALUES($1,$2,$3,$4,$5,$6,'visit','Synthetic') RETURNING id";
  const other=new pg.Client({connectionString:urls(databaseName).DATABASE_URL}); await other.connect();
  try {
    const outcomes=await Promise.allSettled([runtime.query(sql,values),other.query(sql,values)]);
    assert.equal(outcomes.filter(result=>result.status==='fulfilled').length,1);
    const failed=outcomes.find(result=>result.status==='rejected') as PromiseRejectedResult;
    assert.equal(failed.reason.code,'23P01');
    const completed=outcomes.find(result=>result.status==='fulfilled') as PromiseFulfilledResult<pg.QueryResult>;
    appointmentId=completed.value.rows[0].id;
  } finally { await other.end(); }
  await rejected('UPDATE palito.appointments SET ends_at=starts_at WHERE id=$1',[appointmentId],'23514');
  await rejected('UPDATE palito.appointments SET farmer_id=$1 WHERE id=$2',[ids.farmerB,appointmentId],'23514');
});

let recordId: string;
test('clinical records preserve prescriber/animal/appointment links and append-only amendment history', async () => {
  const record=await prisma.healthRecord.create({data:{animalId:ids.animalA,authorId:ids.vet,vetId:ids.vet,appointmentId,source:'VET',kind:'checkup',note:'Synthetic test record',signedAt:new Date()}}); recordId=record.id;
  await rejected("INSERT INTO palito.health_records(animal_id,author_id,vet_id,appointment_id,source,kind,note,signed_at) VALUES($1,$2,$2,$3,'VET','checkup','Synthetic',now())",[ids.animalB,ids.vet,appointmentId],'23503');
  await rejected("UPDATE palito.health_records SET note='rewritten' WHERE id=$1",[recordId],'42501');
  await rejected("UPDATE palito.health_records SET note='rewritten' WHERE id=$1",[recordId],'23514',migrator);
  await rejected('DELETE FROM palito.health_records WHERE id=$1',[recordId],'23514',migrator);
  const amendment=await prisma.healthRecord.create({data:{animalId:ids.animalA,authorId:ids.vet,vetId:ids.vet,source:'VET',kind:'checkup',note:'Synthetic amendment',signedAt:new Date(),amendsId:recordId}});
  assert.equal(amendment.amendsId,recordId);
  await rejected("INSERT INTO palito.health_records(animal_id,author_id,vet_id,source,kind,note,signed_at,amends_id) VALUES($1,$2,$2,'VET','checkup','Synthetic',now(),$3)",[ids.animalB,ids.vet,recordId],'23503');
});

test('signed prescription and item contents cannot be rewritten, extended or linked to another animal', async () => {
  await rejected("INSERT INTO palito.prescriptions(record_id,animal_id,vet_id,advice) VALUES($1,$2,$3,'Synthetic')",[recordId,ids.animalB,ids.vet],'23503');
  const prescription=await prisma.prescription.create({data:{recordId,animalId:ids.animalA,vetId:ids.vet,advice:'Synthetic only'}});
  const item=await prisma.prescriptionItem.create({data:{prescriptionId:prescription.id,medicineName:'Synthetic test medicine',dose:'Synthetic dose',frequency:'Synthetic frequency',days:1}});
  await rejected('UPDATE palito.prescription_items SET days=0 WHERE id=$1',[item.id],'23514');
  await prisma.prescription.update({where:{id:prescription.id},data:{signedAt:new Date()}});
  await rejected("UPDATE palito.prescriptions SET advice='changed' WHERE id=$1",[prescription.id],'23514');
  await rejected("UPDATE palito.prescription_items SET dose='changed' WHERE id=$1",[item.id],'23514');
  await rejected('DELETE FROM palito.prescription_items WHERE id=$1',[item.id],'23514');
  await rejected("INSERT INTO palito.prescription_items(prescription_id,medicine_name,dose,frequency,days) VALUES($1,'New','New','New',1)",[prescription.id],'23514');
});

test('approved valuation versions are independent and immutable; editable estimates remain separate', async () => {
  await rejected("UPDATE palito.valuations SET status='APPROVED',approved_by_id=$1,approved_at=assessed_at WHERE id=$2",[ids.farmerA,ids.valuation],'23514');
  await prisma.valuation.update({where:{id:ids.valuation},data:{status:'APPROVED',approvedById:ids.reviewer,approvedAt:new Date()}});
  await rejected('UPDATE palito.valuations SET amount_minor=20000000 WHERE id=$1',[ids.valuation],'23514');
  await rejected('DELETE FROM palito.valuations WHERE id=$1',[ids.valuation],'23514',migrator);
  await prisma.animal.update({where:{id:ids.animalA},data:{estimateMinor:20000000n}});
  assert.equal((await prisma.valuation.findUniqueOrThrow({where:{id:ids.valuation}})).amountMinor,10000000n);
  await rejected("UPDATE palito.ownership_history SET reason='changed' WHERE animal_id=$1",[ids.animalA],'23514',migrator);
});

test('ownership snapshots preserve existing clinical/appointment/valuation history when an animal changes farms', async () => {
  await prisma.$transaction(async db=>{
    await db.animal.update({where:{id:ids.animalA},data:{farmId:ids.farmB,ownerId:ids.farmerB}});
    await db.ownershipHistory.create({data:{animalId:ids.animalA,fromOwnerId:ids.farmerA,toOwnerId:ids.farmerB,reason:'Synthetic database transfer test'}});
  });
  assert.equal((await prisma.appointment.findUniqueOrThrow({where:{id:appointmentId}})).farmerId,ids.farmerA);
  assert.equal((await prisma.healthRecord.findUniqueOrThrow({where:{id:recordId}})).animalId,ids.animalA);
  assert.equal((await prisma.valuation.findUniqueOrThrow({where:{id:ids.valuation}})).ownerAtAssessmentId,ids.farmerA);
  await rejected("INSERT INTO palito.health_records(animal_id,author_id,source,kind,note) VALUES($1,$2,'FARMER','observation','Old owner')",[ids.animalA,ids.farmerA],'23514');
});

test('runtime credentials cannot migrate, access migration history, create roles, truncate or escalate', async () => {
  for(const sql of ['CREATE TABLE palito.forbidden(id int)','CREATE SCHEMA forbidden','CREATE ROLE forbidden','SET ROLE palito_migrator','SELECT * FROM palito._prisma_migrations','TRUNCATE palito.users','CREATE TEMP TABLE forbidden(id int)']) await rejected(sql,[],'42501');
  const flags=await runtime.query('SELECT rolsuper,rolcreatedb,rolcreaterole,rolbypassrls FROM pg_roles WHERE rolname=current_user');
  assert.deepEqual(flags.rows[0],{rolsuper:false,rolcreatedb:false,rolcreaterole:false,rolbypassrls:false});
  assert.equal((await runtime.query("SELECT has_function_privilege(current_user,'palito.reject_history_change()','EXECUTE') AS allowed")).rows[0].allowed,false);
  await migrator.query('CREATE TABLE palito.permission_probe(id integer)');
  try {await rejected('SELECT * FROM palito.permission_probe',[],'42501');}
  finally {await migrator.query('DROP TABLE palito.permission_probe');}
});

test('real transaction rollback preserves original values when a constraint rejects a later statement', async () => {
  const before=await prisma.animal.findUniqueOrThrow({where:{id:ids.animalA}});
  await assert.rejects(prisma.$transaction(async db=>{
    await db.animal.update({where:{id:ids.animalA},data:{name:'Must roll back'}});
    await db.animal.update({where:{id:ids.animalA},data:{estimateMinor:-1n}});
  }));
  assert.equal((await prisma.animal.findUniqueOrThrow({where:{id:ids.animalA}})).name,before.name);
});

test('upgrade from first migration preserves existing rows; deploy is repeatable and schema matches Prisma', async () => {
  const env=urls(upgradeName); bootstrap(env);
  const temporary=mkdtempSync(join(backendDir,'.migration-test-'));
  try {
    const path=join(temporary,'migrations');mkdirSync(path);
    cpSync(join(backendDir,'prisma/migrations/20261115000100_core'),join(path,'20261115000100_core'),{recursive:true});
    cpSync(join(backendDir,'prisma/migrations/migration_lock.toml'),join(path,'migration_lock.toml'));
    const config=join(temporary,'prisma.config.ts');
    writeFileSync(config,`import {defineConfig} from 'prisma/config'; export default defineConfig({schema:${JSON.stringify(join(backendDir,'prisma/schema.prisma'))},migrations:{path:${JSON.stringify(path)}},datasource:{url:process.env.MIGRATION_DATABASE_URL}});`);
    runPrisma(['migrate','deploy','--config',config],env);
    const client=new pg.Client({connectionString:env.MIGRATION_DATABASE_URL});await client.connect();
    const sentinel=randomUUID();
    try {await client.query("INSERT INTO palito.users(id,firebase_uid,display_name) VALUES($1,'synthetic-upgrade-survivor','Synthetic survivor')",[sentinel]);} finally {await client.end();}
    runPrisma(['migrate','deploy'],env);runPrisma(['migrate','deploy'],env);
    const upgraded=new pg.Client({connectionString:env.DATABASE_URL});await upgraded.connect();
    try {
      assert.equal((await upgraded.query('SELECT id FROM palito.users WHERE id=$1',[sentinel])).rowCount,1);
      await rejected("INSERT INTO palito.users(firebase_uid,display_name) VALUES('','Invalid')",[],'23514',upgraded);
    } finally {await upgraded.end();}
    runPrisma(['migrate','diff','--from-config-datasource','--to-schema','prisma/schema.prisma','--exit-code'],env);
  } finally {rmSync(temporary,{recursive:true,force:true});}
});

// Explicit emulator command registers this real provider test; ordinary database CI
// does not silently report it as a passed or skipped provider check.
if (process.env.FIREBASE_AUTH_EMULATOR_HOST) test('official Firebase emulator + PostgreSQL API: onboarding, isolation, CSRF, cookies, suspension and revocation', async () => {
  const { createApplication } = await import('../../src/application.js');
  const { loadConfig } = await import('../../src/platform/config.js');
  const { createLogger } = await import('../../src/platform/logger.js');
  const { getAuth } = await import('firebase-admin/auth');
  const { getApps } = await import('firebase-admin/app');
  const request = (await import('supertest')).default;
  const env = urls(databaseName);
  const config = loadConfig({ ...env, AUTH_MODE: 'emulator', FIREBASE_PROJECT_ID: 'demo-palito', FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST, LOG_LEVEL: 'silent', CORS_ORIGINS: 'http://localhost:3000', RATE_LIMIT_MAX: '1000' });
  const app = await createApplication(config, createLogger(config)); await app.init();
  const base = `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}`;
  async function rest(path: string, body?: unknown) {
    const result = await fetch(`${base}${path}`, body ? { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer owner' }, body: JSON.stringify(body) } : {});
    assert.ok(result.ok, `Emulator REST status ${result.status}`); return result.json();
  }
  async function phoneIdentity(phoneNumber: string) {
    const sent = await rest('/identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=synthetic-emulator-key', { phoneNumber });
    const codes = await rest('/emulator/v1/projects/demo-palito/verificationCodes');
    const code = codes.verificationCodes.find((item: { sessionInfo: string }) => item.sessionInfo === sent.sessionInfo).code;
    return rest('/identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=synthetic-emulator-key', { sessionInfo: sent.sessionInfo, code });
  }
  try {
    const alice = await phoneIdentity('+8801700000001'); const bob = await phoneIdentity('+8801700000002');
    const server = app.getHttpServer();
    await request(server).get('/api/v1/me').expect(401);
    await request(server).get('/api/v1/me').set('Authorization', 'Bearer malformed-token').expect(401);
    // Emulator tokens are intentionally unsigned; verify claim denials through the real Admin adapter.
    for (const change of [{ aud: 'demo-other-project' }, { exp: 1 }]) {
      const parts = alice.idToken.split('.');
      parts[1] = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(parts[1], 'base64url').toString()), ...change })).toString('base64url');
      await request(server).get('/api/v1/me').set('Authorization', `Bearer ${parts.join('.')}`).expect(401);
    }
    for (const identity of [alice, bob]) await request(server).post('/api/v1/onboarding').send({ idToken: identity.idToken, displayName: 'Synthetic emulator farmer', locale: 'bn' }).expect(201);
    await request(server).post('/api/v1/onboarding').send({ idToken: alice.idToken, displayName: 'Escalate', locale: 'bn', role: 'ADMIN' }).expect(400);
    const a = await request(server).get('/api/v1/me').set('Authorization', `Bearer ${alice.idToken}`).expect(200);
    const b = await request(server).get('/api/v1/me').set('Authorization', `Bearer ${bob.idToken}`).expect(200);
    assert.notEqual(a.body.userId, b.body.userId); assert.deepEqual(a.body.memberships, []);
    assert.ok(!JSON.stringify(a.body).includes(b.body.userId)); assert.ok(!JSON.stringify(a.body).includes(alice.localId));
    const csrf = await request(server).get('/api/v1/sessions/csrf').expect(200);
    const csrfCookie = (csrf.headers['set-cookie'] as unknown as string[])[0]!.split(';')[0]!;
    await request(server).post('/api/v1/sessions').send({ idToken: alice.idToken }).expect(403);
    const exchanged = await request(server).post('/api/v1/sessions').set('Origin', 'http://localhost:3000').set('Cookie', csrfCookie).set('X-CSRF-Token', csrf.body.csrfToken).send({ idToken: alice.idToken }).expect(201);
    const cookie = (exchanged.headers['set-cookie'] as unknown as string[]).find((value: string) => value.startsWith('__Host-palito-session=') && !value.startsWith('__Host-palito-session=;'));
    assert.ok(cookie); assert.ok(cookie.includes('HttpOnly') && cookie.includes('Secure') && cookie.includes('SameSite=Strict'));
    let session = cookie.split(';')[0]!;
    const firstSession = session;
    const rotateCsrf = await request(server).get('/api/v1/sessions/csrf').expect(200);
    const rotateCookie = (rotateCsrf.headers['set-cookie'] as unknown as string[])[0]!.split(';')[0]!;
    const rotated = await request(server).post('/api/v1/sessions').set('Origin', 'http://localhost:3000').set('Cookie', `${session}; ${rotateCookie}`).set('X-CSRF-Token', rotateCsrf.body.csrfToken).send({idToken: alice.idToken}).expect(201);
    const nextCookie = (rotated.headers['set-cookie'] as unknown as string[]).find(value => value.startsWith('__Host-palito-session=') && !value.startsWith('__Host-palito-session=;'));
    assert.ok(nextCookie); session = nextCookie.split(';')[0]!; assert.notEqual(session, firstSession);
    await request(server).get('/api/v1/me').set('Cookie', firstSession).expect(401);
    await request(server).get('/api/v1/me').set('Cookie', session).expect(200);
    await request(server).get('/api/v1/me').set('Cookie', session).set('Authorization', `Bearer ${bob.idToken}`).expect(401);
    await prisma.user.update({ where: { id: a.body.userId }, data: { status: 'SUSPENDED' } });
    await request(server).get('/api/v1/me').set('Cookie', session).expect(403);
    await prisma.user.update({ where: { id: a.body.userId }, data: { status: 'ACTIVE' } });
    const logoutCsrf = await request(server).get('/api/v1/sessions/csrf').expect(200);
    const logoutCookie = (logoutCsrf.headers['set-cookie'] as unknown as string[])[0]!.split(';')[0]!;
    await request(server).delete('/api/v1/sessions/current').set('Origin', 'https://evil.example').set('Cookie', `${session}; ${logoutCookie}`).set('X-CSRF-Token', logoutCsrf.body.csrfToken).expect(403);
    await request(server).delete('/api/v1/sessions/current').set('Origin', 'http://localhost:3000').set('Cookie', `${session}; ${logoutCookie}`).set('X-CSRF-Token', logoutCsrf.body.csrfToken).expect(200);
    await request(server).get('/api/v1/me').set('Cookie', session).expect(401);
    const firebase = getAuth(getApps().find(app => app.name === 'palito-demo-palito'));
    await firebase.updateUser(bob.localId, { disabled: true });
    await request(server).get('/api/v1/me').set('Authorization', `Bearer ${bob.idToken}`).expect(401);
    const fresh = await phoneIdentity('+8801700000003');
    await request(server).post('/api/v1/onboarding').send({ idToken: fresh.idToken, displayName: 'Revocation fixture', locale: 'bn' }).expect(201);
    // Move valid-since beyond the token auth_time using the official emulator admin API.
    await rest('/identitytoolkit.googleapis.com/v1/accounts:update?key=synthetic-emulator-key', { localId: fresh.localId, validSince: String(Math.floor(Date.now()/1000) + 1) });
    await request(server).get('/api/v1/me').set('Authorization', `Bearer ${fresh.idToken}`).expect(401);
  } finally { await app.close(); }
});
