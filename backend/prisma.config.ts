import { defineConfig } from 'prisma/config';

const migrationUrl = process.env.MIGRATION_DATABASE_URL;
if (migrationUrl && (!URL.canParse(migrationUrl) || new URL(migrationUrl).username !== 'palito_migrator')) {
  throw new Error('MIGRATION_DATABASE_URL must use the dedicated palito_migrator role');
}

// Generation/validation do not connect. Migration commands must supply this separate URL.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: migrationUrl },
});
