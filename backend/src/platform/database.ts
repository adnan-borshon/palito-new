import { Inject, Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import type { Logger } from 'pino';
import { APP_CONFIG, type AppConfig } from './config.js';
import { APP_LOGGER } from './logger.js';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  readonly prisma: PrismaClient;
  private closing?: Promise<void>;
  private closed = false;
  constructor(@Inject(APP_CONFIG) config: AppConfig, @Inject(APP_LOGGER) logger: Logger) {
    const adapter = new PrismaPg({
      connectionString: config.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: config.DATABASE_TIMEOUT_MS,
      query_timeout: config.DATABASE_TIMEOUT_MS,
      statement_timeout: config.DATABASE_TIMEOUT_MS,
      idleTimeoutMillis: 10000,
    }, { schema: 'palito', onPoolError: () => logger.error({ event: 'database_connection_error' }) });
    this.prisma = new PrismaClient({ adapter, log: [] });
  }
  async ping(): Promise<void> {
    if (this.closed) throw new Error('Database is shutting down');
    await this.prisma.$queryRaw`SELECT 1`;
  }
  onApplicationShutdown(): Promise<void> {
    this.closed = true;
    return this.closing ??= this.prisma.$disconnect();
  }
}
