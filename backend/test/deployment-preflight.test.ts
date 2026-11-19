import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/platform/config.js';
import {
  EXPECTED_MIGRATION_MANIFEST,
  evaluatePilotOperationalHealth,
  verifyDeploymentPreflight,
  verifyMigrationHistory,
} from '../src/platform/deployment-preflight.js';

const realMigrationsDir = resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '../../prisma/migrations',
);

const validStagingEnv: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  DEPLOYMENT_TIER: 'staging',
  HOST: '0.0.0.0',
  PORT: '4000',
  DATABASE_URL:
    'postgresql://palito_runtime:staging-runtime-secret-99@db-staging.palito.internal:5432/palito_staging?schema=palito&sslmode=verify-full',
  CORS_ORIGINS: 'https://staging.palito.example',
  WEB_ORIGIN: 'https://staging.palito.example',
  AUTH_MODE: 'firebase',
  FIREBASE_PROJECT_ID: 'palito-staging-01',
  SWAGGER_ENABLED: 'false',
  DEMO_MODE: 'false',
  HEALTHCARE_NO_CHARGE_PILOT: 'true',
  FINANCE_SANDBOX_ENABLED: 'true',
  PAYMENT_PROVIDER: 'sandbox',
  SANDBOX_WEBHOOK_SECRET: 'staging-only-webhook-secret-1234',
  NOTIFICATION_CHANNEL_MODE: 'sandbox',
  EXTENSIONS_SANDBOX_ENABLED: 'true',
  WORKER_ENABLED: 'true',
};

const validProductionEnv: NodeJS.ProcessEnv = {
  NODE_ENV: 'production',
  DEPLOYMENT_TIER: 'production',
  HOST: '0.0.0.0',
  PORT: '4000',
  DATABASE_URL:
    'postgresql://palito_runtime:prod-runtime-secret-9999@db-prod.palito.internal:5432/palito_prod?schema=palito&sslmode=verify-full',
  CORS_ORIGINS: 'https://app.palito.example',
  WEB_ORIGIN: 'https://app.palito.example',
  AUTH_MODE: 'firebase',
  FIREBASE_PROJECT_ID: 'palito-production-01',
  SWAGGER_ENABLED: 'false',
  DEMO_MODE: 'false',
  HEALTHCARE_NO_CHARGE_PILOT: 'false',
  FINANCE_SANDBOX_ENABLED: 'false',
  PAYMENT_PROVIDER: 'disabled',
  NOTIFICATION_CHANNEL_MODE: 'in-app-only',
  EXTENSIONS_SANDBOX_ENABLED: 'false',
  WORKER_ENABLED: 'true',
};

test('M10 DEPLOYMENT_TIER separates development, test, staging pilot, and production lock-down', () => {
  const stagingCfg = loadConfig(validStagingEnv);
  assert.equal(stagingCfg.DEPLOYMENT_TIER, 'staging');
  assert.equal(stagingCfg.FINANCE_SANDBOX_ENABLED, true);
  assert.equal(stagingCfg.EXTENSIONS_SANDBOX_ENABLED, true);

  assert.throws(
    () => loadConfig({ ...validStagingEnv, SWAGGER_ENABLED: 'true' }),
    /Staging forbids development documentation and emulators/,
  );
  assert.throws(
    () =>
      loadConfig({
        ...validStagingEnv,
        FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
      }),
    /Unexpected Firebase emulator configuration/,
  );
  assert.throws(
    () => loadConfig({ ...validProductionEnv, DEPLOYMENT_TIER: 'development' }),
    /Production NODE_ENV allows only staging or production DEPLOYMENT_TIER/,
  );
  assert.throws(
    () =>
      loadConfig({
        NODE_ENV: 'development',
        DEPLOYMENT_TIER: 'staging',
        DATABASE_URL: 'postgresql://palito_runtime:local-secret-123456@127.0.0.1:5432/palito_dev',
      }),
    /DEPLOYMENT_TIER must match NODE_ENV outside production builds/,
  );

  const prodCfg = loadConfig(validProductionEnv);
  assert.equal(prodCfg.DEPLOYMENT_TIER, 'production');
  assert.equal(prodCfg.FINANCE_SANDBOX_ENABLED, false);
  assert.equal(prodCfg.EXTENSIONS_SANDBOX_ENABLED, false);
});

