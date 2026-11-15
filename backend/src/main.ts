import { createApplication } from './application.js';
import { ConfigurationError, loadConfig } from './platform/config.js';
import { createLogger } from './platform/logger.js';

try {
  const config = loadConfig(process.env);
  const logger = createLogger(config);
  const app = await createApplication(config, logger);
  app.enableShutdownHooks(['SIGTERM', 'SIGINT']);
  const server = app.getHttpServer();
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  server.keepAliveTimeout = 5000;
  await app.listen(config.PORT, config.HOST);
  logger.info({ event: 'application_started', port: config.PORT, authMode: config.AUTH_MODE });
} catch (error) {
  // Environment/parser/provider errors may contain secrets; never echo raw exceptions.
  process.stderr.write(error instanceof ConfigurationError ? `${error.message}\n` : 'Palito API startup failed. Check configuration and service availability.\n');
  process.exitCode = 1;
}
