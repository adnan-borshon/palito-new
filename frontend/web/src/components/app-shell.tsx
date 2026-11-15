'use client';

import Image from 'next/image';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEMO_ACCOUNTS, type DemoScenario, type Role } from '@palito/shared';
import { useWebApp } from '@/providers/web-provider.tsx';
import {
  canonicalSidebarScreen,
  mobileDeepLink,
  roleNames,
  roleNavItems,
  roleSubtitles,
  webHref,
} from '@/navigation.ts';
import { Badge, Button, ModalDialog, WebIcon } from '@/components/ui.tsx';

export function AppShell({
  role,
  activeScreen,
  activeId,
  children,
}: {
  role: Role;
  activeScreen: string;
  activeId?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const {
    state,
    user,
    locale,
    t,
    run,
    busy,
    error,
    feedback,
    clearError,
    clearFeedback,
    mobileHandoff,
    openMobileHandoff,
    closeMobileHandoff,
  } = useWebApp();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const navItems = roleNavItems[role] ?? roleNavItems.farmer;
  const unreadCount = state.notifications.filter(
    (item) => item.userId === user?.id && !item.read,
  ).length;

  const highlightedScreen = canonicalSidebarScreen(role, activeScreen);

  function badgeCountFor(screen: string): number | undefined {
    if (screen === 'notifications') return unreadCount > 0 ? unreadCount : undefined;
    if (role === 'bank' && screen === 'applications') {
      const c = state.loans.filter(
        (l) => (!user?.id || l.bankId === user.id) && l.status === 'submitted',
      ).length;
      return c > 0 ? c : undefined;
    }
    if (role === 'vet' && screen === 'appointments') {
      const c = state.appointments.filter(
        (a) => a.vetId === user?.id && ['requested', 'accepted', 'in_progress'].includes(a.status),
      ).length;
      return c > 0 ? c : undefined;
    }
    if (role === 'vet' && screen === 'reviews') {
      const c = state.claims.filter(
        (cl) => (!user?.id || cl.vetId === user.id) && cl.status === 'vet_review',
      ).length;
      return c > 0 ? c : undefined;
    }
    if (role === 'insurer' && screen === 'applications') {
      const c = state.policies.filter(
        (p) => (!user?.id || p.insurerId === user.id) && p.status === 'submitted',
      ).length;
      return c > 0 ? c : undefined;
    }
    if (role === 'insurer' && screen === 'claims') {
      const c = state.claims.filter(
        (cl) =>
          (!user?.id || cl.insurerId === user.id) &&
          ['submitted', 'manual_review', 'vet_review', 'approved'].includes(cl.status),
      ).length;
      return c > 0 ? c : undefined;
    }
    if (role === 'farmer' && screen === 'devices') {
      const myAnimalIds = new Set(
        state.animals.filter((a) => a.ownerId === user?.id).map((a) => a.id),
      );
      const c = state.alerts.filter(
        (al) => myAnimalIds.has(al.animalId) && ['open', 'escalated'].includes(al.status),
      ).length;
      return c > 0 ? c : undefined;
    }
    return undefined;
  }

  async function handleSwitchAccount(accountId: string, targetRole: Role) {
    const res = await run({ type: 'auth.switch', userId: accountId });
    if (res.ok) {
      setSwitcherOpen(false);
      router.push(webHref(targetRole, 'home'));
    }
  }

  async function handleLogout() {
    await run({ type: 'auth.logout' });
    router.push('/login');
  }

  const seenRoles = new Set<Role>();
  const deepLinkUrl = mobileDeepLink(
    mobileHandoff?.role ?? role,
    mobileHandoff?.screen ?? activeScreen,
    mobileHandoff?.id ?? activeId,
  );

  return (
    <div className="min-h-dvh flex flex-col lg:flex-row bg-[#F8FAFC] text-[#1F2937]">
      {/* Left Desktop Navigation Sidebar */}
      <aside className="w-full lg:w-64 lg:shrink-0 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] bg-white flex flex-col justify-between lg:min-h-dvh lg:sticky lg:top-0">
        <div className="p-4 lg:p-5 flex flex-col gap-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between gap-3">
            <Link href={webHref(role, 'home')} className="flex items-center gap-3">
              <Image
                unoptimized
                width={36}
                height={36}
                src="/images/palito-mark.png"
                alt="Palito"
                className="w-9 h-9 rounded-[10px] object-contain bg-[#EBF4EE] p-1"
              />
              <div>
                <div className="text-lg font-bold tracking-tight text-[#0A401E] leading-none">
                  পালিতো · Palito
                </div>
                <div className="text-xs font-semibold text-[#15803D] mt-1">
                  {roleNames[role][locale]}
                </div>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSwitcherOpen(true)}
              className="lg:hidden rounded-[8px] border border-[#E2E8F0] px-2.5 py-1.5 text-xs font-semibold text-[#1F2937]"
            >
              {t('অ্যাকাউন্ট', 'Switch')}
            </button>
          </div>

          {/* Role Navigation Links */}
          <nav
            aria-label={t('প্রধান নেভিগেশন', 'Primary navigation')}
            className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0"
          >
            {navItems.map((item) => {
              const isActive =
                activeScreen === item.screen || highlightedScreen === item.screen;
              const badgeCount = badgeCountFor(item.screen);
              return (
                <Link
                  key={item.screen}
                  href={webHref(role, item.screen)}
                  onClick={() => {
                    clearError();
                    clearFeedback();
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#EBF4EE] text-[#0F602D] border border-[#D8E9DE]'
                      : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1F2937] border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <WebIcon
                      name={item.icon}
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#15803D]' : 'text-[#64748B]'
                      }`}
                    />
                    <span>{item.label[locale]}</span>
                  </span>
                  {badgeCount !== undefined ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                        isActive
                          ? 'bg-[#15803D] text-white'
                          : 'bg-[#FFF1F2] text-[#BE123C]'
                      }`}
                    >
                      {badgeCount}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Account & Mobile Bridge Card */}
        <div className="hidden lg:flex flex-col gap-3 border-t border-[#E2E8F0] p-4 bg-[#F8FAFC]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#15803D] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {(user ? (locale === 'bn' ? user.nameBn : user.name) : 'P').slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#1F2937] truncate">
                {user ? (locale === 'bn' ? user.nameBn : user.name) : t('অতিথি', 'Guest')}
              </div>
              <div className="text-xs text-[#64748B] truncate">
                {user?.district ?? 'Bangladesh'} · {roleNames[role][locale]}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon="users"
              onClick={() => setSwitcherOpen(true)}
              data-testid="open-account-switcher"
            >
              {t('রোল পরিবর্তন', 'Switch Role')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon="smartphone"
              onClick={() =>
                openMobileHandoff({
                  role,
                  screen: activeScreen,
                  id: activeId,
                  title: roleSubtitles[role][locale],
                })
              }
            >
              {t('মোবাইল অ্যাপ', 'Mobile App')}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Sticky Top Context Bar */}
        <header className="sticky top-0 z-20 h-16 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xs px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-base font-bold text-[#1F2937] truncate">
              {activeScreen === 'emergency'
                ? t('জরুরি ট্রায়াজ কিউ', 'Emergency Alert Triage')
                : activeScreen === 'passport'
                  ? t('ডিজিটাল স্বাস্থ্য পাসপোর্ট', 'Digital Health Passport')
                  : activeScreen === 'schedule'
                    ? t('চেম্বার সময়সূচি ও প্রাপ্যতা', 'Clinic Schedule & Availability')
                    : activeScreen === 'demo'
                      ? t('ডেমো ও পরিবেশ নিয়ন্ত্রণ', 'Account & Environment Controls')
                      : activeScreen === 'support'
                        ? t('সহায়তা কেন্দ্র', 'Support Desk')
                        : navItems.find((i) => i.screen === activeScreen)?.label[locale] ??
                          navItems.find((i) => i.screen === highlightedScreen)?.label[locale] ??
                          roleNames[role][locale]}
            </div>
            <div className="text-xs text-[#64748B] truncate hidden sm:block">
              {roleSubtitles[role][locale]}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {state.settings.offline ? (
              <Badge tone="danger">
                <WebIcon name="alert" className="w-3.5 h-3.5" />
                {t('অফলাইন মোড', 'Offline Mode')}
              </Badge>
            ) : null}

            {/* Mobile App Handoff Trigger */}
            <button
              type="button"
              onClick={() =>
                openMobileHandoff({
                  role,
                  screen: activeScreen,
                  id: activeId,
                })
              }
              className="hidden md:inline-flex items-center gap-1.5 rounded-[10px] border border-[#D8E9DE] bg-[#EBF4EE] px-3 py-1.5 text-xs font-semibold text-[#0F602D] hover:bg-[#D8E9DE] cursor-pointer"
            >
              <WebIcon name="qr" className="w-3.5 h-3.5" />
              <span>{t('মোবাইলে খুলুন', 'Open on Mobile')}</span>
            </button>

            {/* Bilingual Language Toggle */}
            <div
              role="group"
              aria-label={t('ভাষা নির্বাচন', 'Language selection')}
              className="inline-flex rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-0.5"
            >
              <button
                type="button"
                onClick={() => void run({ type: 'session.locale', locale: 'bn' }, { silent: true })}
                className={`rounded-[8px] px-2.5 py-1 text-xs font-bold cursor-pointer ${
                  locale === 'bn'
                    ? 'bg-[#15803D] text-white'
                    : 'text-[#475569] hover:text-[#1F2937]'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => void run({ type: 'session.locale', locale: 'en' }, { silent: true })}
                className={`rounded-[8px] px-2.5 py-1 text-xs font-bold cursor-pointer ${
                  locale === 'en'
                    ? 'bg-[#15803D] text-white'
                    : 'text-[#475569] hover:text-[#1F2937]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Notifications Shortcut */}
            <Link
              href={webHref(role, 'notifications')}
              onClick={() => {
                clearError();
                clearFeedback();
              }}
              aria-label={t('বিজ্ঞপ্তি দেখুন', 'View notifications')}
              className="relative rounded-[10px] border border-[#E2E8F0] bg-white p-2 text-[#475569] hover:bg-[#F8FAFC] hover:text-[#1F2937]"
            >
              <WebIcon name="bell" className="w-4 h-4" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#BE123C] px-1 text-[10px] font-bold text-white tabular-nums">
                  {unreadCount}
                </span>
              ) : null}
            </Link>

            <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
              {t('লগআউট', 'Sign Out')}
            </Button>
          </div>
        </header>

        {/* Global Action Feedback & Error Banner */}
        {error || feedback ? (
          <div className="mx-auto w-full max-w-[1440px] px-4 lg:px-8 pt-4">
            <div
              role="status"
              aria-live="polite"
              className={`flex items-center justify-between gap-3 rounded-[12px] border px-4 py-3 text-sm font-medium ${
                error
                  ? 'border-[#FECDD3] bg-[#FFF1F2] text-[#BE123C]'
                  : 'border-[#D8E9DE] bg-[#EBF4EE] text-[#0F602D]'
              }`}
            >
              <div className="flex items-center gap-2">
                <WebIcon name={error ? 'alert' : 'check'} className="w-4 h-4 shrink-0" />
                <span>{error ?? feedback}</span>
              </div>
              <button
                type="button"
                onClick={error ? clearError : clearFeedback}
                aria-label="Dismiss message"
                className="rounded p-1 hover:bg-black/5 cursor-pointer"
              >
                <WebIcon name="close" className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Centered Capped Container (Hallmark Floor 44d: max 1440px) */}
        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 lg:px-8 py-6 flex flex-col gap-6">
          {children}
        </main>
      </div>

      {/* Role & Environment Switcher Modal */}
      <ModalDialog
        open={switcherOpen}
        onClose={() => setSwitcherOpen(false)}
        title={t('অ্যাকাউন্ট ও পরিবেশ পরিবর্তন', 'Account & Environment Switcher')}
        subtitle={t(
          'একই ব্রাউজারে তাৎক্ষণিকভাবে ব্যাংক, পশুচিকিৎসক, প্রশাসক, বীমা বা খামারি রোলে পরিবর্তন করুন।',
          'Switch seamlessly between Bank, Veterinarian, Administrator, Insurer, and Farmer workspaces.',
        )}
        maxWidth="max-w-2xl"
      >
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(state.users.filter((a) => a.status === 'active').length
              ? state.users.filter((a) => a.status === 'active')
              : DEMO_ACCOUNTS
            ).map((account) => {
              const isCurrent = user?.id === account.id;
              const isFirstForRole = !seenRoles.has(account.role);
              seenRoles.add(account.role);
              return (
                <button
                  key={account.id}
                  type="button"
                  disabled={busy}
                  data-testid={
                    isFirstForRole ? `switch-${account.role}` : `switch-user-${account.id}`
                  }
                  onClick={() => void handleSwitchAccount(account.id, account.role)}
                  className={`flex items-start justify-between gap-3 rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? 'border-[#15803D] bg-[#EBF4EE]/70'
                      : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#1F2937]">
                        {locale === 'bn' ? account.nameBn : account.name}
                      </span>
                      <Badge tone={isCurrent ? 'brand' : 'neutral'}>
                        {roleNames[account.role][locale]}
                      </Badge>
                    </div>
                    <div className="text-xs text-[#64748B] mt-1 tabular-nums">
                      {account.phone} · {account.district}
                    </div>
                  </div>
                  {isCurrent ? (
                    <WebIcon name="check" className="w-5 h-5 text-[#15803D] shrink-0" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="border-t border-[#E2E8F0] pt-4 flex flex-col gap-3">
            <div className="text-xs font-semibold text-[#475569]">
              {t('সিস্টেম সময় ও নেটওয়ার্ক নিয়ন্ত্রণ', 'System Time & Connectivity Controls')}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                icon="clock"
                onClick={() => void run({ type: 'demo.advanceTime', hours: 4 })}
              >
                {t('+৪ ঘণ্টা (সতর্কতা এসকেলেট)', '+4 Hours (Alert Escalation)')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon="clock"
                onClick={() => void run({ type: 'demo.advanceTime', hours: 24 })}
              >
                {t('+২৪ ঘণ্টা', '+24 Hours')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon="clock"
                onClick={() => void run({ type: 'demo.advanceTime', hours: 24 * 7 })}
              >
                {t('+৭ দিন (দাবি ফলোআপ)', '+7 Days (Claim Follow-up)')}
              </Button>
              <Button
                variant={state.settings.offline ? 'danger' : 'outline'}
                size="sm"
                icon="radio"
                onClick={() =>
                  void run({ type: 'demo.offline', offline: !state.settings.offline })
                }
              >
                {state.settings.offline
                  ? t('অনলাইনে ফিরুন', 'Go Online')
                  : t('অফলাইন পরীক্ষা', 'Test Offline Mode')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon="alert"
                disabled={busy}
                onClick={() => void run({ type: 'demo.failNext' })}
              >
                {t('পরের অ্যাকশন ব্যর্থতা পরীক্ষা', 'Test Retry on Next Action')}
              </Button>
              {(['normal', 'health', 'insurance', 'lending', 'empty'] as DemoScenario[]).map(
                (scen) => (
                  <Button
                    key={scen}
                    variant="ghost"
                    size="sm"
                    icon="refresh"
                    onClick={() => void run({ type: 'demo.reset', scenario: scen })}
                  >
                    {t(`রিসেট: ${scen}`, `Preset: ${scen}`)}
                  </Button>
                ),
              )}
            </div>
          </div>
        </div>
      </ModalDialog>

      {/* Web-to-Mobile Companion Bridge Modal */}
      <ModalDialog
        open={Boolean(mobileHandoff?.open)}
        onClose={closeMobileHandoff}
        title={t('পালিতো মোবাইল অ্যাপের সাথে সংযোগ', 'Continue on Palito Mobile App')}
        subtitle={t(
          'এই পৃষ্ঠার সকল কাজ ওয়েব ব্রাউজারেই সম্পন্ন করা যায়, অথবা নিচের লিংক/QR কোড দিয়ে সরাসরি মোবাইল অ্যাপের একই স্ক্রিনে যাওয়া যাবে।',
          'Every action on this screen works directly in your web browser, or you can jump straight to this exact screen in the Palito mobile app.',
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center rounded-[16px] border border-[#D8E9DE] bg-[#EBF4EE]/60 p-4">
            {/* Deterministic SVG QR matrix representation */}
            <div className="mx-auto flex flex-col items-center justify-center rounded-[12px] border border-[#E2E8F0] bg-white p-3 shadow-xs">
              <WebIcon name="qr" className="w-24 h-24 text-[#0A401E]" />
              <span className="text-[11px] font-semibold text-[#15803D] mt-1">
                Palito Deep Link
              </span>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-2">
              <Badge tone="brand">
                {t('১০০% ওয়েব ও মোবাইল সামঞ্জস্যপূর্ণ', 'Full Web & Mobile Parity')}
              </Badge>
              <div className="text-sm font-bold text-[#1F2937]">
                {mobileHandoff?.title ?? roleSubtitles[role][locale]}
              </div>
              <p className="text-xs text-[#475569]">
                {t(
                  'ক্যামেরা স্ক্যান, ভয়েস পরামর্শ, কলার পেয়ারিং এবং জিপিএস প্রমাণ ওয়েবেও সরাসরি ইনপুট দেওয়া যায় এবং মোবাইল অ্যাপেও একইভাবে কাজ করে।',
                  'Camera scans, voice consultations, IoT collar pairing, and GPS claim evidence can be submitted right here in the browser or via the mobile app.',
                )}
              </p>
              <div className="flex items-center gap-2 rounded-[8px] border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-mono text-[#0A401E]">
                <span className="truncate flex-1">{deepLinkUrl}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      void navigator.clipboard.writeText(deepLinkUrl);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }
                  }}
                  className="inline-flex items-center gap-1 font-sans font-semibold text-[#15803D] hover:underline cursor-pointer"
                >
                  <WebIcon name="copy" className="w-3.5 h-3.5" />
                  {copiedLink ? t('কপি হয়েছে', 'Copied') : t('কপি', 'Copy')}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="primary" onClick={closeMobileHandoff}>
              {t('ওয়েবেই কাজ চালিয়ে যান', 'Continue in Web Browser')}
            </Button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
