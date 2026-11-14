import type { CommandResult, DemoCommand, DemoRepository, DemoState, RepositoryOptions } from './types.ts';
import { createDemoState } from './fixtures.ts';
import { actor, bilingual, nextId, notify } from './domain-context.ts';
import { assertDomain, DomainError, messages } from './errors.ts';
import { handleHealth } from './health.ts';
import { handleFinance } from './finance.ts';
import { handleSupport } from './support.ts';
import { assertState } from './persistence.ts';
import { elapsedHours, hasText, isoAfter } from './validation.ts';

export const DEMO_STORAGE_KEY = 'palito.demo.v1';
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function canonical(value: unknown): string {
  if (value && typeof value === 'object' && !Array.isArray(value)) return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  return JSON.stringify(value) ?? 'null';
}
const failure = (error: unknown): CommandResult => error instanceof DomainError
  ? { ok: false, code: error.code === 'success' ? 'unknown' : error.code, message: messages[error.code] }
  : { ok: false, code: 'validation', message: messages.validation };
const localCommand = (command: DemoCommand) => command.type.startsWith('demo.') || command.type.startsWith('session.') || ['auth.switch', 'auth.logout', 'settings.notifications', 'notification.read', 'reminder.toggle', 'reminder.take'].includes(command.type);
const publicCommand = (command: DemoCommand) => command.type.startsWith('demo.') || command.type.startsWith('auth.') || command.type.startsWith('session.');

function advanceClock(state: DemoState, hours: number) {
  assertDomain(Number.isFinite(hours) && hours > 0 && hours <= 24 * 366);
  state.now = isoAfter(state.now, hours * 60);
  for (const alert of state.alerts.filter(item => item.status === 'open' && elapsedHours(item.createdAt, state.now) >= 4)) {
    alert.status = 'escalated';
    const animal = state.animals.find(item => item.id === alert.animalId)!;
    for (const vet of state.users.filter(item => item.role === 'vet' && item.status === 'active')) notify(state, vet.id, bilingual('৪ ঘণ্টার অমীমাংসিত সতর্কতা', 'Unacknowledged alert after four hours'), bilingual('কৃষকের সঙ্গে জরুরি ফলোআপ প্রয়োজন।', 'An urgent follow-up with the farmer is needed.'), 'emergency', alert.id);
    notify(state, animal.ownerId, bilingual('সতর্কতা এসকেলেট হয়েছে', 'Alert escalated'), bilingual('পশুচিকিৎসকের কাছে ফলোআপ অনুরোধ পাঠানো হয়েছে।', 'A follow-up request was sent to the veterinarian.'), 'alerts', alert.id);
  }
  for (const policy of state.policies.filter(item => item.status === 'active' && item.expiresAt && item.expiresAt <= state.now)) {
    policy.status = 'expired'; notify(state, policy.farmerId, bilingual('বীমার মেয়াদ শেষ', 'Insurance expired'), bilingual('নবায়নের বিকল্প দেখুন।', 'Review your renewal options.'), 'insurance', policy.id);
  }
  for (const claim of state.claims.filter(item => ['manual_review', 'vet_review'].includes(item.status) && elapsedHours(item.createdAt, state.now) >= 7 * 24)) {
    if (!state.notifications.some(item => item.entityId === claim.id && item.screen === 'review-overdue')) notify(state, claim.insurerId, bilingual('দাবি পর্যালোচনা ৭ দিন পেরিয়েছে', 'Claim review older than seven days'), bilingual('অগ্রাধিকার ভিত্তিতে দাবির ফলোআপ সম্পন্ন করুন।', 'Complete a priority follow-up on this pending claim.'), 'review-overdue', claim.id);
  }
}

