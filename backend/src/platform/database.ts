import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { Pool } from 'pg';
import type { Logger } from 'pino';
import { APP_CONFIG, type AppConfig } from './config.js';
import { APP_LOGGER } from './logger.js';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private readonly pool: Pool;
  private closing?: Promise<void>;
  constructor(@Inject(APP_CONFIG) config: AppConfig, @Inject(APP_LOGGER) logger: Logger) {
    this.pool = new Pool({
      connectionString: config.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: config.DATABASE_TIMEOUT_MS,
      query_timeout: config.DATABASE_TIMEOUT_MS,
      statement_timeout: config.DATABASE_TIMEOUT_MS,
      idleTimeoutMillis: 10000,
    });
    this.pool.on('error', () => logger.error({ event: 'database_connection_error' }));
  }
  async ping(): Promise<void> { await this.pool.query('SELECT 1'); }
  onApplicationShutdown(): Promise<void> { return this.closing ??= this.pool.end(); }
}
