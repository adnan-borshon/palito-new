/* global process, URL, console */
import pg from "pg";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Local-only M5/M6 backup, restore, outbox, and ledger integrity rehearsal.
 * Never targets production databases; requires explicit loopback PostgreSQL URLs.
 */
async function rehearse() {
  const nodeEnv = process.env.NODE_ENV ?? "development";
  if (!["development", "test"].includes(nodeEnv)) {
    throw new Error(
      "Backup/restore rehearsal is forbidden outside development/test",
    );
  }

  const adminUrl = process.env.DATABASE_ADMIN_URL;
  const sourceUrl = process.env.DATABASE_URL;
  if (!adminUrl || !sourceUrl) {
    process.stderr.write(
      "Backup/restore rehearsal requires loopback DATABASE_ADMIN_URL and DATABASE_URL in development/test.\n",
    );
    process.exitCode = 1;
    return;
  }

  const adminParsed = new URL(adminUrl);
  const sourceParsed = new URL(sourceUrl);
  for (const url of [adminParsed, sourceParsed]) {
    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)
    ) {
      throw new Error("Rehearsal accepts loopback PostgreSQL instances only");
    }
  }

  if (
    adminParsed.hostname !== sourceParsed.hostname ||
    (adminParsed.port || "5432") !== (sourceParsed.port || "5432")
  ) {
    throw new Error(
      "Admin and source URLs must reference the same loopback PostgreSQL instance",
    );
  }

  const sourceDb = decodeURIComponent(sourceParsed.pathname.slice(1));
  if (!/^(palito_dev|palito_test)[a-zA-Z0-9_]*$/.test(sourceDb)) {
    throw new Error(
      "Source database name must match palito_dev* or palito_test*",
    );
  }

  const pgDumpCheck = spawnSync("pg_dump", ["--version"], { encoding: "utf8" });
  const pgRestoreCheck = spawnSync("pg_restore", ["--version"], {
    encoding: "utf8",
  });
  if (pgDumpCheck.status !== 0 || pgRestoreCheck.status !== 0) {
    throw new Error("pg_dump and pg_restore binaries are required in PATH");
  }

  const workdir = mkdtempSync(join(tmpdir(), "palito-rehearsal-"));
  const dumpFile = join(workdir, "palito.dump");
  const restoreDb = `palito_restore_rehearsal_${Date.now()}`;
  const adminClient = new pg.Client({ connectionString: adminUrl });
  const clientEnv = {
    ...process.env,
    PGHOST: adminParsed.hostname.replace(/^\[|\]$/g, ""),
    PGPORT: adminParsed.port || "5432",
    PGUSER: decodeURIComponent(adminParsed.username),
    PGPASSWORD: decodeURIComponent(adminParsed.password),
  };

  try {
    const dumpRes = spawnSync(
      "pg_dump",
      [
        "--format=custom",
        "--no-owner",
        "--file",
        dumpFile,
        "--dbname",
        sourceDb,
      ],
      { encoding: "utf8", env: clientEnv },
    );
    if (dumpRes.status !== 0) {
      throw new Error(`pg_dump failed: ${dumpRes.stderr || dumpRes.stdout}`);
    }

    await adminClient.connect();
    await adminClient.query(
      `CREATE DATABASE ${pg.escapeIdentifier(restoreDb)}`,
    );

    const restoreUrl = new URL(adminUrl);
    restoreUrl.pathname = `/${restoreDb}`;
    const restoreRes = spawnSync(
      "pg_restore",
      ["--dbname", restoreDb, "--no-owner", "--clean", "--if-exists", dumpFile],
      { encoding: "utf8", env: clientEnv },
    );
    if (restoreRes.status !== 0) {
      throw new Error(
        `pg_restore failed: ${restoreRes.stderr || restoreRes.stdout}`,
      );
    }

    const verifyClient = new pg.Client({
      connectionString: restoreUrl.toString(),
    });
    await verifyClient.connect();
    try {
      const migrations = await verifyClient.query(
        "SELECT COUNT(*)::int AS count FROM palito._prisma_migrations",
      );
      const unbalanced = await verifyClient.query(`
        SELECT t.id
        FROM palito.ledger_transactions t
        LEFT JOIN palito.ledger_entries e ON e.transaction_id = t.id
        GROUP BY t.id
        HAVING COALESCE(SUM(CASE WHEN e.direction = 'DEBIT' THEN e.amount_minor ELSE 0 END), 0)
            <> COALESCE(SUM(CASE WHEN e.direction = 'CREDIT' THEN e.amount_minor ELSE 0 END), 0)
            OR COUNT(e.id) <> 2 OR COUNT(DISTINCT e.account_id) <> 2
      `);
      const ledger = await verifyClient.query(
        "SELECT COUNT(*)::int AS count FROM palito.ledger_transactions",
      );
      const outbox = await verifyClient.query(
        "SELECT COUNT(*)::int AS count FROM palito.outbox_events",
      );

      console.log(
        JSON.stringify({
          rehearsal: "ok",
          restoredDatabase: restoreDb,
          migrationCount: migrations.rows[0]?.count ?? 0,
          ledgerTransactionCount: ledger.rows[0]?.count ?? 0,
          outboxEventCount: outbox.rows[0]?.count ?? 0,
          unbalancedTransactions: unbalanced.rowCount ?? 0,
        }),
      );
      if ((unbalanced.rowCount ?? 0) > 0) {
        throw new Error(
          "Restored database contains unbalanced ledger transactions",
        );
      }
    } finally {
      await verifyClient.end();
    }
  } finally {
    await adminClient
      .query(
        `DROP DATABASE IF EXISTS ${pg.escapeIdentifier(restoreDb)} WITH (FORCE)`,
      )
      .catch(() => {});
    await adminClient.end().catch(() => {});
    rmSync(workdir, { recursive: true, force: true });
  }
}

await rehearse();
