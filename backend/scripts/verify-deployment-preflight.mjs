/* global process, console */
import { verifyDeploymentPreflight } from "../dist/platform/deployment-preflight.js";

/**
 * M10 deployment preflight verifier.
 * Validates environment tier rules, least-privilege palito_runtime / palito_migrator separation,
 * TLS sslmode=verify-full on hosted tiers, and immutable SHA-256 checksums for all 9 migrations.
 * Never prints secrets or raw environment values.
 */
try {
  const requireMigrationUrl = process.argv.includes("--require-migration-url");
  const report = verifyDeploymentPreflight(process.env, { requireMigrationUrl });
  console.log(JSON.stringify(report));
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Deployment preflight failed";
  process.stderr.write(`Deployment preflight error: ${message}\n`);
  process.exitCode = 1;
}