test('M10 verifyMigrationHistory enforces immutable 9-migration SHA-256 manifest and blocks destructive or privileged DDL', () => {
  const verified = verifyMigrationHistory(realMigrationsDir);
  assert.equal(verified.migrationCount, 9);
  assert.equal(verified.verifiedIds.length, 9);
  assert.equal(verified.strategy, 'expand-backfill-contract-forward-repair');

  const tempRoot = mkdtempSync(join(tmpdir(), 'palito-m10-migrations-'));
  try {
    for (const entry of EXPECTED_MIGRATION_MANIFEST) {
      const targetDir = join(tempRoot, entry.id);
      mkdirSync(targetDir, { recursive: true });
      const content = readFileSync(
        join(realMigrationsDir, entry.id, 'migration.sql'),
        'utf8',
      );
      writeFileSync(join(targetDir, 'migration.sql'), content, 'utf8');
    }

    assert.equal(verifyMigrationHistory(tempRoot).migrationCount, 9);

    const lastSqlPath = join(
      tempRoot,
      EXPECTED_MIGRATION_MANIFEST[8]!.id,
      'migration.sql',
    );
    const originalLastSql = readFileSync(lastSqlPath, 'utf8');

    writeFileSync(lastSqlPath, `${originalLastSql}\n-- unreviewed edit\n`, 'utf8');
    assert.throws(
      () => verifyMigrationHistory(tempRoot),
      /Immutable migration checksum mismatch/,
    );

    writeFileSync(
      lastSqlPath,
      `${originalLastSql}\nGRANT SELECT ON palito._prisma_migrations TO palito_runtime;\n`,
      'utf8',
    );
    assert.throws(
      () => verifyMigrationHistory(tempRoot),
      /Forbidden _prisma_migrations grant to palito_runtime/,
    );

    writeFileSync(
      lastSqlPath,
      `${originalLastSql}\nTRUNCATE TABLE palito.users;\n`,
      'utf8',
    );
    assert.throws(
      () => verifyMigrationHistory(tempRoot),
      /Forbidden destructive DDL detected/,
    );

    rmSync(join(tempRoot, EXPECTED_MIGRATION_MANIFEST[8]!.id), {
      recursive: true,
      force: true,
    });
    assert.throws(
      () => verifyMigrationHistory(tempRoot),
      /Migration history mismatch/,
    );
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
});

test('M10 verifyDeploymentPreflight enforces least-privilege runtime/migrator credentials and never leaks secrets', () => {
  const stagingReport = verifyDeploymentPreflight(validStagingEnv, {
    migrationsDir: realMigrationsDir,
  });
  assert.equal(stagingReport.ready, true);
  assert.equal(stagingReport.tier, 'staging');
  assert.equal(stagingReport.migrationCount, 9);
  assert.ok(!JSON.stringify(stagingReport).includes('staging-runtime-secret-99'));

  const prodMigrationEnv: NodeJS.ProcessEnv = {
    ...validProductionEnv,
    MIGRATION_DATABASE_URL:
      'postgresql://palito_migrator:prod-migrator-secret-8888@db-prod.palito.internal:5432/palito_prod?schema=palito&sslmode=verify-full',
  };
  const prodReport = verifyDeploymentPreflight(prodMigrationEnv, {
    migrationsDir: realMigrationsDir,
    requireMigrationUrl: true,
  });
  assert.equal(prodReport.ready, true);
  assert.equal(prodReport.tier, 'production');
  assert.equal(prodReport.featureGates.financeSandboxEnabled, false);
  assert.equal(prodReport.featureGates.extensionsSandboxEnabled, false);
  assert.ok(!JSON.stringify(prodReport).includes('prod-migrator-secret-8888'));

  assert.throws(
    () =>
      verifyDeploymentPreflight(
        { ...validProductionEnv, SEED_SYNTHETIC: 'true' },
        { migrationsDir: realMigrationsDir },
      ),
    /Synthetic seed is forbidden in staging and production/,
  );

  assert.throws(
    () =>
      verifyDeploymentPreflight(
        {
          ...validProductionEnv,
          DATABASE_ADMIN_URL:
            'postgresql://postgres:super-secret@db-prod.palito.internal:5432/palito_prod',
        },
        { migrationsDir: realMigrationsDir },
      ),
    /DATABASE_ADMIN_URL must not be present in API or worker runtime environments/,
  );

  assert.throws(
    () =>
      verifyDeploymentPreflight(
        { ...validProductionEnv, AUTH_MODE: 'disabled' },
        { migrationsDir: realMigrationsDir },
      ),
    /Staging and production require AUTH_MODE=firebase/,
  );

  assert.throws(
    () =>
      verifyDeploymentPreflight(
        { ...validProductionEnv, CORS_ORIGINS: '' },
        { migrationsDir: realMigrationsDir },
      ),
    /Staging and production require at least one explicit HTTPS CORS origin/,
  );

  assert.throws(
    () =>
      verifyDeploymentPreflight(
        {
          ...validProductionEnv,
          DATABASE_URL:
            'postgresql://palito_runtime:prod-runtime-secret-9999@127.0.0.1:5432/palito_prod?sslmode=verify-full',
        },
        { migrationsDir: realMigrationsDir },
      ),
    /Staging and production forbid loopback DATABASE_URL/,
  );

  assert.throws(
    () =>
      verifyDeploymentPreflight(
        {
          ...validProductionEnv,
          MIGRATION_DATABASE_URL:
            'postgresql://palito_migrator:prod-runtime-secret-9999@db-prod.palito.internal:5432/palito_prod?schema=palito&sslmode=verify-full',
        },
        { migrationsDir: realMigrationsDir, requireMigrationUrl: true },
      ),
    /Migration and runtime database credentials must be distinct/,
  );
});

test('M10 evaluatePilotOperationalHealth classifies OK, WARNING, and ROLLBACK_REQUIRED triggers', () => {
  const ok = evaluatePilotOperationalHealth({
    tier: 'staging',
    workerEnabled: true,
    outbox: {
      pending: 4,
      processing: 1,
      completed: 120,
      deadLetter: 0,
      staleLeases: 0,
    },
    unbalancedLedgerCount: 0,
  });
  assert.equal(ok.healthy, true);
  assert.equal(ok.severity, 'OK');
  assert.equal(ok.activeTriggers.length, 0);

  const warning = evaluatePilotOperationalHealth({
    tier: 'staging',
    workerEnabled: false,
    outbox: {
      pending: 5,
      processing: 0,
      completed: 10,
      deadLetter: 0,
      staleLeases: 1,
    },
  });
  assert.equal(warning.healthy, false);
  assert.equal(warning.severity, 'WARNING');
  assert.ok(warning.activeTriggers.includes('OUTBOX_STALE_LEASES_DETECTED'));
  assert.ok(
    warning.activeTriggers.includes('WORKER_DISABLED_WITH_PENDING_OUTBOX'),
  );

  const rollback = evaluatePilotOperationalHealth({
    tier: 'production',
    workerEnabled: true,
    outbox: {
      pending: 0,
      processing: 0,
      completed: 50,
      deadLetter: 1,
      staleLeases: 0,
    },
    unbalancedLedgerCount: 1,
  });
  assert.equal(rollback.healthy, false);
  assert.equal(rollback.severity, 'ROLLBACK_REQUIRED');
  assert.ok(rollback.activeTriggers.includes('UNBALANCED_LEDGER_DETECTED'));
  assert.ok(rollback.activeTriggers.includes('OUTBOX_DEAD_LETTER_NONZERO'));
});
