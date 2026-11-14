'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEMO_ACCOUNTS, type Role } from '@palito/shared';
import { useWebApp } from '@/providers/web-provider.tsx';
import { roleNames, roleSubtitles, webHref } from '@/navigation.ts';
import { Badge, Button, Card, Field, WebIcon } from '@/components/ui.tsx';

const PRIORITY_ROLE_ORDER: Role[] = ['bank', 'vet', 'admin', 'insurer', 'farmer'];

export function LoginView() {
  const router = useRouter();
  const { state, locale, t, run, busy, error, feedback } = useWebApp();
  const [phone, setPhone] = useState(DEMO_ACCOUNTS[2]?.phone ?? '+8801711000003');
  const [code, setCode] = useState('123456');
  const [otpRequested, setOtpRequested] = useState(false);

  const primaryAccounts = PRIORITY_ROLE_ORDER.map(
    (role) => DEMO_ACCOUNTS.find((account) => account.role === role)!,
  ).filter(Boolean);

  async function handleSelectQuickAccount(accountPhone: string, accountId: string, role: Role) {
    setPhone(accountPhone);
    const res = await run({ type: 'auth.switch', userId: accountId });
    if (res.ok) {
      router.push(webHref(role, 'home'));
    }
  }

  async function handleRequestOtp() {
    const res = await run({ type: 'auth.requestOtp', phone });
    if (res.ok) {
      setOtpRequested(true);
    }
  }

  async function handleVerifyOtp() {
    const res = await run({ type: 'auth.verifyOtp', code });
    if (res.ok) {
      const matched = state.users.find((u) => u.phone.replace(/\D/g, '').endsWith(phone.replace(/\D/g, '').slice(-10)));
      router.push(webHref(matched?.role ?? 'bank', 'home'));
    }
  }

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-12 bg-[#F8FAFC]">
      {/* Left Brand & Institutional Showcase Column */}
      <section className="lg:col-span-6 bg-[#0A401E] text-white p-8 lg:p-14 flex flex-col justify-between gap-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
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

          {/* Standard Phone + OTP Verification Workflow */}
          <Card className="flex flex-col gap-4">
            <div className="text-sm font-bold text-[#1F2937]">
              {t('মোবাইল নম্বর ও ওটিপি যাচাইকরণ', 'Phone Number & OTP Verification')}
            </div>

            <Field
              label={t('নিবন্ধিত মোবাইল নম্বর', 'Registered Mobile Number')}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+8801711000003"
              autoComplete="tel"
              hint={t(
                'ব্যাংক: +8801711000003 · ভ7ট: +8801711000002 · অ্যাডমিন: +8801711000005 · খামারি: +8801711000001',
                'Bank: +8801711000003 · Vet: +8801711000002 · Admin: +8801711000005 · Farmer: +8801711000001',
              )}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant={otpRequested ? 'secondary' : 'primary'}
                icon="phone"
                disabled={busy}
                onClick={() => void handleRequestOtp()}
              >
                {t('ওটিপি পাঠান', 'Send OTP Code')}
              </Button>
            </div>

            <div className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-3">
              <Field
                label={t('৬-সংখ্যার ওটিপি কোড', '6-Digit Verification Code')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                autoComplete="one-time-code"
                hint={t('যাচাইকরণ কোড: 123456', 'Verification code: 123456')}
              />
              <Button
                variant="primary"
                icon="check"
                disabled={busy}
                onClick={() => void handleVerifyOtp()}
              >
                {t('যাচাই করে প্রবেশ করুন', 'Verify & Enter Workspace')}
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
