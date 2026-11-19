import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ConfigurationError,
  loadConfig,
  type DeploymentTier,
} from './config.js';

export interface MigrationManifestEntry {
  readonly id: string;
  readonly sha256: string;
}

export const EXPECTED_MIGRATION_MANIFEST: readonly MigrationManifestEntry[] = Object.freeze([
  {
    id: '20261115000100_core',
    sha256: 'a85d31e37053b6d1e73a104d7d761e0eaa5cad8c6ebd9b6fe59fa6aee4041c72',
  },
  {
    id: '20261115000200_integrity',
    sha256: '32a52d22a25bbc40f0f7029e1e779184ef88a3ae34ef0a1ffe4dc3d51a48ef41',
  },
  {
    id: '20261115000300_sessions',
    sha256: 'd95e11ff5e74a7b8e803c7ea14785e188d02c6978ed7db5512ee9e6dc02a90dc',
  },
  {
    id: '20261115000400_identity_administration',
    sha256: '66f09fe0ee59c7e22d9788fc4634894c2156810f7e8b4fe283341475e4e60b5e',
  },
  {
    id: '20261115000500_healthcare',
    sha256: 'e74325d9bbcd10d236b38999508015f5ec98c53a34e4c98fc4ffb108a56bd9c5',
  },
  {
    id: '20261115000600_jobs_notifications_ops',
    sha256: 'b61209e5378f8891978a591c299ba43a0b69c84946d2fe56b639792fca62ac9c',
  },
  {
    id: '20261115000700_lending_ledger_sandbox',
    sha256: 'c4b6bc85361f0a9149aca04b307f4cb3c8c6e56e3b8bf3c41839488223c79309',
  },
  {
    id: '20261115000800_insurance_claim_settlement_sandbox',
    sha256: '208866db3c9d12fadfb294a27e6b6d2b01ee1d95f8fbf118483627300c984930',
  },
  {
    id: '20261115000900_extensions_iot_ai_commerce_content',
    sha256: 'dedd9b12299678b0b7a8600418ac8ad3b2231147f977ddf29f26693bfb497cb1',
  },
]);

export const PILOT_OWNERS = Object.freeze({
  productPolicy: 'product-owner',
  engineeringApiDb: 'backend-engineering-owner',
  frontendClients: 'client-engineering-owner',
  qaSecurity: 'security-qa-reviewer',
  operationsOnCall: 'platform-operations-owner',
});

export const PILOT_SLO_TARGETS = Object.freeze({
  readP95Ms: 500,
  writeP95Ms: 800,
  queueStartMaxSeconds: 60,
  candidateRpoHours: 1,
  candidateRtoHours: 4,
});

function defaultMigrationsDirectory(): string {
  const here = fileURLToPath(new URL('.', import.meta.url));
  return resolve(here, '../../prisma/migrations');
}

export function verifyMigrationHistory(migrationsDir = defaultMigrationsDirectory()): {
  readonly migrationCount: number;
  readonly verifiedIds: readonly string[];
  readonly strategy: 'expand-backfill-contract-forward-repair';
} {
  if (!existsSync(migrationsDir)) {
    throw new ConfigurationError('Prisma migrations directory not found');
  }
  const actualDirs = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const expectedIds = EXPECTED_MIGRATION_MANIFEST.map((entry) => entry.id);
  if (
    actualDirs.length !== expectedIds.length ||
    actualDirs.some((id, idx) => id !== expectedIds[idx])
  ) {
    throw new ConfigurationError(
      `Migration history mismatch: expected ${expectedIds.length} reviewed migrations`,
    );
  }

  for (const expected of EXPECTED_MIGRATION_MANIFEST) {
    const sqlPath = join(migrationsDir, expected.id, 'migration.sql');
    if (!existsSync(sqlPath)) {
      throw new ConfigurationError(`Missing migration.sql in ${expected.id}`);
    }
    const normalizedSql = readFileSync(sqlPath, 'utf8').replace(/\r\n/g, '\n');
    if (
      /\bGRANT\b[^;]*?_prisma_migrations[^;]*?\bTO\b[^;]*?\bpalito_runtime\b/i.test(
        normalizedSql,
      )
    ) {
      throw new ConfigurationError(
        `Forbidden _prisma_migrations grant to palito_runtime in ${expected.id}`,
      );
    }
    if (/\bDROP\s+SCHEMA\b|\bTRUNCATE\s+TABLE\b/i.test(normalizedSql)) {
      throw new ConfigurationError(
        `Forbidden destructive DDL detected in ${expected.id}`,
      );
    }
    const digest = createHash('sha256').update(normalizedSql, 'utf8').digest('hex');
    if (digest !== expected.sha256) {
      throw new ConfigurationError(
        `Immutable migration checksum mismatch in ${expected.id}`,
      );
    }
  }

  return Object.freeze({
    migrationCount: EXPECTED_MIGRATION_MANIFEST.length,
    verifiedIds: Object.freeze([...expectedIds]),
    strategy: 'expand-backfill-contract-forward-repair',
  });
}

