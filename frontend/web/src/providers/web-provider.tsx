'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  type CommandResult,
  type DemoCommand,
  type DemoRepository,
  type DemoState,
  type Locale,
  type Role,
  type User,
} from '@palito/shared';
import { createPalitoWebClient } from '@/lib/client.ts';

export interface WebAppContextValue {
  state: DemoState;
  repo: DemoRepository;
  user: User | undefined;
  role: Role | undefined;
  locale: Locale;
  t: (bn: string, en: string) => string;
  money: (amount: number) => string;
  date: (iso: string) => string;
  dateTime: (iso: string) => string;
  run: (command: DemoCommand) => Promise<CommandResult>;
  busy: boolean;
  ready: boolean;
  error: string | null;
  feedback: string | null;
  clearError: () => void;
  clearFeedback: () => void;
  mobileHandoff: { open: boolean; role: Role; screen: string; id?: string; title?: string } | null;
  openMobileHandoff: (target: { role: Role; screen: string; id?: string; title?: string }) => void;
  closeMobileHandoff: () => void;
}

const WebAppContext = createContext<WebAppContextValue | null>(null);

const unexpectedError: CommandResult = {
  ok: false,
  code: 'unknown',
  message: {
    bn: 'কাজটি শেষ করা যায়নি। আবার চেষ্টা করুন।',
    en: 'This action could not finish. Please try again.',
  },
};

export function WebAppProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: DemoRepository;
}) {
  const [repo] = useState(() => repository ?? createPalitoWebClient());
  const state = useSyncExternalStore(repo.subscribe, repo.getSnapshot, repo.getSnapshot);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(0);
  const [errorResult, setErrorResult] = useState<CommandResult | null>(null);
  const [successResult, setSuccessResult] = useState<CommandResult | null>(null);
  const [mobileHandoff, setMobileHandoff] = useState<WebAppContextValue['mobileHandoff']>(null);

  useEffect(() => {
    let alive = true;
    void repo.hydrate().then(
      (result) => {
        if (alive) {
          if (!result.ok) setErrorResult(result);
          setReady(true);
        }
      },
      () => {
        if (alive) {
          setErrorResult(unexpectedError);
          setReady(true);
        }
      },
    );
    return () => {
      alive = false;
    };
  }, [repo]);

  const locale = state.session.locale;
  const t = useCallback((bn: string, en: string) => (locale === 'bn' ? bn : en), [locale]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
        style: 'currency',
        currency: 'BDT',
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  const dates = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Dhaka',
      }),
    [locale],
  );
  const dateTimes = useMemo(
    () =>
      new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Dhaka',
      }),
    [locale],
  );

  const money = useCallback((amount: number) => currency.format(amount), [currency]);
  const date = useCallback(
    (iso: string) => (Number.isNaN(Date.parse(iso)) ? '—' : dates.format(new Date(iso))),
    [dates],
  );
  const dateTime = useCallback(
    (iso: string) => (Number.isNaN(Date.parse(iso)) ? '—' : dateTimes.format(new Date(iso))),
    [dateTimes],
  );

  const clearError = useCallback(() => setErrorResult(null), []);
  const clearFeedback = useCallback(() => setSuccessResult(null), []);
  const openMobileHandoff = useCallback(
    (target: { role: Role; screen: string; id?: string; title?: string }) =>
      setMobileHandoff({ open: true, ...target }),
    [],
  );
  const closeMobileHandoff = useCallback(() => setMobileHandoff(null), []);

  const run = useCallback(
    async (command: DemoCommand): Promise<CommandResult> => {
      setPending((v) => v + 1);
      setErrorResult(null);
      setSuccessResult(null);
      try {
        const result = await repo.execute(command);
        if (!result.ok) setErrorResult(result);
        else if (result.message) setSuccessResult(result);
        return result;
      } catch {
        setErrorResult(unexpectedError);
        return unexpectedError;
      } finally {
        setPending((v) => v - 1);
      }
    },
    [repo],
  );

  const user = state.users.find((account) => account.id === state.session.userId);

  const value: WebAppContextValue = {
    state,
    repo,
    user,
    role: user?.role,
    locale,
    t,
    money,
    date,
    dateTime,
    run,
    busy: pending > 0,
    ready,
    error: errorResult && !errorResult.ok ? errorResult.message[locale] : null,
    feedback: successResult && successResult.ok && successResult.message ? successResult.message[locale] : null,
    clearError,
    clearFeedback,
    mobileHandoff,
    openMobileHandoff,
    closeMobileHandoff,
  };

  return <WebAppContext.Provider value={value}>{children}</WebAppContext.Provider>;
}

export function useWebApp(): WebAppContextValue {
  const value = useContext(WebAppContext);
  if (!value) throw new Error('useWebApp must be used inside WebAppProvider');
  return value;
}
