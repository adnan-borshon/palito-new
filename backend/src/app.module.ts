import { Module, type DynamicModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import type { Logger } from 'pino';
import { HealthController } from './health/health.controller.js';
import { APP_CONFIG, type AppConfig } from './platform/config.js';
import { APP_LOGGER } from './platform/logger.js';
import { DatabaseService } from './platform/database.js';
import { DisabledIdentityVerifier, IDENTITY_VERIFIER, IdentityGuard } from './platform/auth.js';

@Module({})
export class AppModule {
  static register(config: AppConfig, logger: Logger): DynamicModule {
    return {
      module: AppModule,
      controllers: [HealthController],
      providers: [
        { provide: APP_CONFIG, useValue: config }, { provide: APP_LOGGER, useValue: logger },
        DatabaseService, { provide: IDENTITY_VERIFIER, useClass: DisabledIdentityVerifier },
        { provide: APP_GUARD, useClass: IdentityGuard },
      ],
      exports: [DatabaseService],
    };
  }
}
