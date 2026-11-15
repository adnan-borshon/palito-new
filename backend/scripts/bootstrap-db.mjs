import pg from 'pg';
import { pathToFileURL } from 'node:url';

export async function bootstrapLocalDatabase({ adminUrl, migrationUrl, runtimeUrl, nodeEnv }) {
  if (!['development', 'test'].includes(nodeEnv)) throw new Error('Local database setup requires development/test environment');
  const admin = new URL(adminUrl);
  const migration = new URL(migrationUrl);
  const runtime = new URL(runtimeUrl);
  if (![admin, migration, runtime].every(url => ['postgres:', 'postgresql:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) throw new Error('Local database setup accepts loopback PostgreSQL only');
  if (![migration, runtime].every(url => url.host === admin.host && url.pathname === admin.pathname)) throw new Error('Database setup URLs must target the same database');
  if (decodeURIComponent(migration.username) !== 'palito_migrator' || decodeURIComponent(runtime.username) !== 'palito_runtime') throw new Error('Expected dedicated Palito roles');
  for (const url of [migration, runtime]) if (decodeURIComponent(url.password).length < 16) throw new Error('Dedicated local role passwords must be at least 16 characters');
  const passwords=[migration,runtime,...(admin.password ? [admin] : [])].map(url=>decodeURIComponent(url.password));
  if (new Set(passwords).size!==passwords.length) throw new Error('Administrator, migration and runtime credentials must be distinct');
  const database = decodeURIComponent(admin.pathname.slice(1));
  if (!/^(palito_dev|palito_test|palito_m2_)[a-zA-Z0-9_]*$/.test(database)) throw new Error('Local setup requires a dedicated Palito development/test database name');
  const client = new pg.Client({ connectionString: adminUrl, connectionTimeoutMillis: 2000 });
  await client.connect();
  try {
    await client.query('BEGIN');
    const delegated = await client.query("SELECT 1 FROM pg_auth_members WHERE member IN (SELECT oid FROM pg_roles WHERE rolname IN ('palito_migrator','palito_runtime'))");
    if (delegated.rowCount) throw new Error('Dedicated database roles must not inherit other roles');
    for (const url of [migration, runtime]) {
      const name = decodeURIComponent(url.username);
      const exists = await client.query('SELECT rolcanlogin,rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls,rolinherit FROM pg_roles WHERE rolname=$1', [name]);
      if (!exists.rowCount) {
        await client.query(`CREATE ROLE ${pg.escapeIdentifier(name)} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS NOINHERIT PASSWORD ${pg.escapeLiteral(decodeURIComponent(url.password))}`);
      } else {
        const role=exists.rows[0];
        if (!role.rolcanlogin || role.rolsuper || role.rolcreatedb || role.rolcreaterole || role.rolreplication || role.rolbypassrls || role.rolinherit) throw new Error('Existing role attributes do not match the dedicated-role policy');
        // Preserve existing cluster-level credentials: setup is not a password rotation command.
        const probe=new pg.Client({connectionString:url.toString(),connectionTimeoutMillis:2000});
        try { await probe.connect(); await probe.query('SELECT 1'); } finally { await probe.end(); }
      }
      await client.query(`ALTER ROLE ${pg.escapeIdentifier(name)} IN DATABASE ${pg.escapeIdentifier(database)} SET timezone TO 'UTC'`);
      await client.query(`ALTER ROLE ${pg.escapeIdentifier(name)} IN DATABASE ${pg.escapeIdentifier(database)} SET search_path TO palito, public`);
      await client.query(`ALTER ROLE ${pg.escapeIdentifier(name)} IN DATABASE ${pg.escapeIdentifier(database)} SET idle_in_transaction_session_timeout TO '30s'`);
    }
    await client.query(`REVOKE ALL ON DATABASE ${pg.escapeIdentifier(database)} FROM PUBLIC`);
    await client.query(`GRANT CONNECT ON DATABASE ${pg.escapeIdentifier(database)} TO palito_migrator, palito_runtime`);
    await client.query('REVOKE ALL ON SCHEMA public FROM PUBLIC');
    await client.query('GRANT USAGE ON SCHEMA public TO palito_migrator, palito_runtime');
    await client.query('CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public');
    await client.query('CREATE SCHEMA IF NOT EXISTS palito AUTHORIZATION palito_migrator');
    const owner = await client.query("SELECT pg_get_userbyid(nspowner) AS owner FROM pg_namespace WHERE nspname='palito'");
    if (owner.rows[0]?.owner !== 'palito_migrator') throw new Error('Application schema has an unexpected owner');
    await client.query('REVOKE ALL ON SCHEMA palito FROM PUBLIC');
    await client.query('GRANT USAGE ON SCHEMA palito TO palito_runtime');
    await client.query('ALTER DEFAULT PRIVILEGES FOR ROLE palito_migrator REVOKE ALL ON TABLES FROM PUBLIC, palito_runtime');
    await client.query('ALTER DEFAULT PRIVILEGES FOR ROLE palito_migrator REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, palito_runtime');
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { await client.end(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await bootstrapLocalDatabase({ adminUrl: process.env.DATABASE_ADMIN_URL, migrationUrl: process.env.MIGRATION_DATABASE_URL, runtimeUrl: process.env.DATABASE_URL, nodeEnv: process.env.NODE_ENV });
    console.log('Local database roles/schema prepared; run migrate:deploy next.');
  } catch {
    process.stderr.write('Local database setup failed. Check local environment, dedicated role URLs and administrator permissions.\n');
    process.exitCode = 1;
  }
}
