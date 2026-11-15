'use client';

import Image from 'next/image';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO_ACCOUNTS, type Role } from '@palito/shared';
import { useWebApp } from '@/providers/web-provider.tsx';
import { roleNames, roleSubtitles, webHref } from '@/navigation.ts';
import { Badge, Button, Card, Field, WebIcon } from '@/components/ui.tsx';

const PRIORITY_ROLE_ORDER: Role[] = ['bank', 'vet', 'admin', 'insurer', 'farmer'];

export function WelcomeView() {
  const router = useRouter();
  const { locale, t, run, busy } = useWebApp();
  const [step, setStep] = useState(0);

  const pages = [
    {
      title: t('সুস্থ পশু, সমৃদ্ধ খামার', 'Healthy animals. A thriving farm.'),
      body: t(
        'আপনার খামারের যত্ন, এখন আপনার হাতেই। স্বাস্থ্য, চিকিৎসা ও আর্থিক সেবা—সব একসাথে।',
        'Care for your farm, right in your hands. Animal health, veterinary care, and financial services together.',
      ),
    },
    {
      title: t('যত্নে থাকুক প্রতিটি প্রাণ', 'Every animal. Carefully cared for.'),
      body: t(
        'পশুর স্বাস্থ্য দেখুন, সতর্কতা পান এবং প্রয়োজনে পশুচিকিৎসকের সহায়তা নিন।',
        'Follow animal health, notice alerts, and reach a veterinarian when your animals need care.',
      ),
    },
    {
      title: t('আগামীর জন্য নিরাপদ খামার', 'A secure farm. A brighter tomorrow.'),
      body: t(
        'যাচাইকৃত স্বাস্থ্য পাসপোর্টের মাধ্যমে পশুবীমা ও সহজ শর্তে খামার ঋণ সুবিধা পান।',
        'Access livestock insurance and health-linked farm credit backed by verified digital health passports.',
      ),
    },
  ];

  async function finish() {
    const res = await run({ type: 'session.onboard' });
    if (res.ok) {
      router.replace('/login');
    }
  }

  return (
    <div
      data-testid="welcome-screen"
      className="min-h-dvh flex items-center justify-center bg-[#F8FAFC] p-6"
    >
      <Card className="w-full max-w-2xl flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
                unoptimized
                width={40}
                height={40}
              src="/images/palito-mark.png"
              alt="Palito"
              className="w-10 h-10 rounded-[10px] bg-[#EBF4EE] p-1.5 object-contain"
            />
            <span className="text-lg font-bold text-[#0A401E]">পালিতো · Palito</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              void run({ type: 'session.locale', locale: locale === 'bn' ? 'en' : 'bn' })
            }
          >
            {locale === 'bn' ? 'English' : 'বাংলা'}
          </Button>
        </div>

        <div className="rounded-[16px] bg-[#EBF4EE] p-6 flex items-center justify-center">
          <Image
                unoptimized
                width={320}
                height={320}
            src="/images/onboarding.png"
            alt={t('পালিতের পশুস্বাস্থ্য সেবা', 'Palito livestock care services')}
            className="max-h-56 w-auto object-contain"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <Badge tone="success">
              {t('আপনার খামারের বিশ্বস্ত সঙ্গী', 'Your trusted farming companion')}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0A401E]">
            {pages[step].title}
          </h1>
          <p className="text-sm sm:text-base text-[#475569]">{pages[step].body}</p>
        </div>

        <div
          className="flex items-center justify-center gap-2"
          aria-label={t(
            `৩টির মধ্যে ${step + 1} নম্বর পরিচিতি`,
            `Introduction ${step + 1} of 3`,
          )}
        >
          {pages.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === step ? 'w-6 bg-[#15803D]' : 'w-2 bg-[#CBD5E1]'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
          {step < 2 ? (
            <Button
              variant="ghost"
              disabled={busy}
              data-testid="welcome-skip"
              onClick={() => void finish()}
            >
              {t('পরিচিতি এড়িয়ে যান', 'Skip introduction')}
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="primary"
            icon="chevron-right"
            disabled={busy}
            data-testid="welcome-continue"
            onClick={() => (step === 2 ? void finish() : setStep(step + 1))}
          >
            {step === 2 ? t('শুরু করুন', 'Get started') : t('পরবর্তী', 'Continue')}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export function LoginView() {
  const router = useRouter();
  const { state, repo, locale, t, run, busy, error, feedback, clearError, clearFeedback } =
    useWebApp();
  const [phone, setPhone] = useState(DEMO_ACCOUNTS[3]?.phone ?? '+8801612345678');
  const [code, setCode] = useState('123456');
  const [otpRequested, setOtpRequested] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [requestTick, setRequestTick] = useState(0);
  const otpFormRef = useRef<HTMLFormElement | null>(null);
  const otpAbortRef = useRef<AbortController | null>(null);

  const primaryAccounts = PRIORITY_ROLE_ORDER.map(
    (role) =>
      state.users.find((account) => account.role === role && account.status === 'active') ??
      DEMO_ACCOUNTS.find((account) => account.role === role)!,
  ).filter(Boolean);

  function stopSmsOtpListener() {
    if (otpAbortRef.current) {
      otpAbortRef.current.abort();
      otpAbortRef.current = null;
    }
  }

  useEffect(() => {
    if (!otpRequested || !state.session.otpExpiresAt) return;
    const domainRemaining = Math.max(
      0,
      Math.ceil((Date.parse(state.session.otpExpiresAt) - Date.parse(state.now) - 270000) / 1000),
    );
    const timer = setInterval(() => {
      setResendSeconds(
        Math.max(0, domainRemaining - Math.floor((Date.now() - requestTick) / 1000)),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [otpRequested, requestTick, state.now, state.session.otpExpiresAt]);

  // Progressive enhancement: WebOTP API listener (modern-web-guidance: sms-otp-form)
  useEffect(() => {
    if (!otpRequested || typeof window === 'undefined' || !('OTPCredential' in window)) {
      return;
    }
    stopSmsOtpListener();
    const ac = new AbortController();
    otpAbortRef.current = ac;

    void (
      navigator.credentials as CredentialsContainer & {
        get(options?: CredentialRequestOptions & { otp?: { transport: string[] } }): Promise<
          (Credential & { code?: string }) | null
        >;
      }
    )
      .get({
        otp: { transport: ['sms'] },
        signal: ac.signal,
      })
      .then((otp: (Credential & { code?: string }) | null) => {
        if (!otp?.code) return;
        setCode(otp.code);
        otpFormRef.current?.requestSubmit();
      })
      .catch((err: unknown) => {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') {
          return;
        }
      });

    return () => stopSmsOtpListener();
  }, [otpRequested, requestTick]);

  async function handleSelectQuickAccount(accountPhone: string, accountId: string, role: Role) {
    setPhone(accountPhone);
    const res = await run({ type: 'auth.switch', userId: accountId });
    if (res.ok) {
      router.push(webHref(role, 'home'));
    }
  }

  async function handleRequestOtp() {
    stopSmsOtpListener();
    const targetPhone =
      state.session.pendingPhone && otpRequested ? state.session.pendingPhone : phone;
    const res = await run({ type: 'auth.requestOtp', phone: targetPhone });
    if (res.ok) {
      setOtpRequested(true);
      setRequestTick(Date.now());
      setResendSeconds(30);
    }
  }

  async function handleVerifyOtp(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    stopSmsOtpListener();
    const res = await run({ type: 'auth.verifyOtp', code });
    if (res.ok) {
      const snapshot = repo.getSnapshot();
      const matched =
        snapshot.users.find((u) => u.id === snapshot.session.userId) ??
        state.users.find((u) =>
          u.phone.replace(/\D/g, '').endsWith(phone.replace(/\D/g, '').slice(-10)),
        );
      router.push(webHref(matched?.role ?? 'bank', 'home'));
    }
  }

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-12 bg-[#F8FAFC]">
      {/* Left Brand & Institutional Showcase Column */}
      <section className="lg:col-span-6 bg-[#0A401E] text-white p-8 lg:p-14 flex flex-col justify-between gap-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
                unoptimized
                width={44}
                height={44}
              src="/images/palito-mark.png"
              alt="Palito"
              className="w-11 h-11 rounded-[12px] bg-white p-1.5 object-contain"
            />
            <div>
              <div className="text-xl font-bold tracking-tight">পালিতো · Palito</div>
              <div className="text-xs text-[#D8E9DE]">
                {t(
                  'প্রাণী স্বাস্থ্য, কৃষি ঋণ ও বীমা ব্যবস্থাপনা প্ল্যাটফর্ম',
                  'Livestock Health, Underwriting & Operations Platform',
                )}
              </div>
            </div>
          </div>

          <div className="inline-flex rounded-[10px] border border-white/20 bg-white/10 p-0.5">
            <button
              type="button"
              onClick={() => void run({ type: 'session.locale', locale: 'bn' })}
              className={`rounded-[8px] px-3 py-1 text-xs font-bold cursor-pointer ${
                locale === 'bn' ? 'bg-white text-[#0A401E]' : 'text-white/80 hover:text-white'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => void run({ type: 'session.locale', locale: 'en' })}
              className={`rounded-[8px] px-3 py-1 text-xs font-bold cursor-pointer ${
                locale === 'en' ? 'bg-white text-[#0A401E]' : 'text-white/80 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6 max-w-xl">
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight text-white">
            {t(
              'ব্যাংক, পশুচিকিৎসক, প্রশাসক ও খামারিদের সমন্বিত ওয়ার্কবেঞ্চ',
              'Unified workbench for banks, veterinarians, insurers, administrators, and farmers',
            )}
          </h1>
          <p className="text-base text-[#EBF4EE]/90">
            {t(
              'যাচাইকৃত প্রাণী স্বাস্থ্য পাসপোর্ট, ৭ দিনের আইওটি ভাইটালস, ৭০% জামানত ঋণ মূল্যায়ন এবং স্বয়ংক্রিয় বীমা দাবি নিষ্পত্তি এখন এক প্ল্যাটফর্মে।',
              'Verified Animal Health Passports, 7-day IoT telemetry, 70% LTV collateral underwriting, digital prescriptions, and debt-first insurance claim settlements in one workspace.',
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="rounded-[14px] border border-white/15 bg-white/10 p-4">
              <div className="text-xs text-[#D8E9DE]">
                {t('ব্যাংক আন্ডাররাইটিং', 'Bank Underwriting')}
              </div>
              <div className="text-lg font-bold mt-1 tabular-nums">70% LTV Cap</div>
              <div className="text-xs text-white/75 mt-1">
                {t('স্বাস্থ্য স্কোর ও পাসপোর্ট যাচাই', 'Health passport & IoT verified')}
              </div>
            </div>
            <div className="rounded-[14px] border border-white/15 bg-white/10 p-4">
              <div className="text-xs text-[#D8E9DE]">
                {t('ক্লিনিক্যাল ট্রায়াজ', 'Clinical Triage')}
              </div>
              <div className="text-lg font-bold mt-1 tabular-nums">4h SLA Alert</div>
              <div className="text-xs text-white/75 mt-1">
                {t('জরুরি কল ও ডিজিটাল প্রেসক্রিপশন', 'Emergency dispatch & digital Rx')}
              </div>
            </div>
            <div className="rounded-[14px] border border-white/15 bg-white/10 p-4">
              <div className="text-xs text-[#D8E9DE]">
                {t('বীমা সেটেলমেন্ট', 'Claim Settlement')}
              </div>
              <div className="text-lg font-bold mt-1 tabular-nums">Debt-First</div>
              <div className="text-xs text-white/75 mt-1">
                {t('ব্যাংক ঋণ সমন্বয় ও খামারি পেআউট', 'Auto bank loan & farmer payout')}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#D8E9DE]/80 border-t border-white/15 pt-4">
          <span>{t('পালিতো লাইভস্টক প্ল্যাটফর্ম · বাংলাদেশ', 'Palito Livestock Platform · Bangladesh')}</span>
          <span>Asia/Dhaka (BDT ৳)</span>
        </div>
      </section>

      {/* Right Sign-In & Role Selector Column */}
      <section className="lg:col-span-6 p-6 sm:p-10 lg:p-14 flex items-center justify-center">
        <div className="w-full max-w-xl flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1F2937]">
              {t('আপনার অ্যাকাউন্টে প্রবেশ করুন', 'Sign in to your workspace')}
            </h2>
            <p className="text-sm text-[#64748B] mt-1">
              {t(
                'নিচের যেকোনো রোলে এক ক্লিকে প্রবেশ করুন অথবা মোবাইল নম্বর ও ওটিপি দিয়ে লগইন করুন।',
                'Select a workspace role below for instant access or sign in with your registered mobile number and OTP.',
              )}
            </p>
          </div>

          {error || feedback ? (
            <div
              className={`rounded-[12px] border px-4 py-3 text-sm font-medium ${
                error
                  ? 'border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C]'
                  : 'border-[#D8E9DE] bg-[#EBF4EE] text-[#0F602D]'
              }`}
            >
              {error ?? feedback}
            </div>
          ) : null}

          {/* Priority Role Quick Access Cards */}
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#1F2937]">
                {t('দ্রুত রোল নির্বাচন (১-ক্লিক অ্যাক্সেস)', 'Quick Role Access (1-Click Sign In)')}
              </span>
              <Badge tone="brand">{t('৫টি রোল প্রস্তুত', 'All 5 Roles')}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {primaryAccounts.map((account) => {
                const isPriority = ['bank', 'vet', 'admin'].includes(account.role);
                return (
                  <button
                    key={account.id}
                    type="button"
                    disabled={busy}
                    data-testid={`demo-${account.role}`}
                    onClick={() =>
                      void handleSelectQuickAccount(account.phone, account.id, account.role)
                    }
                    className={`flex flex-col justify-between gap-1.5 rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${
                      isPriority
                        ? 'border-[#D8E9DE] bg-[#EBF4EE]/55 hover:bg-[#EBF4EE]'
                        : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[#1F2937]">
                        {roleNames[account.role][locale]}
                      </span>
                      <WebIcon name="chevron-right" className="w-4 h-4 text-[#15803D]" />
                    </div>
                    <div className="text-xs font-semibold text-[#0F602D]">
                      {locale === 'bn' ? account.nameBn : account.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] line-clamp-1">
                      {roleSubtitles[account.role][locale]}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Standard Phone + OTP Verification Workflow (modern-web-guidance: sms-otp-form) */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-bold text-[#1F2937]">
                {t('মোবাইল নম্বর ও ওটিপি যাচাইকরণ', 'Phone Number & OTP Verification')}
              </div>
              <Link
                href="/welcome"
                className="text-xs font-semibold text-[#15803D] hover:underline"
              >
                {t('পরিচিতি দেখুন', 'Onboarding Guide')}
              </Link>
            </div>

            <Field
              label={t('নিবন্ধিত মোবাইল নম্বর', 'Registered Mobile Number')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801612345678"
              autoComplete="tel"
              hint={t(
                'ব্যাংক: +8801612345678 · ভেট: +8801912345678 · অ্যাডমিন: +8801312345678 · বীমা: +8801512345678 · খামারি: +8801712345678',
                'Bank: +8801612345678 · Vet: +8801912345678 · Admin: +8801312345678 · Insurer: +8801512345678 · Farmer: +8801712345678',
              )}
              data-testid="phone-input"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant={otpRequested ? 'secondary' : 'primary'}
                icon="phone"
                disabled={busy || (otpRequested && resendSeconds > 0)}
                data-testid={otpRequested ? 'resend-otp' : 'request-otp'}
                onClick={() => void handleRequestOtp()}
              >
                {otpRequested
                  ? resendSeconds > 0
                    ? t(`${resendSeconds} সেকেন্ড পরে আবার কোড নিন`, `Resend code in ${resendSeconds}s`)
                    : t('আবার কোড নিন', 'Resend OTP Code')
                  : t('ওটিপি পাঠান', 'Send OTP Code')}
              </Button>
              {otpRequested ? (
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    stopSmsOtpListener();
                    setOtpRequested(false);
                    setCode('123456');
                    clearError();
                    clearFeedback();
                  }}
                >
                  {t('নম্বর পরিবর্তন করুন', 'Change Phone Number')}
                </Button>
              ) : null}
            </div>

            <form
              ref={otpFormRef}
              method="POST"
              onSubmit={(e) => void handleVerifyOtp(e)}
              className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-3"
            >
              <Field
                type="text"
                name="otp"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                hintAbove
                label={t('৬-সংখ্যার ওটিপি কোড', '6-Digit Verification Code')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                autoComplete="one-time-code"
                hint={t(
                  'আপনার ফোনে পাঠানো ৬-সংখ্যার কোডটি লিখুন (কোড: 123456 · মেয়াদ ৫ মিনিট)',
                  'Enter the 6-digit code sent to your phone (Code: 123456 · valid for 5 minutes)',
                )}
                data-testid="otp-input"
              />
              <Button
                type="submit"
                variant="primary"
                icon="check"
                disabled={busy}
                data-testid="verify-otp"
              >
                {t('যাচাই করে প্রবেশ করুন', 'Verify & Enter Workspace')}
              </Button>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
