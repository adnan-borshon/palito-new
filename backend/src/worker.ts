import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ConfigurationError, loadConfig } from "./platform/config.js";
import { createLogger, FrameworkLogger } from "./platform/logger.js";
import { OutboxWorkerService } from "./ops/outbox.worker.js";

try {
  const config = loadConfig({ ...process.env, WORKER_ENABLED: "true" });
  const logger = createLogger(config);
  const app = await NestFactory.createApplicationContext(
    AppModule.register(config, logger),
    { logger: new FrameworkLogger(logger), abortOnError: false },
  );
  app.enableShutdownHooks(["SIGTERM", "SIGINT"]);
  const worker = app.get(OutboxWorkerService);
  await worker.runCycle("palito-worker-cli");
  worker.startBackgroundLoop("palito-worker-cli");
  logger.info({
    event: "worker_started",
    pollMs: config.WORKER_POLL_MS,
    batchSize: config.WORKER_BATCH_SIZE,
  });
} catch (error) {
  process.stderr.write(
    error instanceof ConfigurationError
      ? `${error.message}\n`
      : "Palito worker startup failed. Check configuration and database availability.\n",
  );
  process.exitCode = 1;
}
