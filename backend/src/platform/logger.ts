import { pino, type DestinationStream, type Logger } from 'pino';
import type { LoggerService } from '@nestjs/common';
import type { AppConfig } from './config.js';

const REDACTED_FIELDS = [
  'password',
  'token',
  'authorization',
  'cookie',
  'phone',
  'databaseUrl',
  'idToken',
  'accessToken',
  'refreshToken',
  'invitationToken',
  'csrfToken',
  'callToken',
  'secret',
  'provisioningSecret',
  'deviceSecret',
  'webhookSecret',
  'signedUrl',
  'otp',
] as const;

const REDACT_PATHS = [
  ...REDACTED_FIELDS,
  ...REDACTED_FIELDS.map((field) => `*.${field}`),
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-palito-device-secret"]',
  'req.headers["x-csrf-token"]',
  'req.headers["x-palito-webhook-signature"]',
];

export const APP_LOGGER = Symbol('APP_LOGGER');
export function createLogger(config: AppConfig, destination?: DestinationStream): Logger {
  const options = {
    level: config.LOG_LEVEL,
    base: { service: 'palito-api' },
    redact: {
      paths: REDACT_PATHS,
      censor: '[REDACTED]',
    },
  };
  return destination ? pino(options, destination) : pino(options);
}

// Framework messages/exceptions can contain user data. Log lifecycle categories only.
export class FrameworkLogger implements LoggerService {
  constructor(private readonly logger: Logger) {}
  log() { this.logger.info({ event: 'framework' }); }
  error() { this.logger.error({ event: 'framework_error' }); }
  warn() { this.logger.warn({ event: 'framework_warning' }); }
  debug() { this.logger.debug({ event: 'framework_debug' }); }
  verbose() { this.logger.debug({ event: 'framework_verbose' }); }
  fatal() { this.logger.fatal({ event: 'framework_fatal' }); }
}
