import { seedLocalSample } from './database/local-sample.js';
import { loadConfig } from './platform/config.js';
import { createLogger } from './platform/logger.js';
import { DatabaseService } from './platform/database.js';
import { assertSyntheticSeedAllowed, seedSynthetic } from './database/synthetic.js';

let database: DatabaseService | undefined;
try {
  assertSyntheticSeedAllowed(process.env);
  const config = loadConfig(process.env);
  database = new DatabaseService(config, createLogger(config));
  if (process.argv.includes('--local-sample')) {
    await seedLocalSample(database.prisma);
    console.log('Local sample records and emulator identities are ready. Staff use the configured local password and emulator MFA.');
  } else {
    await seedSynthetic(database.prisma, process.env);
    console.log('Synthetic local fixture created; no login was provisioned.');
  }
} catch {
  process.stderr.write('Synthetic seed failed. Check local opt-in, migrations and runtime-role configuration.\n');
  process.exitCode = 1;
} finally { await database?.onApplicationShutdown(); }
