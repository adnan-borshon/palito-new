import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createDemoRepository, type CommandResult, type DemoCommand, type DemoRepository, type DemoState, type Locale, type Role, type User } from '@palito/shared';
import { LocaleContext } from './locale';

export interface DemoContextValue {
  state: DemoState; repo: DemoRepository; user: User | undefined; role: Role | undefined; locale: Locale;
  t: (bn: string, en: string) => string; money: (amount: number) => string; date: (iso: string) => string;
  run: (command: DemoCommand) => Promise<CommandResult>; busy: boolean; ready: boolean;
  error: string | null; feedback: string | null; clearError: () => void; clearFeedback: () => void;
}
const DemoContext = createContext<DemoContextValue | null>(null);
const unexpected: CommandResult = { ok: false, code: 'unknown', message: { bn: 'কাজটি শেষ করা যায়নি। আবার চেষ্টা করুন।', en: 'This action could not finish. Please try again.' } };

export function DemoProvider({ children, repository }: { children: ReactNode; repository?: DemoRepository }) {
  const [repo] = useState(() => repository ?? createDemoRepository({ storage: AsyncStorage, latencyMs: 180 }));
  const state = useSyncExternalStore(repo.subscribe, repo.getSnapshot, repo.getSnapshot);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(0);
  const [errorMessage, setError] = useState<CommandResult | null>(null);
  const [successMessage, setSuccess] = useState<CommandResult | null>(null);
  useEffect(() => {
    let alive = true;
    void repo.hydrate().then(result => { if (alive) { if (!result.ok) setError(result); setReady(true); } }, () => { if (alive) { setError(unexpected); setReady(true); } });
    return () => { alive = false; };
  }, [repo]);
  const locale = state.session.locale;
  const t = useCallback((bn: string, en: string) => locale === 'bn' ? bn : en, [locale]);
  const currency = useMemo(() => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }), [locale]);
  const dates = useMemo(() => new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka' }), [locale]);
  const money = useCallback((amount: number) => currency.format(amount), [currency]);
  const date = useCallback((iso: string) => Number.isNaN(Date.parse(iso)) ? '—' : dates.format(new Date(iso)), [dates]);
  const clearError = useCallback(() => setError(null), []);
  const clearFeedback = useCallback(() => setSuccess(null), []);
  const run = useCallback(async (command: DemoCommand): Promise<CommandResult> => {
    setPending(value => value + 1); setError(null); setSuccess(null);
    try {
      const result = await repo.execute(command);
      if (!result.ok) setError(result); else if (result.message) setSuccess(result);
      return result;
    } catch { setError(unexpected); return unexpected; }
    finally { setPending(value => value - 1); }
  }, [repo]);
  const user = state.users.find(account => account.id === state.session.userId);
  const value: DemoContextValue = {
    state, repo, user, role: user?.role, locale, t, money, date, run, ready, busy: pending > 0,
    error: errorMessage?.message?.[locale] ?? null, feedback: successMessage?.message?.[locale] ?? null,
    clearError, clearFeedback,
  };
  return <DemoContext.Provider value={value}><LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider></DemoContext.Provider>;
}
export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext);
  if (!value) throw new Error('useDemo must be inside DemoProvider');
  return value;
}
