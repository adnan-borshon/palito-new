import { spawnSync } from 'node:child_process';

if (!process.env.DATABASE_URL) throw new Error('Run setup:dev first');
const result = spawnSync('npm', ['run', 'test:integration'], {
  env: { ...process.env, TEST_DATABASE_URL: process.env.DATABASE_URL },
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exitCode = result.status ?? 1;