export interface DeploymentPreflightOptions {
  readonly migrationsDir?: string;
  readonly requireMigrationUrl?: boolean;
}

export interface DeploymentPreflightReport {
  readonly ready: true;
  readonly tier: DeploymentTier;
  readonly nodeEnv: 'development' | 'test' | 'production';
  readonly migrationCount: number;
  readonly migrationStrategy: 'expand-backfill-contract-forward-repair';
  readonly featureGates: {
    readonly authMode: 'disabled' | 'firebase' | 'emulator';
    readonly healthcareNoChargePilot: boolean;
    readonly workerEnabled: boolean;
    readonly notificationChannelMode: 'in-app-only' | 'sandbox';
    readonly financeSandboxEnabled: boolean;
    readonly paymentProvider: 'disabled' | 'sandbox';
    readonly extensionsSandboxEnabled: boolean;
    readonly swaggerEnabled: boolean;
  };
  readonly sloTargets: typeof PILOT_SLO_TARGETS;
  readonly owners: typeof PILOT_OWNERS;
  readonly rollbackTriggers: readonly string[];
}

function isLoopbackHost(hostname: string): boolean {
  return ['localhost', '127.0.0.1', '[::1]'].includes(hostname.toLowerCase());
}

export function verifyDeploymentPreflight(
  env: NodeJS.ProcessEnv,
  options: DeploymentPreflightOptions = {},
): DeploymentPreflightReport {
  const config = loadConfig(env);
  const tier = config.DEPLOYMENT_TIER;
  const isHostedTier = tier === 'staging' || tier === 'production';

  if (isHostedTier) {
    if (env.SEED_SYNTHETIC === 'true') {
      throw new ConfigurationError(
        'Synthetic seed is forbidden in staging and production',
      );
    }
    if (env.DATABASE_ADMIN_URL && !options.requireMigrationUrl) {
      throw new ConfigurationError(
        'DATABASE_ADMIN_URL must not be present in API or worker runtime environments',
      );
    }
    if (config.AUTH_MODE !== 'firebase') {
      throw new ConfigurationError(
        'Staging and production require AUTH_MODE=firebase',
      );
    }
    if (config.CORS_ORIGINS.length === 0) {
      throw new ConfigurationError(
        'Staging and production require at least one explicit HTTPS CORS origin',
      );
    }
    const dbUrl = new URL(config.DATABASE_URL);
    if (isLoopbackHost(dbUrl.hostname)) {
      throw new ConfigurationError(
        'Staging and production forbid loopback DATABASE_URL',
      );
    }
    if (decodeURIComponent(dbUrl.password).length < 16) {
      throw new ConfigurationError(
        'Hosted palito_runtime password must be at least 16 characters',
      );
    }
  }

  const migrationUrlRaw = env.MIGRATION_DATABASE_URL;
  if (options.requireMigrationUrl && !migrationUrlRaw) {
    throw new ConfigurationError(
      'MIGRATION_DATABASE_URL is required for migration preflight',
    );
  }
  if (migrationUrlRaw) {
    if (!URL.canParse(migrationUrlRaw)) {
      throw new ConfigurationError('Invalid MIGRATION_DATABASE_URL');
    }
    const migrationUrl = new URL(migrationUrlRaw);
    const runtimeUrl = new URL(config.DATABASE_URL);
    if (!['postgres:', 'postgresql:'].includes(migrationUrl.protocol)) {
      throw new ConfigurationError(
        'MIGRATION_DATABASE_URL must use postgres or postgresql protocol',
      );
    }
    if (decodeURIComponent(migrationUrl.username) !== 'palito_migrator') {
      throw new ConfigurationError(
        'MIGRATION_DATABASE_URL must use the dedicated palito_migrator role',
      );
    }
    const migrationPassword = decodeURIComponent(migrationUrl.password);
    const runtimePassword = decodeURIComponent(runtimeUrl.password);
    if (migrationPassword.length < 16) {
      throw new ConfigurationError(
        'palito_migrator password must be at least 16 characters',
      );
    }
    if (migrationPassword === runtimePassword) {
      throw new ConfigurationError(
        'Migration and runtime database credentials must be distinct',
      );
    }
    if (
      migrationUrl.host !== runtimeUrl.host ||
      migrationUrl.pathname !== runtimeUrl.pathname
    ) {
      throw new ConfigurationError(
        'MIGRATION_DATABASE_URL and DATABASE_URL must target the same database',
      );
    }
    if (
      isHostedTier &&
      migrationUrl.searchParams.get('sslmode') !== 'verify-full'
    ) {
      throw new ConfigurationError(
        'Hosted MIGRATION_DATABASE_URL requires sslmode=verify-full',
      );
    }
  }

  const migrations = verifyMigrationHistory(options.migrationsDir);

  return Object.freeze({
    ready: true,
    tier,
    nodeEnv: config.NODE_ENV,
    migrationCount: migrations.migrationCount,
    migrationStrategy: migrations.strategy,
    featureGates: Object.freeze({
      authMode: config.AUTH_MODE,
      healthcareNoChargePilot: config.HEALTHCARE_NO_CHARGE_PILOT,
      workerEnabled: config.WORKER_ENABLED,
      notificationChannelMode: config.NOTIFICATION_CHANNEL_MODE,
      financeSandboxEnabled: config.FINANCE_SANDBOX_ENABLED,
      paymentProvider: config.PAYMENT_PROVIDER,
      extensionsSandboxEnabled: config.EXTENSIONS_SANDBOX_ENABLED,
      swaggerEnabled: config.SWAGGER_ENABLED,
    }),
    sloTargets: PILOT_SLO_TARGETS,
    owners: PILOT_OWNERS,
    rollbackTriggers: Object.freeze([
      'UNBALANCED_LEDGER_DETECTED',
      'OUTBOX_DEAD_LETTER_NONZERO',
      'READINESS_PROBE_503_SUSTAINED',
      'MIGRATION_PREFLIGHT_MISMATCH',
      'UNAUTHORIZED_CROSS_SCOPE_ALERT',
    ]),
  });
}

