import { Module, type DynamicModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import type { Logger } from 'pino';
import { HealthController } from './health/health.controller.js';
import { APP_CONFIG, type AppConfig } from './platform/config.js';
import { APP_LOGGER } from './platform/logger.js';
import { DatabaseService } from './platform/database.js';
import { DisabledIdentityVerifier, FirebaseVerifier, IDENTITY_VERIFIER, IdentityGuard } from './platform/auth.js';

import { FirebaseIdentity } from './identity/firebase.js';
import { Accounts } from './identity/accounts.js';
import { Sessions } from './identity/sessions.js';
import { IdentityController } from './identity/identity.controller.js';

@Module({})
export class AppModule {
  static register(config: AppConfig, logger: Logger): DynamicModule {
    return {
      module: AppModule,
      controllers: [HealthController, IdentityController],
      providers: [
        { provide: APP_CONFIG, useValue: config }, { provide: APP_LOGGER, useValue: logger },
        DatabaseService, FirebaseIdentity, Accounts, Sessions, { provide: IDENTITY_VERIFIER, useClass: config.AUTH_MODE === 'disabled' ? DisabledIdentityVerifier : FirebaseVerifier },
        { provide: APP_GUARD, useClass: IdentityGuard },
      ],
      exports: [DatabaseService],
    };
  }
}
