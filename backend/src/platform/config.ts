import { z } from 'zod';

const integer = (fallback: number, min: number, max: number) =>
  z.preprocess(value => value === undefined ? fallback : value, z.coerce.number().int().min(min).max(max));
const origin = z.string().url().refine(value => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return ['http:', 'https:'].includes(url.protocol) && url.origin === value && !url.username && !url.password;
});
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.enum(['127.0.0.1', '0.0.0.0', '::1']).default('127.0.0.1'),
  PORT: integer(4000, 1, 65535),
  DATABASE_URL: z.string().url().refine(value => URL.canParse(value) && ['postgres:', 'postgresql:'].includes(new URL(value).protocol)),
  CORS_ORIGINS: z.string().default('').transform(value => value ? value.split(',').map(item => item.trim()) : []).pipe(z.array(origin)),
  LOG_LEVEL: z.enum(['silent', 'error', 'warn', 'info', 'debug']).default('info'),
  BODY_LIMIT_BYTES: integer(262144, 1024, 1048576),
  RATE_LIMIT_MAX: integer(120, 1, 10000),
  RATE_LIMIT_WINDOW_MS: integer(60000, 1000, 3600000),
  DATABASE_TIMEOUT_MS: integer(2000, 100, 10000),
  SWAGGER_ENABLED: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  AUTH_MODE: z.enum(['disabled', 'firebase', 'emulator']).default('disabled'),
  FIREBASE_PROJECT_ID: z.string().regex(/^[a-z][a-z0-9-]{4,62}$/).default('demo-palito'),
  WEB_ORIGIN: origin.default('http://localhost:3000'),
  HEALTHCARE_NO_CHARGE_PILOT: z.enum(['true','false']).default('false').transform(value=>value==='true'),
  FINANCE_SANDBOX_ENABLED: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  PAYMENT_PROVIDER: z.enum(['disabled', 'sandbox']).default('disabled'),
  SANDBOX_WEBHOOK_SECRET: z.string().min(16).max(256).optional(),
  NOTIFICATION_CHANNEL_MODE: z.enum(['in-app-only', 'sandbox']).default('in-app-only'),
  WORKER_ENABLED: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  WORKER_POLL_MS: integer(5000, 500, 60000),
  WORKER_BATCH_SIZE: integer(25, 1, 100),
  EXTENSIONS_SANDBOX_ENABLED: z.enum(['true', 'false']).default('false').transform(value => value === 'true'),
  DEMO_MODE: z.literal('false').default('false'),
});

export type AppConfig = Readonly<Omit<z.infer<typeof schema>, 'CORS_ORIGINS'> & { CORS_ORIGINS: readonly string[] }>;
export const APP_CONFIG = Symbol('APP_CONFIG');
export class ConfigurationError extends Error {}

export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  const result = schema.safeParse(env);
  if (!result.success) {
    const fields = [...new Set(result.error.issues.map(issue => issue.path[0]))].join(', ');
    throw new ConfigurationError(`Invalid configuration fields: ${fields}`);
  }
  const config = result.data;
  const emulator = env.FIREBASE_AUTH_EMULATOR_HOST;
  if (config.AUTH_MODE === 'emulator' && (config.NODE_ENV === 'production' || !config.FIREBASE_PROJECT_ID.startsWith('demo-') || !emulator || !/^(127\.0\.0\.1|localhost):[0-9]{2,5}$/.test(emulator))) throw new ConfigurationError('Emulator requires a local demo project');
  if (config.AUTH_MODE !== 'emulator' && emulator) throw new ConfigurationError('Unexpected Firebase emulator configuration');
  if (config.AUTH_MODE === 'firebase' && config.FIREBASE_PROJECT_ID.startsWith('demo-')) throw new ConfigurationError('Live Firebase requires a real project ID');
  if (config.NODE_ENV === 'production' && !config.WEB_ORIGIN.startsWith('https://')) throw new ConfigurationError('Production requires HTTPS web origin');
  if (config.NODE_ENV !== 'test' && new URL(config.DATABASE_URL).username !== 'palito_runtime') {
    throw new ConfigurationError('DATABASE_URL must use the dedicated palito_runtime role');
  }
  if (config.NODE_ENV === 'production') {
    if (
      config.SWAGGER_ENABLED ||
      env.FIREBASE_AUTH_EMULATOR_HOST ||
      config.PAYMENT_PROVIDER === 'sandbox' ||
      config.FINANCE_SANDBOX_ENABLED ||
      config.NOTIFICATION_CHANNEL_MODE === 'sandbox' ||
      config.SANDBOX_WEBHOOK_SECRET ||
      config.EXTENSIONS_SANDBOX_ENABLED
    ) {
      throw new ConfigurationError('Production forbids development documentation, emulators and sandbox providers');
    }
    if (config.CORS_ORIGINS.some(value => !value.startsWith('https://'))) throw new ConfigurationError('Production requires HTTPS CORS origins');
    if (new URL(config.DATABASE_URL).searchParams.get('sslmode') !== 'verify-full') {
      throw new ConfigurationError('Production database requires sslmode=verify-full');
    }
  }
  return Object.freeze({ ...config, CORS_ORIGINS: Object.freeze(config.CORS_ORIGINS) });
}
