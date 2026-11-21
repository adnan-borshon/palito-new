import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const prisma = join(dirname(createRequire(import.meta.url).resolve('prisma/package.json')), 'build/index.js');
const result = spawnSync(process.execPath, [prisma, 'migrate', 'deploy'], { stdio: 'inherit' });
if (result.error) console.error('Could not start the Prisma migration command.');
process.exitCode = result.status ?? 1;
