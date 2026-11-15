import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { ForbiddenException, ValidationPipe, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import type { Logger } from 'pino';
import { AppModule } from './app.module.js';
import type { AppConfig } from './platform/config.js';
import { FrameworkLogger } from './platform/logger.js';
import { SafeExceptionFilter, sendError, type CorrelatedRequest } from './platform/errors.js';

export function configureApplication(app: INestApplication, config: AppConfig, logger: Logger): void {
  app.setGlobalPrefix('api/v1');
  app.getHttpAdapter().getInstance().set('trust proxy', false);
  app.use((request: Request, response: Response, next: NextFunction) => {
    // Server-generated only: never log or reflect an attacker-controlled correlation ID.
    const requestId = randomUUID();
    (request as CorrelatedRequest).requestId = requestId;
    response.setHeader('X-Request-Id', requestId);
    response.setHeader('Cache-Control', 'no-store');
    const start = performance.now();
    response.once('finish', () => logger.info({ event: 'http_request', requestId, method: request.method, status: response.statusCode, durationMs: Math.round(performance.now() - start) }));
    next();
  });
  app.use(helmet({ strictTransportSecurity: config.NODE_ENV === 'production' ? undefined : false }));
  app.enableCors({
    origin(value: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
      if (!value || config.CORS_ORIGINS.includes(value)) callback(null, true);
      else callback(new ForbiddenException());
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'If-Match', 'X-CSRF-Token'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 600,
  });
  app.use(rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    limit: config.RATE_LIMIT_MAX,
    standardHeaders: 'draft-8', legacyHeaders: false,
    // In-process limiter is appropriate for the single-instance M1 foundation.
    skip: (request: Request) => ['GET', 'HEAD'].includes(request.method) && ['/api/v1/health/live', '/api/v1/health/ready'].includes(request.path),
    handler: (request: Request, response: Response) => sendError(response, 429, (request as CorrelatedRequest).requestId),
  }));
  app.use(express.json({ limit: config.BODY_LIMIT_BYTES, strict: true }));
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true,
    transform: true, transformOptions: { enableImplicitConversion: false },
    validationError: { target: false, value: false },
  }));
  app.useGlobalFilters(new SafeExceptionFilter(logger));
}

export function createOpenApi(app: INestApplication) {
  const options = new DocumentBuilder().setTitle('Palito API').setVersion('0.1.0')
    .setDescription('Identity and session API plus operational health. Healthcare and financial workflows remain gated.')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'Firebase ID token' }, 'firebase').build();
  return SwaggerModule.createDocument(app, options);
}

export async function createApplication(config: AppConfig, logger: Logger): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule.register(config, logger), { bodyParser: false, logger: new FrameworkLogger(logger), abortOnError: false });
  configureApplication(app, config, logger);
  if (config.SWAGGER_ENABLED) {
    const document = createOpenApi(app);
    // Intentional development-only metadata route; rate limits/headers/CORS still apply.
    app.getHttpAdapter().get('/api/openapi.json', (_request: Request, response: Response) => response.json(document));
  }
  return app;
}