export interface PilotOperationalHealthInput {
  readonly tier: DeploymentTier;
  readonly workerEnabled: boolean;
  readonly outbox: {
    readonly pending: number;
    readonly processing: number;
    readonly completed: number;
    readonly deadLetter: number;
    readonly staleLeases: number;
  };
  readonly unbalancedLedgerCount?: number;
}

export interface PilotOperationalEvaluation {
  readonly healthy: boolean;
  readonly severity: 'OK' | 'WARNING' | 'ROLLBACK_REQUIRED';
  readonly activeTriggers: readonly string[];
  readonly recommendedActions: readonly string[];
  readonly owners: typeof PILOT_OWNERS;
}

export function evaluatePilotOperationalHealth(
  input: PilotOperationalHealthInput,
): PilotOperationalEvaluation {
  const activeTriggers: string[] = [];
  const recommendedActions: string[] = [];
  let rollbackRequired = false;

  if ((input.unbalancedLedgerCount ?? 0) > 0) {
    rollbackRequired = true;
    activeTriggers.push('UNBALANCED_LEDGER_DETECTED');
    recommendedActions.push(
      'Freeze FINANCE_SANDBOX_ENABLED / EXTENSIONS_SANDBOX_ENABLED immediately and run GET /api/v1/admin/ledger/reconciliation with finance & operations owners.',
    );
  }
  if (input.outbox.deadLetter > 0) {
    rollbackRequired = true;
    activeTriggers.push('OUTBOX_DEAD_LETTER_NONZERO');
    recommendedActions.push(
      'Inspect GET /api/v1/admin/outbox/dead-letter, resolve downstream failure, and retry via POST /api/v1/admin/outbox/:id/retry.',
    );
  }
  if (input.outbox.staleLeases > 0) {
    activeTriggers.push('OUTBOX_STALE_LEASES_DETECTED');
    recommendedActions.push(
      'Verify worker process health; worker lease reclamation will recover expired PROCESSING locks.',
    );
  }
  if (input.outbox.pending >= 100) {
    activeTriggers.push('OUTBOX_BACKLOG_HIGH');
    recommendedActions.push(
      'Outbox pending count exceeds pilot threshold (100); inspect worker throughput and database latency.',
    );
  }
  if (!input.workerEnabled && input.outbox.pending > 0) {
    activeTriggers.push('WORKER_DISABLED_WITH_PENDING_OUTBOX');
    recommendedActions.push(
      'Enable WORKER_ENABLED=true or start dedicated worker process (npm run worker --workspace @palito/backend).',
    );
  }

  const severity: 'OK' | 'WARNING' | 'ROLLBACK_REQUIRED' = rollbackRequired
    ? 'ROLLBACK_REQUIRED'
    : activeTriggers.length > 0
      ? 'WARNING'
      : 'OK';

  return Object.freeze({
    healthy: severity === 'OK',
    severity,
    activeTriggers: Object.freeze(activeTriggers),
    recommendedActions: Object.freeze(recommendedActions),
    owners: PILOT_OWNERS,
  });
}
