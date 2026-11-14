import {
  createDemoRepository,
  type CommandResult,
  type DemoCommand,
  type DemoRepository,
  type RepositoryOptions,
} from '@palito/shared';
import { browserStorage } from './storage.ts';

let requestCounter = 0;

export function createRequestId(prefix = 'web'): string {
  requestCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${requestCounter.toString(36)}`;
}

const NON_IDEMPOTENT_TYPES = new Set([
  'demo.offline',
  'demo.failNext',
  'demo.advanceTime',
  'demo.reset',
  'session.locale',
  'session.onboard',
  'auth.switch',
  'auth.logout',
]);

/**
 * Creates a backend-ready Palito client.
 * Today this wraps createDemoRepository with browser localStorage and automatic
 * requestId attachment; later you can swap this factory to an HTTP/tRPC transport
 * sending `Idempotency-Key: command.requestId` to your backend server.
 */
export function createPalitoWebClient(options: RepositoryOptions = {}): DemoRepository {
  const baseRepo = createDemoRepository({
    storage: browserStorage,
    latencyMs: 120,
    ...options,
  });

  return {
    getSnapshot: baseRepo.getSnapshot,
    subscribe: baseRepo.subscribe,
    hydrate: baseRepo.hydrate,
    async execute(command: DemoCommand): Promise<CommandResult> {
      const enriched: DemoCommand =
        command.requestId || NON_IDEMPOTENT_TYPES.has(command.type)
          ? command
          : { ...command, requestId: createRequestId(command.type.replace('.', '_')) };
      return baseRepo.execute(enriched);
    },
  };
}