export function createDemoRepository(options: RepositoryOptions = {}): DemoRepository {
  const initial = options.initialState ? clone(options.initialState) : createDemoState('normal', options.now?.() ?? new Date());
  assertState(initial);
  let state = freeze(initial);
  let queue: Promise<unknown> = Promise.resolve();
  let failNext = false;
  const listeners = new Set<() => void>();
  function serial<T>(operation: () => Promise<T>): Promise<T> {
    const result = queue.then(operation, operation); queue = result.then(() => undefined, () => undefined); return result;
  }
  async function commit(draft: DemoState) {
    assertState(draft);
    if (options.storage) {
      try { await options.storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(draft)); }
      catch { throw new DomainError('storage'); }
    }
    state = freeze(draft);
    for (const listener of listeners) { try { listener(); } catch { /* A view listener cannot roll back a committed transaction. */ } }
  }
  async function executeCommand(command: DemoCommand): Promise<CommandResult> {
    try {
      assertDomain(command && typeof command.type === 'string');
      if (!publicCommand(command)) actor(state);
      if (command.requestId !== undefined) assertDomain(hasText(command.requestId, 1, 150));
      const fingerprint = canonical({ actorId: state.session.userId, ...command });
      const previous = command.requestId ? state.processedRequests.find(item => item.requestId === command.requestId) : undefined;
      if (previous) {
        assertDomain(previous.command === fingerprint, 'duplicate');
        return { ok: true, id: previous.resultId, message: messages.success };
      }
      if (!localCommand(command)) {
        assertDomain(!state.settings.offline, 'offline');
        if (failNext) { failNext = false; throw new DomainError('network'); }
      }
      const latency = options.latencyMs ?? 0;
      if (latency > 0 && Number.isFinite(latency)) await new Promise<void>(resolve => {
        const schedule = (globalThis as unknown as { setTimeout(callback: () => void, milliseconds: number): unknown }).setTimeout;
        schedule(resolve, Math.min(latency, 5000));
      });
      let draft = clone(state); let result: { id?: string } | undefined;
      switch (command.type) {
        case 'demo.offline': assertDomain(typeof command.offline === 'boolean'); draft.settings.offline = command.offline; result = {}; break;
        case 'demo.failNext': result = {}; break;
        case 'demo.advanceTime': advanceClock(draft, command.hours); result = {}; break;
        case 'demo.reset': {
          assertDomain(['normal', 'health', 'insurance', 'lending', 'empty'].includes(command.scenario));
          draft = createDemoState(command.scenario, new Date(state.now)); draft.session = { userId: state.session.userId, locale: state.session.locale, onboarded: state.session.onboarded }; result = {}; break;
        }
        default: result = handleSupport(draft, command) ?? handleHealth(draft, command) ?? handleFinance(draft, command);
      }
      assertDomain(result, 'validation');
      draft.revision = state.revision + 1;
      if (command.requestId) draft.processedRequests.push({ requestId: command.requestId, command: fingerprint, resultId: result.id });
      // Keep identifiers and action labels only: OTP values and personal form text never enter the audit log.
      draft.audit.push({ id: nextId(draft, 'audit'), actorId: state.session.userId ?? 'guest', action: command.type, entityId: result.id, at: draft.now, detail: 'কার্যক্রম নিবন্ধিত / Activity recorded' });
      await commit(draft);
      if (command.type === 'demo.failNext') failNext = true;
      if (command.type === 'demo.reset') failNext = false;
      return { ok: true, id: result.id, message: messages.success };
    } catch (error) { return failure(error); }
  }
  return {
    getSnapshot: () => state,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    hydrate: () => serial(async () => {
      if (!options.storage) return { ok: true };
      let saved: string | null;
      try { saved = await options.storage.getItem(DEMO_STORAGE_KEY); } catch { return { ok: false, code: 'storage', message: messages.storage }; }
      if (saved === null) return { ok: true };
      try {
        let parsed: unknown; try { parsed = JSON.parse(saved); } catch { throw new DomainError('corrupt_storage'); }
        assertState(parsed); state = freeze(parsed); failNext = false;
        for (const listener of listeners) { try { listener(); } catch { /* View listeners do not invalidate hydration. */ } }
        return { ok: true };
      } catch (error) { return failure(error); }
    }),
    execute(command) {
      // Capture immediately so callers cannot mutate a queued command before it is validated.
      let captured: DemoCommand; try { captured = clone(command); } catch { return Promise.resolve({ ok: false, code: 'validation', message: messages.validation }); }
      return serial(() => executeCommand(captured));
    },
  };
}
