import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

test('local setup generates distinct role credentials without printing or overwriting them', () => {
  const directory=mkdtempSync(join(tmpdir(),'palito-setup-'));
  try {
    mkdirSync(join(directory,'scripts'));
    const script=join(directory,'scripts/setup-dev.mjs');
    cpSync(fileURLToPath(new URL('../../scripts/setup-dev.mjs',import.meta.url)),script);
    const first=spawnSync(process.execPath,[script],{encoding:'utf8'});assert.equal(first.status,0);
    const config=readFileSync(join(directory,'.env'),'utf8');
    const values=Object.fromEntries(config.trim().split('\n').map(line=>{const offset=line.indexOf('=');return [line.slice(0,offset),line.slice(offset+1)];}));
    const admin=new URL(values.DATABASE_ADMIN_URL!);const migration=new URL(values.MIGRATION_DATABASE_URL!);const runtime=new URL(values.DATABASE_URL!);
    assert.equal(migration.username,'palito_migrator');assert.equal(runtime.username,'palito_runtime');
    assert.equal(new Set([admin.password,migration.password,runtime.password]).size,3);
    for(const password of [admin.password,migration.password,runtime.password]){assert.ok(password.length>=32);assert.ok(!first.stdout.includes(password));}
    if(process.platform!=='win32')assert.equal(statSync(join(directory,'.env')).mode & 0o777,0o600);
    const second=spawnSync(process.execPath,[script],{encoding:'utf8'});assert.equal(second.status,0);
    assert.equal(readFileSync(join(directory,'.env'),'utf8'),config);
  } finally {rmSync(directory,{recursive:true,force:true});}
});
