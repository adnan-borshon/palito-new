import { Module, type DynamicModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import type { Logger } from 'pino';
import { CareService } from './care/care.service.js';
import { CareController } from './care/care.controller.js';
import { HealthController } from './health/health.controller.js';
import { APP_CONFIG, type AppConfig } from './platform/config.js';
import { APP_LOGGER } from './platform/logger.js';
import { DatabaseService } from './platform/database.js';
import { DisabledIdentityVerifier, FirebaseVerifier, IDENTITY_VERIFIER, IdentityGuard } from './platform/auth.js';

import { FirebaseIdentity } from './identity/firebase.js';
import { Accounts } from './identity/accounts.js';
import { Sessions } from './identity/sessions.js';
import { Staff } from './identity/staff.js';
import { StaffController } from './identity/staff.controller.js';
import { IdentityController } from './identity/identity.controller.js';
import { OutboxWorkerService } from './ops/outbox.worker.js';
import { OpsService } from './ops/ops.service.js';
import { OpsController } from './ops/ops.controller.js';
import { FinanceService } from './finance/finance.service.js';
import { FinanceController } from './finance/finance.controller.js';
import { ExtensionsService } from './extensions/extensions.service.js';
import { ExtensionsController } from './extensions/extensions.controller.js';

@Module({})
export class AppModule {
  static register(config: AppConfig, logger: Logger): DynamicModule {
    return {
      module: AppModule,
      controllers: [
        HealthController,
        IdentityController,
        StaffController,
        CareController,
        OpsController,
        FinanceController,
        ExtensionsController,
      ],
      providers: [
        { provide: APP_CONFIG, useValue: config },
        { provide: APP_LOGGER, useValue: logger },
        DatabaseService,
        FirebaseIdentity,
        Accounts,
        Sessions,
        Staff,
        CareService,
        OutboxWorkerService,
        OpsService,
        FinanceService,
        ExtensionsService,
        {
          provide: IDENTITY_VERIFIER,
          useClass:
            config.AUTH_MODE === 'disabled'
              ? DisabledIdentityVerifier
              : FirebaseVerifier,
        },
        { provide: APP_GUARD, useClass: IdentityGuard },
      ],
      exports: [DatabaseService, OutboxWorkerService],
    };
  }
}
